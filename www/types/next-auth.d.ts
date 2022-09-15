import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   * Custom fields added are token and _id
   */
  interface Session {
    user: {
      token: string,
      _id: string
    } & DefaultSession["user"]
  }
}