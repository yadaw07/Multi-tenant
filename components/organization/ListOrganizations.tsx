import { useRouter } from 'next/navigation';

import { useOrganizationList } from '@clerk/nextjs';

import { ArrowRight, Building } from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

const ListOrganizations = () => {
  const router = useRouter();

  const { userMemberships, isLoaded, setActive, createOrganization } =
    useOrganizationList({
      userMemberships: { infinite: true },
    });

  const handleSelectOrg = async (organization: any) => {
    try {
      if (setActive) {
        await setActive({ organization: organization.id });
      }

      router.push(`/${organization.slug}`);
    } catch (err) {
      console.error('Failed to switch organization', err);
      toast.error('Failed to switch organization');
    }
  };

  return (
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
  );
};

export default ListOrganizations;
