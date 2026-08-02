'use client';

import { useState } from 'react';

import { useOrganizationList } from '@clerk/nextjs';

import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

const CreateOrganization = () => {
  const router = useRouter();

  const [orgName, setOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { userMemberships, isLoaded, setActive, createOrganization } =
    useOrganizationList({
      userMemberships: { infinite: true },
    });

  const refreshOrganization = async () => {
    setIsRefreshing(true);
    try {
      if (userMemberships?.revalidate) {
        await userMemberships.revalidate();
      }

      toast.success('Organization list refreshed');
    } catch (error) {
      console.error('Failed to refresh Organization list', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!orgName.trim()) {
      toast.error('Please enter an organization name');
      return;
    }

    try {
      setIsCreating(true);

      // Create organization in clerk
      if (!createOrganization) {
        throw new Error('Organization creation is not avalable at this time');
      }

      const newOrg = await createOrganization({
        name: orgName.trim(),
      });

      if (!newOrg) {
        toast.error('Failed to create organization');
        return;
      }

      setOrgName('');

      // Save organization to db
      try {
        const response = await fetch('/api/organizations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkOrgId: newOrg.id,
            name: orgName.trim(),
            slug:
              newOrg.slug || orgName.trim().toLowerCase().replace(/\s+/g, '-'),
          }),
        });

        if (!response.ok) {
          toast.warning(
            'Organization created, but some setup may be incomplete. Try refreshing.',
          );
          console.log(
            'Database sync failed, but organization created in clerk',
          );
        }

        toast.success(`Organization ${newOrg.name} created successfully`);
      } catch (dbErr) {
        console.warn('Database sync failed', dbErr);
      }

      // Set as active organization
      if (setActive) {
        await setActive({
          organization: newOrg.id,
        });
      }

      // sleep for 500ms
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh org list in clerk
      await refreshOrganization();
      router.refresh();
    } catch (err) {
      console.error('Failed to create organization', err);
      toast.error('Failed to create organization');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className='mb-8'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Plus className='w-5 h-5' />
            Create New Organization
          </CardTitle>
          <CardDescription>Start a new workspace for your team</CardDescription>
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
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateOrganization;
