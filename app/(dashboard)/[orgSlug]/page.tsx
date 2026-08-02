import { auth } from '@clerk/nextjs/server';

import prisma from '@/lib/prisma';

import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Brain, FileText, Upload } from 'lucide-react';

import OrganizationStats from '@/components/organization/OrganizationStats';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const orgDashboardPage = async ({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) => {
  const { orgSlug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      _count: {
        select: {
          documents: true,
          members: true,
        },
      },
      documents: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
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

  const analyzedDocs = await prisma.document.count({
    where: { organizationId: organization.id, aiSummary: { not: null } },
  });

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold'>{organization.name} Dashboard</h1>
        <p className='text-gray-600 '>
          Welcome to your organization workspace.
        </p>
      </div>

      {/* Stats */}
      <OrganizationStats
        orgSlug={orgSlug}
        documentCount={organization._count.documents}
        memberCount={organization._count.members}
        analyzedDocs={analyzedDocs}
      />

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Latest uploads in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {organization.documents.length === 0 ? (
            <>
              <div className='text-center py-8'>
                <FileText className='h-12 w-12 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-600 mb-4'>No documents uploaded yet</p>
                <Link href={`/${orgSlug}/documents`} passHref>
                  <Button>
                    <Upload className='h-4 w-4 mr-2' />
                    Upload First Document
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className='space-y-4'>
                {organization.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between p-4 border rounded-lg'
                  >
                    <div className='flex items-center gap-3'>
                      <FileText className='h-5 w-5 text-gray-400' />

                      <div>
                        <p className='font-medium'>{doc.name}</p>
                        <p className='text-sm text-gray-500'>
                          Uploaded on{' '}
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {doc.aiSummary ? (
                      <Brain className='w-5 h-5 text-gray-500' />
                    ) : (
                      <Button variant='outline'>Analyze</Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default orgDashboardPage;
