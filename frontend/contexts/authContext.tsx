import { login, register } from "@/services/authService";
import { AuthContextProps, DecodedTokenProps, UserProps } from "@/types";
import { router, useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import { connectSocket, disconnectSocket } from "@/socket/socket";

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateToken: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const Router = useRouter();

  useEffect(()=>{
    loadToken();
  }, []);

  const loadToken = async() => {
    const storedToken = await AsyncStorage.getItem('token');
    if(storedToken){
      try {
        const decoded = jwtDecode<DecodedTokenProps>(storedToken);
        if(decoded.exp && decoded.exp < Date.now()/1000){
            //token has expired and we have to navigate to the welcome page
            await AsyncStorage.removeItem('token');
            gotoWelcomePage();
            return;
        }

        // if token is not expired and user is loged in
        setToken(storedToken);
        await connectSocket();
        setUser(decoded.user);
        gotoHomePage();

      } catch (error) {
        //go to welcome page
        console.error("Error loading token: ", error);
      }
    } else {
      gotoWelcomePage();
     }
  };
  //goto home page after 1.5 seconds
  const gotoHomePage = () => {
    setTimeout(() => {
      Router.replace('/(main)/home')
    }, 1500)
  }

  const gotoWelcomePage = () => {
    setTimeout(() => {
      Router.replace('/(auth)/welcome')
    }, 1500)

  }

  const updateToken = async (token: string) => {
    if(token){
      setToken(token);
      await AsyncStorage.setItem('token', token);

      //decode token (user)
      const decoded = jwtDecode<DecodedTokenProps>(token);
      console.log("decoded token: ", decoded);
      setUser(decoded.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await login(email, password);
    await updateToken(response.token);
    await connectSocket();
    router.replace("/(main)/home")
};

const signUp = async (
    email: string,
    password: string,
    name: string,
    avatar?: string | null
  ) => {
     const response = await register (email, password, name, avatar);
    await updateToken(response.token);
    await connectSocket();
    router.replace("/(main)/home")
  };
  const signOut = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
    disconnectSocket();
    router.replace("/(auth)/welcome")
  };
  return (
    <AuthContext.Provider value={{ user, token, signIn, signUp, signOut, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
