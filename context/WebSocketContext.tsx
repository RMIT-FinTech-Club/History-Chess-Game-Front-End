'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import basePath from '@/config/pathConfig';
import { useGlobalStorage } from '@/hooks/GlobalStorage';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// --- Type Definitions ---
type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  userId: string | null;
  accessToken: string | null;
};

// --- Context Creation ---
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  userId: null,
  accessToken: null,
});

// --- Socket Provider Component ---
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  // Get userId and accessToken from your global storage
  const { userId, accessToken, clearAuth } = useGlobalStorage(); // Also get clearGlobalStorage
  const router = useRouter(); // Initialize router for redirection

  // State to hold the socket instance and its connection status
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Use a ref to store the socket instance to prevent re-creation issues
  const socketInstanceRef = useRef<Socket | null>(null);

  useEffect(() => {
    // --- Centralized Authentication Check ---
    if (!userId || !accessToken) {
      console.warn("SocketContext: userId or accessToken missing. Cannot establish socket connection.");

      // If a socket was previously connected, disconnect it.
      if (socketInstanceRef.current) {
        console.log("SocketContext: Disconnecting existing socket due to missing credentials.");
        socketInstanceRef.current.disconnect();
        socketInstanceRef.current = null; // Clear the ref
        setSocket(null);
        setIsConnected(false);
      }

      // Redirect user to login and show a toast
      toast.error("Your session has expired or is invalid. Please log in again.", { duration: 5000 });
      clearAuth(); // Clear any partial or old data
      router.push('/sign_in'); // Redirect to your login page
      return; // Stop further execution of this effect
    }

    // If a socket instance already exists and the user is authenticated, do nothing.
    if (socketInstanceRef.current) {
      console.log("SocketContext: Socket instance already exists and authenticated. Skipping re-initialization.");
      return;
    }

    console.log("SocketContext: Initializing new Socket.IO instance for userId:", userId);

    // Define socket connection options
    const socketOptions = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: {
        userId: userId,
      },
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`
      },
      withCredentials: true
    };

    // Create the new socket instance
    const newSocketInstance = io(`${basePath}`, socketOptions);
    socketInstanceRef.current = newSocketInstance; // Store in ref
    setSocket(newSocketInstance); // Update state

    // --- Event Handlers ---
    const onConnect = () => {
      console.log("SocketContext: Connected to WebSocket server.");
      setIsConnected(true);
      newSocketInstance.emit('identify', userId);
    };

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      console.log("SocketContext: Disconnected from WebSocket server. Reason:", reason);
      setIsConnected(false);
      if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
        // Consider redirecting or re-authenticating if server disconnects for authentication reasons
        console.warn("SocketContext: Server initiated disconnect or connection issue.");
        // You might choose to re-authenticate here more aggressively if needed
      }
    };

    const onConnectError = (error: Error) => {
      console.error("SocketContext: Connection error:", error);
      setIsConnected(false);
      // This might indicate an invalid token, so consider redirecting
      if (error.message.includes('Authentication error') || error.message.includes('invalid token')) {
        toast.error("Authentication failed. Please log in again.", { duration: 5000 });
        clearAuth();
        router.push('/sign_in');
      } else {
        toast.error(`Socket connection failed: ${error.message}`, { duration: 5000 });
      }
    };

    // Register event listeners
    newSocketInstance.on('connect', onConnect);
    newSocketInstance.on('disconnect', onDisconnect);
    newSocketInstance.on('connect_error', onConnectError);

    // --- Cleanup Function ---
    return () => {
      if (socketInstanceRef.current) {
        console.log("SocketContext: Cleaning up socket instance and listeners.");
        newSocketInstance.off('connect', onConnect);
        newSocketInstance.off('disconnect', onDisconnect);
        newSocketInstance.off('connect_error', onConnectError);
        newSocketInstance.disconnect(); // Disconnect the socket
        socketInstanceRef.current = null; // Clear the ref
      }
    };
  }, [userId, accessToken, router, clearAuth]); // Add router and clearGlobalStorage to dependencies

  // --- Provide Context Values ---
  return (
    <SocketContext.Provider value={{ socket, isConnected, userId, accessToken }}>
      {children}
    </SocketContext.Provider>
  );
};

// --- Custom Hook to Consume Context ---
export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};