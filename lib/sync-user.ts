import { currentUser } from '@clerk/nextjs/server';
import prisma from './prisma';

export async function syncUserToDatabase() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) return null;

    const name = `${clerkUser.fullName || ''}`.trim();
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';

    // First check by Clerk ID
    let dbUser = await prisma.user.findUnique({
      where: {
        clerkUserId: clerkUser.id,
      },
    });

    if (dbUser) {
      // User exists
      dbUser = await prisma.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          email,
          name: name || dbUser.name,
        },
      });
    } else {
      // Check whether this email already exists
      dbUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (dbUser) {
        // Existing database user → connect it to this Clerk account
        dbUser = await prisma.user.update({
          where: {
            id: dbUser.id,
          },
          data: {
            clerkUserId: clerkUser.id,
            name: name || dbUser.name,
          },
        });
      } else {
        // Completely new user
        dbUser = await prisma.user.create({
          data: {
            clerkUserId: clerkUser.id,
            email,
            name,
          },
        });
      }
    }

    return dbUser;
  } catch (error) {
    console.error('Error syncing from Clerk', error);
    throw error;
  }
}
