import * as signalR from '@microsoft/signalr';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7177';

/**
 * Creates and manages a SignalR connection to the chat hub.
 */
export function createChatConnection() {
  const token = localStorage.getItem('authToken');

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/chat`, {
      accessTokenFactory: () => localStorage.getItem('authToken'),
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  return connection;
}

/**
 * Joins a specific chat room.
 */
export async function joinChatRoom(connection, chatRoomId) {
  await connection.invoke('JoinChatRoom', chatRoomId);
}

/**
 * Sends a message to a chat room.
 */
export async function sendMessage(connection, chatRoomId, message) {
  await connection.invoke('SendMessage', chatRoomId, message);
}

/**
 * Marks a single message as read.
 */
export async function markMessageAsRead(connection, messageId) {
  await connection.invoke('MarkMessageAsRead', messageId);
}

/**
 * Marks all messages in a chat room as read.
 */
export async function markChatRoomAsRead(connection, chatRoomId) {
  await connection.invoke('MarkChatRoomAsRead', chatRoomId);
}

/**
 * Signals that the current user is typing in a chat room.
 */
export async function userTyping(connection, chatRoomId) {
  await connection.invoke('UserTyping', chatRoomId);
}

/**
 * Signals that the current user stopped typing in a chat room.
 */
export async function userStoppedTyping(connection, chatRoomId) {
  await connection.invoke('UserStoppedTyping', chatRoomId);
}
