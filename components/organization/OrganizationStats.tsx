import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

interface OrganizationStatsProps {
  orgSlug: string;
  documentCount: number;
  memberCount: number;
  analyzedDocs: number;
}

const OrganizationStats = ({
  orgSlug,
  documentCount,
  memberCount,
  analyzedDocs,
}: OrganizationStatsProps) => {
  const analyzedPercent = documentCount
    ? Math.round((analyzedDocs / documentCount) * 100)
    : 0;

  return (
    <div className='grid md:grid-cols-3 gap-6'>
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Total Documents</CardTitle>
          <CardDescription>In this organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{documentCount}</div>
          <Link href={`/${orgSlug}/documents`}>
            <Button variant='ghost' size='sm' className='mt-2'>
              View Documents
              <ArrowRight className='ml-2 h-3 w-3' />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Team Members</CardTitle>
          <CardDescription>Organization Members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{memberCount}</div>
          <Button variant='ghost' size='sm' className='mt-2'>
            View Team
            <ArrowRight className='ml-2 h-3 w-3' />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Analyzed</CardTitle>
          <CardDescription>Documents with AI insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold'>{analyzedDocs}</div>
          <p className='text-sm text-gray-500 mt-1'>
            {analyzedPercent}% analyzed
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationStats;
