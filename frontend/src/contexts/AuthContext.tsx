import { createContext, ReactNode, useState, useEffect } from "react";

import { api } from "@/services/apiClient";
import { cookieName } from "@/utils/constants";

import { destroyCookie, setCookie, parseCookies } from "nookies";
import Router from "next/router";

import { toast } from "react-toastify";

type AuthContextData = {
    user: UserProps;
    isAuthenticated: boolean;
    signIn: (credentials: SignInProps) => Promise<void>;
    signOut: () => void;
    signUp: (credentials: SignUpProps) => Promise<void>;
}

type SignInProps = {
    email: string;
    password: string;
}

type UserProps = {
    id: string;
    name: string;
    email: string;
}

type SignUpProps = {
    name: string;
    email: string;
    password: string;
}

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut() {
    try {
        destroyCookie(undefined, cookieName)
        Router.push('/')
    } catch{
        console.log('erro ao deslogar')
    }
}

export function AuthProvider( {children}: AuthProviderProps ) {

    const [user, setUser] = useState<UserProps>()
    const isAuthenticated = !!user;

    useEffect(() => {
        //tentar pegar algo no cookie
        const { cookieName: token } = parseCookies();

        if(token) {
            api.get('/me').then(response => {
                const { id, name, email } = response.data;

                setUser({
                    id,
                    name,
                    email
                })
            })
            .catch(() => {
                //Se deu erro deslogar o user.
                signOut();
            })
        }
    })

    async function signIn( {email, password}: SignInProps) {
        try {
            const response = await api.post('/session', {
                email,
                password
            })
            //console.log(response.data)

            const {id, name, token} = response.data;

            setCookie(undefined, cookieName, token, {
                maxAge: 60 * 60 * 24 * 30, // Expirar em 1 mes
                path: "/" // Quais caminhos terao acesso ao cookie
            })

            setUser({
                id,
                name,
                email
            })

            //Passar para proximas requisições o nosso token
            api.defaults.headers['Authorization'] = `Bearer ${token}`
            toast.success("Logado com sucesso!")

            //Redirecionar o user para o /dashboard
            Router.push('/dashboard')

        } catch (error) {
            toast.error("Error ao acessar!")
            console.log("ERRO AO ACESSA", error)
        }
    }

    async function signUp({name, email, password}: SignUpProps) {
        try {
            const response = await api.post('/users', {
                name,
                email,
                password
            })

            toast.success("Conta criada com sucesso!")

            Router.push('/')
        } catch (error) {
            toast.error("Erro ao cadastrar!")
            console.log("erro ao cadastrar ", error)
        }
    }

    return(
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, signUp }}>
            {children}
        </AuthContext.Provider>
    )
}