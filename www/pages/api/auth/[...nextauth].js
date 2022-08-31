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

                var requestOptions = {
                    method: 'POST',
                    headers: h,
                    body: b,
                    redirect: 'follow'
                };
                const response = await fetch(`${process.env.API_URL}/login`, requestOptions)
                if (response.ok){
                    const user = await response.json()
                    console.log(`logged in user ${user.name}`);
                    return user
                }else{
                    return null
                }
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
        newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    }
})