import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { uploadToBlob } from '@/lib/vercelBlob';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Check Auth
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Please sign in to continue.' },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    const name = formData.get('name') as string;
    const content = formData.get('content') as string;
    const clerkOrgId = formData.get('organizationId') as string;
    const file = formData.get('file') as File;

    if (!clerkOrgId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        clerkOrgId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      include: {
        memberships: {
          where: {
            organizationId: organization.id,
          },
          include: { organization: true },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      return NextResponse.json(
        { error: 'You have no permission to access this organization.' },
        { status: 403 },
      );
    }

    let fileUrl = null;
    let fileSize = null;
    let fileType = null;
    let extractedContent = content;

    // Upload to Vercel Blob
    if (file && file.size > 0) {
      const blob = await uploadToBlob(file, clerkOrgId, userId);

      fileUrl = blob.url;
      fileSize = file.size;
      fileType = file.type;

      if (!extractedContent && file.type.includes('text')) {
        extractedContent = await file.text();
      }
    }

    const document = await prisma.document.create({
      data: {
        name,
        content: extractedContent || null,
        fileUrl,
        fileSize: fileSize || 0,
        fileType: fileType || 'unknown',
        organizationId: organization.id,
        userId: user.id,
        aiKeywords: [],
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        organization: {
          select: { name: true, clerkOrgId: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        name: document.name,
        fileUrl: document.fileUrl,
        organization: document.organization.name,
        clerkOrgId: document.organization.clerkOrgId,
        uploadedBy: document.user.name,
      },
    });
  } catch (error: any) {
    console.error('Document upload error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check Auth
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Please sign in to continue.' },
        { status: 401 },
      );
    }

    // /api/documents?organizationId=${organization.id}
    const { searchParams } = new URL(req.url);
    const clerkOrgId = searchParams.get('organizationId');

    if (!clerkOrgId) {
      return NextResponse.json(
        {
          error: 'Organization id is required',
        },
        { status: 400 },
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        clerkOrgId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      include: {
        memberships: {
          where: {
            organizationId: organization.id,
          },
          include: { organization: true },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      return NextResponse.json(
        { error: 'You have no permission to access this organization.' },
        { status: 403 },
      );
    }

    // Get All Documents for organization
    const documents = await prisma.document.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        organization: {
          select: {
            name: true,
            clerkOrgId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      documents,
      metadata: {
        organization: organization.name,
        clerkOrgId: organization.clerkOrgId,
        documentCount: documents.length,
      },
    });
  } catch (error: any) {
    console.error('Documents fetch error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 },
    );
  }
}
