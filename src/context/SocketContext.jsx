import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ENV } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // We only initialize the socket once per app load
        // Note: Replace '/api' in ENV.API_URL since socket.io usually connects to the host root
        const socketUrl = ENV.API_URL.replace('/api', '');
        
        const newSocket = io(socketUrl, {
            autoConnect: false, // Wait until we know auth status
        });

        // Whenever the user logs in, we should connect and join their specific room.
        // For simplicity, we check AsyncStorage on mount. In a robust setup, 
        // you'd call a function here when the user logs in.
        const connectSocket = async () => {
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
                newSocket.connect();
                
            }
        };

        connectSocket();
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
