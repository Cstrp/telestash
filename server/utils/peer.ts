import type { TelegramClient } from "telegram";
import { Api } from "telegram";

export const resolvePeer = async (
  client: TelegramClient,
  folderId: string | undefined,
) => {
  if (!folderId || folderId === "null" || folderId === "me") return "me";
  return client.getEntity(folderId);
};

export const resolveInputPeer = async (
  client: TelegramClient,
  folderId: string | undefined,
) => {
  if (!folderId || folderId === "null" || folderId === "me") {
    return new Api.InputPeerSelf();
  }
  return client.getInputEntity(folderId);
};
