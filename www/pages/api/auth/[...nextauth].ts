import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { URLSearchParams } from "url";

export const authOptions: NextAuthOptions = {
    secret: "sozialegerechtigkeit",
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                username: { label: "Email", type: "email", placeholder: "you@mail.com" },
                password: { label: "Password", type: "password" }
            },
            // @ts-ignore
            async authorize(credentials) {
                if (!credentials) return null;

                var b = new URLSearchParams();
                b.append("email", credentials.username);
                b.append("password", credentials.password);

                const login_endpoint = new URL('/login', process.env.API_URL)
                const response = await fetch(login_endpoint.href, {
                    method: 'POST',
                    body: b,
                    redirect: 'follow'
                })
                if (response.ok) {
                    const data = await response.json()
                    const user = {
                        _id: data.user.uuid,
                        email: data.user.email,
                        name: data.user.name,
                        token: data.token
                    }
                    return user
                } else {
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user
            }
            return token;
        },
        async session({ session, token, user }) {
            if (token.user) {
                session.user = token.user as { _id: string, token: string }
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
        newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    },
    session: {
        maxAge: 3540,
        strategy: 'jwt'
    },
}

export default NextAuth(authOptions)