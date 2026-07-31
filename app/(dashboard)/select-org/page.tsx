'use client';

import { useUser } from '@clerk/nextjs';

import CreateOrganization from '@/components/organization/CreateOrganization';
import ListOrganizations from '@/components/organization/ListOrganizations';

const SelectOrgPage = () => {
  const { user } = useUser();

  return (
    <div className='container mx-auto max-w-4xl p-6'>
      <div className='mb-8 text-center '>
        <h1 className='text-3xl font-bold'>Welcome, {user?.firstName}!</h1>
        <p className='text-gray-600'>Select or create an organization</p>
      </div>

      {/* Create Organization */}
      <CreateOrganization />

      {/* Organizations List */}
      <ListOrganizations />
    </div>
  );
};

export default SelectOrgPage;
