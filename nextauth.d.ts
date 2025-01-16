import NextAuth, { DefaultSession } from 'next-auth';




declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: Date | null; // Asegúrate de que no sea opcional aquí
      role: string;
      image?: string | null;
    } & DefaultSession['user'];
  }
}
