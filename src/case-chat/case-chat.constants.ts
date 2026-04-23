/** Event names — keep in sync with `nyaya-sahay-app/src/lib/case-chat-socket.ts`. */
export const CHAT_JOIN = 'chat.join';
export const CHAT_SEND = 'chat.send';
export const CHAT_MESSAGE = 'chat.message';
export const CHAT_NOTIFY = 'chat.notify';
export const CHAT_ERROR = 'chat.error';

export const MAX_CHAT_TEXT_LENGTH = 4000;
export const MAX_CHAT_ASSET_URL_LENGTH = 2048;
export const MAX_CHAT_ASSET_NAME_LENGTH = 512;

/** Redis TTL for clientMessageId idempotency keys (24 h). */
export const CHAT_IDEMPOTENCY_TTL_S = 86_400;

export const caseChatRoom = (caseId: string) => `case:${caseId}`;
export const userNotifyRoom = (userId: string) => `user:${userId}`;
export const ADMINS_NOTIFY_ROOM = 'admins';
