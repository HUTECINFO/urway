import { MockFlightProvider, mockFlightProvider } from "./mock-flight-provider";
import { SerpApiProvider, type SerpApiProviderOptions } from "./serp-api-provider";
import type { FlightDealProvider } from "./types";

export class ProviderRegistry {
  private readonly providers = new Map<string, FlightDealProvider>();

  constructor(providers: readonly FlightDealProvider[] = []) {
    providers.forEach((provider) => this.register(provider));
  }

  register(provider: FlightDealProvider, options: { replace?: boolean } = {}): this {
    const id = provider.id.trim().toLowerCase();
    if (!id) throw new TypeError("Provider id is required");
    if (this.providers.has(id) && !options.replace) {
      throw new Error(`Provider already registered: ${id}`);
    }
    this.providers.set(id, provider);
    return this;
  }

  unregister(providerId: string): boolean {
    return this.providers.delete(providerId.trim().toLowerCase());
  }

  get(providerId: string): FlightDealProvider | undefined {
    return this.providers.get(providerId.trim().toLowerCase());
  }

  require(providerId: string): FlightDealProvider {
    const provider = this.get(providerId);
    if (!provider) throw new RangeError(`Unknown flight deal provider: ${providerId}`);
    return provider;
  }

  list(): readonly FlightDealProvider[] {
    return [...this.providers.values()];
  }

  active(): readonly FlightDealProvider[] {
    return this.list().filter((provider) => provider.isActive);
  }

  clear(): void {
    this.providers.clear();
  }
}

export interface DefaultProviderRegistryOptions {
  mock?: boolean | ConstructorParameters<typeof MockFlightProvider>[0];
  serpApi?: false | SerpApiProviderOptions;
}

export function createDefaultProviderRegistry(
  options: DefaultProviderRegistryOptions = {},
): ProviderRegistry {
  const providers: FlightDealProvider[] = [];
  if (options.mock !== false) {
    providers.push(
      options.mock && typeof options.mock === "object"
        ? new MockFlightProvider(options.mock)
        : new MockFlightProvider(),
    );
  }
  if (options.serpApi !== undefined && options.serpApi !== false) {
    providers.push(new SerpApiProvider(options.serpApi));
  }
  return new ProviderRegistry(providers);
}

export const providerRegistry = new ProviderRegistry([mockFlightProvider]);
