import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  translateToTokiPona(data: {
    text: string;
  }): { translation: string } | { error: string };

  generatePrompt(data: {
    language: string;
  }): { autonym: string } | { error: string };
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
