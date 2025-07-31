import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket) return;

    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.io server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  onBusUpdate(callback) {
    if (this.socket) {
      this.socket.on('busUpdate', callback);
    }
  }

  onSimulationStatus(callback) {
    if (this.socket) {
      this.socket.on('simulationStatus', callback);
    }
  }

  offBusUpdate() {
    if (this.socket) {
      this.socket.off('busUpdate');
    }
  }

  offSimulationStatus() {
    if (this.socket) {
      this.socket.off('simulationStatus');
    }
  }
}

export default new SocketService(); 