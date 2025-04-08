import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';

// Define the shape of the user object
interface User {
    id: number;
    email: string;
    roles: string[];
}

// Define what the AuthContext will provide
interface AuthContextType {
    user: User | null;
    login: (user: User) => Promise<void>;
    logout: () => Promise<void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

// Provider component that wraps the app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load user from secure store on mount
    useEffect(() => {
        SecureStore.getItemAsync('user').then((storedUser) => {
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        });
    }, []);

    // Save user to secure store on login
    const login = async (newUser: User) => {
        await SecureStore.setItemAsync('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    // Remove user from store on logout
    const logout = async () => {
        await SecureStore.deleteItemAsync('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
