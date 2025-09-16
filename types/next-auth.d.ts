
import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      subscriptionType?: string
      firstName?: string | null
      lastName?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    subscriptionType?: string
    firstName?: string | null
    lastName?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    subscriptionType?: string
    firstName?: string | null
    lastName?: string | null
  }
}
