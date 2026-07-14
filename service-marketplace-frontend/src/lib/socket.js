import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket) return;

    this.socket = io(BASE_URL, {
      path: '/socket.io/',
      auth: { token },
      transports: ['websocket'], // Prefer websocket for production performance
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNewMessage(callback) {
    if (!this.socket) return;
    this.socket.on('new_message', callback);
  }

  offNewMessage(callback) {
    if (!this.socket) return;
    this.socket.off('new_message', callback);
  }

  onMessagesRead(callback) {
    if (!this.socket) return;
    this.socket.on('messages_read', callback);
  }

  offMessagesRead(callback) {
    if (!this.socket) return;
    this.socket.off('messages_read', callback);
  }

  sendMessage(receiverId, messageText) {
    if (!this.socket) return;
    this.socket.emit('send_message', {
      receiver_id: receiverId,
      message_text: messageText,
    });
  }

  markRead(otherUserId) {
    if (!this.socket) return;
    this.socket.emit('mark_read', {
      other_user_id: otherUserId,
    });
  }
}

export const socketService = new SocketService();
