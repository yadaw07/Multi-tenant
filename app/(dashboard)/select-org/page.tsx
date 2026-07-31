'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { ArrowRight, Building, Loader2, Plus } from 'lucide-react';

import { useOrganizationList, useUser } from '@clerk/nextjs';

const selectOrgPage = () => {
  const [orgName, setOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isrefreshing, setIsrefreshing] = useState(false);

  const { user } = useUser();
  const { userMemberships, isLoaded, setActive, createOrganization } =
    useOrganizationList({
      userMemberships: { infinite: true },
    });

  const handleCreateOrg = () => {};

  const handleSelectOrg = (org: any) => {};

  return (
    <div className='container mx-auto mx-w-4xl p-6'>
      <div className='mb-8 text-center '>
        <h1 className='text-3xl font-bold'>Welcome, {user?.firstName}!</h1>
        <p className='text-gray-600'>Selcet or create an organization</p>
      </div>

      {/* change to component */}

      {/* Create Organization */}
      <Card className='mb-8'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Plus className='w-5 h-5' />
              Create New Organization
            </CardTitle>
            <CardDescription>
              Start a new workspace for your team
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            <div className='flex gap-2'>
              <Input
                className='flex-1'
                placeholder='Enter organization name'
                value={orgName}
                disabled={isCreating}
                onChange={(e) => setOrgName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateOrg()}
              />
              <Button
                onClick={handleCreateOrg}
                disabled={isCreating || !orgName.trim()}
                className='min-w-25'
              >
                {isCreating ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* change to component */}

      {/* Organization List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Building className='w-5 h-5' />
            Your Organizations {userMemberships?.count || 0}
          </CardTitle>
          <CardDescription>
            {userMemberships?.count === 0
              ? 'Create your first organization above'
              : 'Click on an organization to enter'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userMemberships?.count === 0 ? (
            <>
              <div className='text-center py-12'>
                <Building className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-600 mb-2'>No organizations yet</p>
                <p className='text-gray-500 text-sm'>
                  Create your first organization to get started.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className='space-y-3'>
                {userMemberships?.data?.map((membership) => (
                  <div
                    key={membership.organization.id}
                    className='border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors'
                    onClick={() => handleSelectOrg(membership.organization)}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                          <Building className='h-6 w-6 text-blue-600' />
                        </div>
                        <div>
                          <h3 className='text-lg font-semibold'>
                            {membership.organization.name}
                          </h3>
                          <div className='flex items-center gap-2 text-sm text-gray-500'>
                            <span className='bg-gray-100 text-xs capitalize rounded px-2 py-1 '>
                              {membership.role}
                            </span>
                            <span>
                              ID: {membership.organization.id.substring(0, 8)}
                              ...
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className='h-5 w-5 text-gray-400' />
                    </div>
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

export default selectOrgPage;
