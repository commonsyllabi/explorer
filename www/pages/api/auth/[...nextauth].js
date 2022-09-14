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
                if (response.ok) {
                    // Any object returned will be saved in `user` property of the JWT
                    const data = await response.json()
                    console.log(`LOGIN SUCCESS USER UUID: ${JSON.stringify(data)}`)
                    const user = {
                        _id: data.user.uuid,
                        email: data.user.email,
                        name: data.user.name,
                        token: data.token
                    };
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token from a provider.
            // console.log(`SESSION - USER: ${user}`)
            // console.log(`SESSION - SESSION: ${JSON.stringify(session)}`)
            // console.log(`SESSION - TOKEN: ${JSON.stringify(token)}`)
            if (token.user) { 
                session.user = token.user
            }
            return session
        },
        async jwt({ token, user }) { 
            // console.log(`JWT - USER: ${user}`)
            // console.log(`JWT - TOKEN: ${JSON.stringify(token)}`)
            if (user) { 
                // console.log("There's a user object!!")
                token.user = user
            }
            return token;
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