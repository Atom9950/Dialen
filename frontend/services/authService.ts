import { API_URL } from '@/constants';
import axios from 'axios';

export const login = async (email: string, password: string): Promise<{token:string}> => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        
        return response.data;

    } catch (error: any) {
        console.log("Error in login: ", error);
        const msg = error?.response?.data?.message || "Something went wrong";
        throw new Error(msg);
    }
}

export const register = async (email: string, password: string, name: string, avatar?: string | null): Promise<{token:string}> => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            name,
            avatar,
        });
        
        return response.data;
        
    } catch (error: any) {
        console.log("Error in register: ", error);
        const msg = error?.response?.data?.message || "Something went wrong";
        throw new Error(msg);
    }
}

export const logout = async (): Promise<void> => {
    try {
        const response = await axios.post(`${API_URL}/auth/logout`);
        
        return response.data;
        
    } catch (error: any) {
        console.log("Error in logout: ", error);
        const msg = error?.response?.data?.message || "Something went wrong";
        throw new Error(msg);
    }
}

 