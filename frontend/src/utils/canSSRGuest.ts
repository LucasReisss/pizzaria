import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";
import { cookieName } from "./constants";

//função para paginas que só pode ser acessadas por visitantes
export function canSSRGuest<P>(fn: GetServerSideProps<P>) {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {

        const cookies = parseCookies(context)
        console.log('cookie',cookieName)
        // Se o cara tentar acessar a pagina porem tendo já um login salvo redirecionamos
        if(cookies[`${cookieName}`]) {
            return {
                redirect: {
                    destination: '/dashboard',
                    permanent: false
                }
            }
        }

        return await  fn(context);
    }
}