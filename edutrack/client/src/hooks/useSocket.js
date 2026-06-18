import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/**
 * Initializes Socket.IO connection and joins the user's personal room.
 * Call this once from a top-level component (e.g. each Layout).
 */
const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('/', { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', user.id);
    });

    // Listen for risk alert notifications pushed from the server
    socketRef.current.on('risk_alert', (payload) => {
      toast.error(`⚠️ Risk alert: ${payload.message}`, { duration: 6000 });
    });

    socketRef.current.on('disconnect', () => {
      // silent — socket will auto-reconnect
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  return socketRef;
};

export default useSocket;
