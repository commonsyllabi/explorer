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
                var h = new Headers();
                h.append("Content-Type", "application/x-www-form-urlencoded");

                var b = new URLSearchParams();
                b.append("email", credentials.username);
                b.append("password", credentials.password);

                var options = {
                    method: 'POST',
                    headers: h,
                    body: b,
                    redirect: 'follow'
                };

                const login_endpoint = new URL('/login', process.env.API_URL)
                const response = await fetch(login_endpoint.href, options)
                if (response.ok){
                    const user = await response.json()
                    console.log(`Login success, user is: ${JSON.stringify(user)}`)
                    return user
                }else{
                    return null
                }
            }
        })
    ],
    callbacks: {
            async session({ session, token, user }) {
                // Send properties to the client, like an access_token from a provider.
                console.log(`USER: ${user}`)
                console.log(`SESSION: ${JSON.stringify(session)}`)
                console.log(`TOKEN: ${JSON.stringify(token)}`)
                // session.uuid = user.uuid
                return session
            }
        },
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
        newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    }
})