'use client';

import { useState, useRef } from 'react';

import { useOrganization, useUser } from '@clerk/nextjs';
import { Upload, X, Loader2 } from 'lucide-react';

import { toast } from 'sonner';
import { allowedTypes } from '@/app/data/data';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface UploadDocDialogProps {
  onUploadSuccess?: () => void;
  trigger?: React.ReactElement; // change from React.ReactNode
}

const UploadDocumentDialog = ({
  onUploadSuccess,
  trigger,
}: UploadDocDialogProps) => {
  const { user } = useUser();
  const { organization } = useOrganization();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [docName, setDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must not exceed 10MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select a valid document.');
      return;
    }

    setSelectedFile(file);
    setDocName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !docName.trim() || !organization || !user) {
      toast.error('Please provide a document name and select a file.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();

    formData.append('name', docName);
    formData.append('organizationId', organization.id);
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`/api/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const { error } = await response.json();
        toast.error(error || 'Failed to upload document. Please try again.');
      } else {
        // Reset Form
        setDocName('');
        setSelectedFile(null);
        setIsOpen(false);

        toast.success('Document uploaded successfully.');

        // Call the Success callback if provided
        onUploadSuccess?.();
      }
    } catch (error) {
      toast.error('Failed to upload document. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle dialog open/close
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);

    // Reset dialog
    if (!open) {
      setDocName('');
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger
        render={
          trigger || (
            <Button>
              <Upload className='h-4 w-4 mr-2' />
              Upload Document
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader className='sm:max-w-125'>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Upload a file for analysis</DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>
              Documents name *
            </label>
            <Input
              placeholder='Enter document name'
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>
              Upload File
            </label>
            <div className='border-2 border-dashed rounded-lg p-6 text-center'>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileSelect}
                className='hidden'
                accept='.txt,.pdf,.docx,.doc,.md'
                id='file-upload'
                disabled={isUploading}
              />
              <label htmlFor='file-upload' className='cursor-pointer'>
                <div className='flex flex-col items-center gap-2'>
                  <Upload className='h-8 w-8 text-gray-500' />
                  <span className='font-medium'>
                    {selectedFile?.name || 'Click to select file'}
                  </span>
                  <span className='text-sm text-gray-500'>
                    Supports: .txt, .pdf, .docx, .doc, .md (Max 10MB)
                  </span>
                  {selectedFile && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className='w-3 h-3 mr-1' />
                      Remove
                    </Button>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleUpload}
            disabled={isUploading || !docName.trim()}
          >
            {isUploading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <Upload className='h-4 w-4 mr-2' />
                Upload Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
