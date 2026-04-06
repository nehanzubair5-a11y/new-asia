import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types.ts';
import { MOCK_DEALERS } from '../constants.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (isSupabaseConfigured) {
            const initializeSession = async () => {
                const { data } = await supabase.auth.getSession();
                const sessionUser = data.session?.user;
                if (!sessionUser?.email) return;

                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', sessionUser.email)
                    .maybeSingle();

                if (profile) {
                    setUser(profile as User);
                    localStorage.setItem('user', JSON.stringify(profile));
                }
            };
            initializeSession();
            return;
        }

        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('user');
        }
    }, []);

    const mockLogin = (email: string, role: string): User => {
        // This is a simulation. In a real app, you'd call an API.
        let userData: User = {
            _id: `user-${Date.now()}`,
            email: email,
            name: 'Demo User',
            role: role,
        };
        if (role === 'Dealer') {
            userData.name = MOCK_DEALERS[0].ownerName;
            userData.dealerId = MOCK_DEALERS[0]._id; // Assign first dealer for demo
        }
        if (role === 'Admin') {
             userData.name = "Admin User";
        }
        if (role === 'Super Admin') {
             userData.name = "Super Admin";
        }
        if (role === 'Product Manager') {
            userData.name = "Product Manager";
        }
        if (role === 'Booking Manager') {
            userData.name = "Booking Manager";
        }
        if (role === 'Stock Controller') {
            userData.name = "Stock Controller";
        }
        if (role === 'Finance / Auditor') {
             userData.name = "Finance Auditor";
        }
        if (role === 'Logistics') {
             userData.name = "Logistics Staff";
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    const login = async (email: string, passwordOrRole: string, roleMaybe?: string): Promise<User> => {
        if (!isSupabaseConfigured) {
            const role = roleMaybe || passwordOrRole;
            return mockLogin(email, role);
        }

        const password = passwordOrRole;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
            throw new Error(error?.message || 'Invalid credentials');
        }

        const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        const resolvedUser: User = (existingProfile as User) || {
            _id: data.user.id,
            email,
            name: email.split('@')[0],
            role: roleMaybe || 'Dealer',
        };

        if (!existingProfile) {
            const { error: profileError } = await supabase.from('users').upsert(resolvedUser, { onConflict: '_id' });
            if (profileError) throw profileError;
        }

        setUser(resolvedUser);
        localStorage.setItem('user', JSON.stringify(resolvedUser));
        return resolvedUser;
    };

    const register = async (payload: { email: string; password: string; name: string; role: string; dealerId?: string }): Promise<User> => {
        if (!isSupabaseConfigured) {
            return mockLogin(payload.email, payload.role);
        }

        const { data, error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
        });
        if (error || !data.user) {
            throw new Error(error?.message || 'Registration failed');
        }

        const userProfile: User = {
            _id: data.user.id,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            dealerId: payload.dealerId,
        };

        const { error: profileError } = await supabase.from('users').upsert(userProfile, { onConflict: '_id' });
        if (profileError) throw profileError;

        setUser(userProfile);
        localStorage.setItem('user', JSON.stringify(userProfile));
        return userProfile;
    };

    const logout = async () => {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateCurrentUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, register, logout, updateCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};