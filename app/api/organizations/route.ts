import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clerkOrgId, name, slug } = body;

    if (!clerkOrgId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check if organization exist
    const existingOrg = await prisma.organization.findUnique({
      where: {
        clerkOrgId,
      },
    });

    if (existingOrg) {
      NextResponse.json({
        success: true,
        organization: existingOrg,
        message: 'Organization already exist',
      });
    }

    // Find user
    let dbUser = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create organization in db
    const organization = await prisma.organization.create({
      data: {
        clerkOrgId,
        name,
        slug: slug || name.toLowerCase().replace(/\+/g, '-'),
      },
    });

    // Create organization member
    await prisma.organizationMember.create({
      data: {
        userId: dbUser.id,
        organizationId: organization.id,
        role: 'owner',
      },
    });

    return NextResponse.json({
      success: true,
      organization,
      message: 'Organization created successfully',
    });
  } catch (error: any) {
    console.error('Organization POST', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create organization' },
      { status: 500 },
    );
  }
}
