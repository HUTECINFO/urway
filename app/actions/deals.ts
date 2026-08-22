"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getDealById, reverifyDeal, transitionDeal, updateDeal } from "@/lib/data/deals";
import { DealStatus, DealType } from "@/lib/domain/types";

export interface AdminDealActionState {
  status?: "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
}

const idSchema = z.string().trim().min(1, "El identificador es obligatorio.").max(128, "Identificador inválido.").regex(/^[a-zA-Z0-9_-]+$/, "Identificador inválido.");
const dateSchema = z.iso.date({ error: "Usa una fecha válida." });
const webUrlSchema = z.url("Usa una URL válida.").refine((value) => /^https?:\/\//i.test(value), "La URL debe comenzar con http:// o https://.");

const editorSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(8, "Escribe al menos 8 caracteres.").max(140, "Máximo 140 caracteres."),
  description: z.string().trim().min(20, "Escribe al menos 20 caracteres.").max(1200, "Máximo 1,200 caracteres."),
  shortCopy: z.string().trim().min(8, "Escribe al menos 8 caracteres.").max(180, "Máximo 180 caracteres."),
  slug: z.string().trim().min(3, "El slug es demasiado corto.").max(100, "Máximo 100 caracteres.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones."),
  dealType: z.enum(DealType, { error: "Selecciona un tipo válido." }),
  price: z.coerce.number({ error: "Ingresa un precio válido." }).finite().positive("El precio debe ser mayor a cero.").max(10_000_000, "El precio es demasiado alto."),
  normalPrice: z.coerce.number({ error: "Ingresa un precio normal válido." }).finite().positive("El precio normal debe ser mayor a cero.").max(10_000_000, "El precio es demasiado alto."),
  savingsPercentage: z.coerce.number({ error: "Ingresa un ahorro válido." }).finite().min(0, "El ahorro no puede ser negativo.").max(100, "El ahorro no puede superar 100%."),
  departureDate: dateSchema,
  returnDate: z.preprocess((value) => value === "" ? undefined : value, dateSchema.optional()),
  imageUrl: webUrlSchema,
  bookingUrl: webUrlSchema,
}).strict().superRefine((value, context) => {
  if (value.normalPrice < value.price) {
    context.addIssue({ code: "custom", path: ["normalPrice"], message: "El precio normal no puede ser menor al precio del Drop." });
  }
  if (value.returnDate && value.returnDate < value.departureDate) {
    context.addIssue({ code: "custom", path: ["returnDate"], message: "La fecha de regreso debe ser posterior a la salida." });
  }
});

const transitionSchema = z.object({
  id: idSchema,
  nextStatus: z.enum(DealStatus, { error: "Estado inválido." }),
  rejectionReason: z.preprocess(
    (value) => typeof value === "string" && value.trim() ? value.trim() : undefined,
    z.string().min(3, "Indica un motivo de al menos 3 caracteres.").max(1000, "El motivo es demasiado largo.").optional(),
  ),
}).strict().superRefine((value, context) => {
  if (value.nextStatus === DealStatus.REJECTED && !value.rejectionReason) {
    context.addIssue({ code: "custom", path: ["rejectionReason"], message: "Indica el motivo del rechazo." });
  }
});

const reverifySchema = z.object({ id: idSchema }).strict();

function formErrors(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error);
  return Object.fromEntries(Object.entries(flattened.fieldErrors).filter((entry): entry is [string, string[]] => Boolean(entry[1])));
}

function refreshDealPaths(id: string, slug?: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/deals/${id}`);
  revalidatePath("/");
  if (slug) revalidatePath(`/drop/${slug}`);
}

export async function updateAdminDealAction(
  _state: AdminDealActionState,
  formData: FormData,
): Promise<AdminDealActionState> {
  await requireAdmin();
  const parsed = editorSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    shortCopy: formData.get("shortCopy"),
    slug: formData.get("slug"),
    dealType: formData.get("dealType"),
    price: formData.get("price"),
    normalPrice: formData.get("normalPrice"),
    savingsPercentage: formData.get("savingsPercentage"),
    departureDate: formData.get("departureDate"),
    returnDate: formData.get("returnDate"),
    imageUrl: formData.get("imageUrl"),
    bookingUrl: formData.get("bookingUrl"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Revisa los campos marcados antes de guardar.", errors: formErrors(parsed.error) };
  }

  try {
    const { id, ...patch } = parsed.data;
    const updated = await updateDeal(id, patch);
    refreshDealPaths(id, updated.slug);
    return { status: "success", message: "Los cambios del Drop se guardaron correctamente." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "No se pudo guardar el Drop." };
  }
}

export async function transitionAdminDealAction(
  _state: AdminDealActionState,
  formData: FormData,
): Promise<AdminDealActionState> {
  await requireAdmin();
  const parsed = transitionSchema.safeParse({
    id: formData.get("id"),
    nextStatus: formData.get("nextStatus"),
    rejectionReason: formData.get("rejectionReason"),
  });
  if (!parsed.success) return { status: "error", message: "La acción solicitada no es válida.", errors: formErrors(parsed.error) };

  try {
    const current = await getDealById(parsed.data.id, true);
    if (!current) return { status: "error", message: "El Drop ya no está disponible." };
    const updated = await transitionDeal(
      parsed.data.id,
      parsed.data.nextStatus,
      parsed.data.rejectionReason,
    );
    refreshDealPaths(updated.id, updated.slug);
    return { status: "success", message: `Estado actualizado a ${updated.status.toLowerCase()}.` };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "No se pudo actualizar el estado." };
  }
}

export async function reverifyAdminDealAction(
  _state: AdminDealActionState,
  formData: FormData,
): Promise<AdminDealActionState> {
  await requireAdmin();
  const parsed = reverifySchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { status: "error", message: "El Drop seleccionado no es válido.", errors: formErrors(parsed.error) };

  try {
    const updated = await reverifyDeal(parsed.data.id);
    refreshDealPaths(updated.id, updated.slug);
    return { status: "success", message: "Precio y disponibilidad marcados como verificados." };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "No se pudo volver a verificar el Drop." };
  }
}
