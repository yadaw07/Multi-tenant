'use client';

import { Loader2, Mail, Shield, User } from 'lucide-react';

import { useOrganization, useUser } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ViewTeamPage = () => {
  const { user } = useUser();
  const { organization, isLoaded, memberships } = useOrganization({
    memberships: {
      infinite: true,
    },
  });

  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className='text-center py-20 text-gray-500'>
        No organization selected.
      </div>
    );
  }

  const members = memberships?.data || [];

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold'>Team Members</h1>
        <p className='text-gray-600'>
          {members.length} {members.length === 1 ? 'member' : 'members'} in{' '}
          {organization.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            People with access to this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className='text-center py-12'>
              <User className='w-12 h-12 text-gray-300 mb-4 mx-auto' />
              <p className='text-gray-600'>No team members yet</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {members.map((membership) => {
                const isCurrentUser =
                  membership.publicUserData?.userId === user?.id;

                return (
                  <div
                    key={membership.id}
                    className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg'
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      {membership.publicUserData?.imageUrl ? (
                        <img
                          src={membership.publicUserData.imageUrl}
                          alt={membership.publicUserData.identifier}
                          className='w-10 h-10 rounded-full shrink-0'
                        />
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0'>
                          <User className='w-5 h-5 text-blue-600' />
                        </div>
                      )}

                      <div className='min-w-0'>
                        <div className='font-medium flex items-center gap-2 flex-wrap'>
                          <span className='truncate'>
                            {membership.publicUserData?.firstName ||
                              membership.publicUserData?.identifier}{' '}
                            {membership.publicUserData?.lastName || ''}
                          </span>
                          {isCurrentUser && (
                            <Badge
                              variant='secondary'
                              className='text-xs shrink-0'
                            >
                              You
                            </Badge>
                          )}
                        </div>
                        <div className='text-sm text-gray-500 flex items-center gap-1 truncate'>
                          <Mail className='w-3 h-3 shrink-0' />
                          <span className='truncate'>
                            {membership.publicUserData?.identifier}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={
                        membership.role === 'org:admin' ? 'default' : 'outline'
                      }
                      className='flex items-center gap-1 self-start sm:self-auto shrink-0 w-fit'
                    >
                      <Shield className='w-3 h-3' />
                      {membership.role.replace('org:admin', 'owner')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewTeamPage;
