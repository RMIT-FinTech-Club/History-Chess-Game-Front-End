// src/context/WebSocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import basePath from "@/pathConfig"; // Assuming basePath is correctly configured
import { useGlobalStorage } from '@/hooks/GlobalStorage'; // Your custom hook for global storage

// --- Type Definitions ---
type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  userId: string | null;     // Added: userId for consistent access
  accessToken: string | null; // Added: accessToken for consistent access
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
  const { userId, accessToken } = useGlobalStorage();

  // State to hold the socket instance and its connection status
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Use a ref to store the socket instance to prevent re-creation issues
  const socketInstanceRef = useRef<Socket | null>(null);

  useEffect(() => {
    // --- Connection Logic ---
    // Only attempt to connect if userId and accessToken are available
    // AND a socket instance doesn't already exist in the ref.
    if (!userId || !accessToken) {
      console.warn("SocketContext: userId or accessToken missing. Cannot establish socket connection.");
      // If user logs out or token becomes invalid while connected, disconnect
      if (socketInstanceRef.current) {
        console.log("SocketContext: User logged out or token missing, disconnecting existing socket.");
        socketInstanceRef.current.disconnect();
        socketInstanceRef.current = null; // Clear the ref
        setSocket(null);
        setIsConnected(false);
      }
      return; // Exit if authentication details are missing
    }

    // If a socket instance already exists and the user is authenticated, do nothing.
    // This prevents re-creating the socket on every re-render if dependencies haven't truly changed meaningfully.
    if (socketInstanceRef.current) {
      console.log("SocketContext: Socket instance already exists. Skipping re-initialization.");
      return;
    }

    console.log("SocketContext: Initializing new Socket.IO instance for userId:", userId);

    // Define socket connection options
    const socketOptions = {
      autoConnect: true, // Attempt to connect immediately
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: {
        // Send userId in the query for initial identification on the server
        userId: userId,
      },
      // Prefer extraHeaders for Bearer Token authentication if your backend supports it
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`
      },
      withCredentials: true // Important for handling cookies/sessions if used
    };

    // Create the new socket instance
    const newSocketInstance = io(`${basePath}`, socketOptions);
    socketInstanceRef.current = newSocketInstance; // Store in ref
    setSocket(newSocketInstance); // Update state

    // --- Event Handlers ---
    const onConnect = () => {
      console.log("SocketContext: Connected to WebSocket server.");
      setIsConnected(true);
      // Emit 'identify' event after connection to associate socket with userId
      newSocketInstance.emit('identify', userId);
    };

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      console.log("SocketContext: Disconnected from WebSocket server. Reason:", reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        console.warn("SocketContext: Server initiated disconnect (e.g., invalid token, logout).");
        // You might want to handle re-authentication or token refresh here if appropriate
      }
    };

    const onConnectError = (error: Error) => {
      console.error("SocketContext: Connection error:", error);
      setIsConnected(false);
      // Optionally toast an error here if it's the primary connection point
      // toast.error(`Socket connection failed: ${error.message}`);
    };

    // Register event listeners
    newSocketInstance.on('connect', onConnect);
    newSocketInstance.on('disconnect', onDisconnect);
    newSocketInstance.on('connect_error', onConnectError);

    // --- Cleanup Function ---
    return () => {
      // Disconnect and clean up listeners when component unmounts or dependencies change
      if (socketInstanceRef.current) {
        console.log("SocketContext: Cleaning up socket instance and listeners.");
        newSocketInstance.off('connect', onConnect);
        newSocketInstance.off('disconnect', onDisconnect);
        newSocketInstance.off('connect_error', onConnectError);
        newSocketInstance.disconnect(); // Disconnect the socket
        socketInstanceRef.current = null; // Clear the ref
      }
    };
  }, [userId, accessToken]); // Re-run effect if userId or accessToken changes

  // --- Provide Context Values ---
  // Make socket, connection status, userId, and accessToken available to children
  return (
    <SocketContext.Provider value={{ socket, isConnected, userId, accessToken }}>
      {children}
    </SocketContext.Provider>
  );
};

// --- Custom Hook to Consume Context ---
// Renamed export to `useSocketContext` to avoid naming conflicts with
// other `useSocket` hooks that might exist in your application.
export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};