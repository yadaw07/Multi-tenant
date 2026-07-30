import { currentUser } from '@clerk/nextjs/server';
import prisma from './prisma';

export async function syncUserToDatabase() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) return null;

    const name = `${clerkUser.fullName || ''}`.trim();
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';

    // Ckeck if user exist in db
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (dbUser) {
      // Update the existing user
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { email, name: name || dbUser.name },
      });
    } else {
      // Create new user
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email,
          name,
        },
      });
    }

    return dbUser;
  } catch (error) {
    console.error('Error syncing from clerk', error);
    throw error;
  }
}
