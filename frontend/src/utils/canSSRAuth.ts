import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies, destroyCookie } from "nookies";
import { cookieName } from "./constants";
import { AuthTokenError } from "@/services/errors/AuthTokenError";


//função para paginas só users logados podem ter acessso.
export function canSSRAuth<P>(fn: GetServerSideProps<P>) {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(context);

        const token = cookies[cookieName];

        if(!token) {
            return{
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }

        try {
            return await fn(context);
        }catch(error) {
            if(error instanceof AuthTokenError ) {
                destroyCookie(context, cookieName)

                return {
                    redirect: {
                        destination: '/',
                        permanent: false
                    }
                }
            }
        }
    }
}