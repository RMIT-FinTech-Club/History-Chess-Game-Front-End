'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import basePath from "@/pathConfig";
import { useGlobalStorage } from '@/hooks/GlobalStorage';

type SocketContextType = {
    socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, accessToken } = useGlobalStorage();

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketInstance = io(`${basePath}`, {
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
      
        const onConnect = () => {
          console.log("Connected to WebSocket server");
          socketInstance.emit('identify', userId);
        };
      
        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', () => console.log("Disconnected from WebSocket server"));
        socketInstance.on('connect_error', (error) => console.error("Connection error:", error));
      
        setSocket(socketInstance);
      
        return () => {
          socketInstance.off('connect', onConnect);
          socketInstance.disconnect();
        };
      }, [userId]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
