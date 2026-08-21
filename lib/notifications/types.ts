export interface PushSubscriptionPreference {
  userId: string;
  airportCodes: readonly string[];
  dealTypes: readonly string[];
  enabled: boolean;
}

export interface PushMessage {
  title: string;
  body: string;
  url: string;
  imageUrl?: string;
}

export interface PushProvider {
  send(topic: string, message: PushMessage): Promise<{ messageId: string }>;
}
