export const CHAT_JOIN = 'chat.join';
export const CHAT_SEND = 'chat.send';
export const CHAT_MESSAGE = 'chat.message';
export const CHAT_NOTIFY = 'chat.notify';
export const CHAT_ERROR = 'chat.error';

export const MAX_CHAT_TEXT_LENGTH = 4000;

export const caseChatRoom = (caseId: string) => `case:${caseId}`;

export const userNotifyRoom = (userId: string) => `user:${userId}`;
export const ADMINS_NOTIFY_ROOM = 'admins';
