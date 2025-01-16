import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';

import prisma from './lib/prisma';

interface CustomUser {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  role: string;
  image?: string | null;
}



export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/new-account',
  },

  callbacks: {

    authorized({ auth, request: { nextUrl } }) {
      console.log({ auth });
      console.log({ nextUrl });
      // const isLoggedIn = !!auth?.user;

      // const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      // if (isOnDashboard) {
      //   if (isLoggedIn) return true;
      //   return false; // Redirect unauthenticated users to login page
      // } else if (isLoggedIn) {
      //   return Response.redirect(new URL('/dashboard', nextUrl));
      // }
      return true;
    },

    jwt({ token, user }) {
      if (user && 'role' in user) {
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: 'emailVerified' in user ? user.emailVerified : null,
          role: user.role,
          image: user.image || null,
        };
      }
      return token;
    },
    

    session({ session, token }) {
      if (token.user) {
        session.user = token.user as CustomUser; // Este tipo ya es consistente
      }
      return session;
    }
    


  },



  providers: [

    Credentials({
      async authorize(credentials) {

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);


          if ( !parsedCredentials.success ) return null;

          const { email, password } = parsedCredentials.data;


        // Buscar el correo
          const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
          if (!user) return null;
          
          // Comparar las contraseñas
          if (!bcryptjs.compareSync(password, user.password)) return null;
          
          // Regresar el usuario sin la contraseña
          const { password: userPassword, ...rest } = user;
          console.log(userPassword);
          return rest;

      },
    }),


  ]
}



export const {  signIn, signOut, auth, handlers } = NextAuth( authConfig );