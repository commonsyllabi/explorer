import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export default NextAuth({
    secret: "double poney",
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            credentials: {
                username: { label: "Email", type: "email", placeholder: "you@mail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied
                var h = new Headers();
                h.append("Content-Type", "application/form-data");

                var b = new URLSearchParams();
                b.append("email", credentials.username);
                b.append("password", credentials.password);

                var options = {
                    method: 'POST',
                    headers: h,
                    body: b,
                    redirect: 'follow'
                };

                const apiUrl = process.env.NODE_ENV == 'test' ? 'http://backend_explorer:3046/' : process.env.NEXT_PUBLIC_API_URL;
                const login_endpoint = new URL('/login', apiUrl)
                const response = await fetch(login_endpoint.href, options)
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
                session.user = token.user
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
    callbacks: {
        async session({session, user, token}){
            console.log('user', JSON.stringify(user))
            console.log('token', JSON.stringify(token))
        }
    }
})