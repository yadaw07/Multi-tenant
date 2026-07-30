import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import prisma from '@/lib/prisma';
import { DeleteFromBlob } from '@/lib/vercelBlob';

interface RouteParams {
  params: Promise<{ documentId: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { documentId } = await params;

    // Check Auth
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Please sign in to continue.' },
        { status: 401 },
      );
    }

    // Get Document with Organization Information
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      include: {
        organization: {
          include: {
            members: {
              where: {
                user: { clerkUserId: userId },
              },
            },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or no access' },
        { status: 404 },
      );
    }

    if (document.organization.members.length === 0) {
      return NextResponse.json(
        { error: 'You have no permission to delete this document.' },
        { status: 403 },
      );
    }

    // Delete User from Vercel Blob if exist
    if (document.fileUrl) {
      try {
        await DeleteFromBlob(document.fileUrl);
      } catch (error) {
        console.log('Failed to Delete Document', error);
      }
    }

    // Delete from db
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    console.error('Deletion error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 },
    );
  }
}
