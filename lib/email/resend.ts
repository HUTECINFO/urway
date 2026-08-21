import "server-only";

export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendTransactionalEmail(email: TransactionalEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "not_configured" as const };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: email.from ?? "UR WAY <drops@urway.mx>",
      to: [email.to],
      subject: email.subject,
      html: email.html,
    }),
  });
  if (!response.ok) throw new Error("No se pudo enviar el correo transaccional");
  return { sent: true as const };
}
