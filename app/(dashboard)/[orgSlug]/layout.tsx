import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from 'lucide-react';

import { redirect } from 'next/navigation';

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });

  if (!organization) {
    redirect('/select-org');
  }

  const membership = await prisma.organizationMember.findFirst({
    where: {
      user: { clerkUserId: userId },
      organizationId: organization.id,
    },
  });

  if (!membership) {
    redirect('/select-org');
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Organization Banner */}
      <Card className='w-full shadow-sm border'>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <h1 className='text-2xl font-semibold tracking-light'>
                {organization.name}
              </h1>
              <p className='text-sm text-muted-foreground'>
                Organization workspace
              </p>
            </div>
            <Badge className='px-4 py-1.5 font-medium'>{membership.role}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <main className='py-8'>
        <div className='container mx-auto px-4'>{children}</div>
      </main>
    </div>
  );
}
