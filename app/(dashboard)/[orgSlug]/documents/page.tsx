'use client';

import { useEffect, useState } from 'react';

import { useOrganization } from '@clerk/nextjs';

import { toast } from 'sonner';
import { FileText, Loader2 } from 'lucide-react';

import { formatFileSize } from '@/app/data/data';
import { Document } from '@/types';

import UploadDocumentDialog from '@/components/document/UploadDocDialog';
import DocumentCard from '@/components/document/DocumentCard';
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from '@/components/ui/card';

const documentsPage = () => {
  const { organization } = useOrganization();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async () => {
    if (!organization) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `api/documents?organizationId/${organization.id}`,
      );

      if (!response.ok) {
        toast.error('Failed to fetch documents. Please try again later.');
        throw new Error('Failed to fetch documents');
      }

      const { documents } = await response.json();
      setDocuments(documents);
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error('Failed to fetch documents. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [organization]);

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Documents</h1>
          <p className='text-gray-600'>
            Upload and analyze documents in {organization?.name}
          </p>
        </div>

        {/* Upload Dialog */}
        <UploadDocumentDialog />
      </div>

      {/* Stats Bar */}
      {documents.length > 0 && !isLoading && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Analyzed Document */}
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-green-600'>
                  {documents.filter((doc) => doc.aiSummary).length}
                </div>
                <p className='text-sm text-gray-500'>Analyzed</p>
              </div>
            </CardContent>
          </Card>

          {/* Document Size */}
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-green-600'>
                  {formatFileSize(
                    documents.reduce(
                      (acc, doc) => acc + (doc.fileSize || 0),
                      0,
                    ),
                  )}
                </div>
                <p className='text-sm text-gray-500'>Total Size</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documents {documents.length}
            {isLoading && (
              <Loader2 className='h-4 w-4 inline ml-2 animate-spin' />
            )}
          </CardTitle>
          <CardDescription>
            {documents.filter((doc) => doc.aiSummary).length} analyzed •{' '}
            {documents.filter((doc) => !doc.aiSummary).length} pending
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <div className='text-center py-12'>
                <Loader2 className='h-8 w-8 mb-4 mx-auto animate-spin' />
                <p className='text-gray-600'>Loading documents...</p>
              </div>
            </>
          ) : (
            <>
              {documents.length === 0 ? (
                <div className='text-center py-12'>
                  <FileText className='w-12 h-12 text-gray-300 mb-4 mx-auto' />
                  <p className='text-gray-600'>No documents uploaded yet </p>
                  <p className='mt-2 text-gray-500 text-sm'>
                    Upload your first documents to get started
                  </p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {documents.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default documentsPage;
