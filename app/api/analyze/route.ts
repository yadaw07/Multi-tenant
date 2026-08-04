import { analyzeWithGemini } from '@/lib/gimini';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get Request Data
    const { organizationId, documentId, analysisType } = await req.json();

    if (!organizationId || !documentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Find document, but only if it belongs to the organization that the user is a member of.
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organization: {
          clerkOrgId: organizationId,
          members: {
            some: {
              user: { clerkUserId: userId },
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

    // Get Content
    const content = document.content || document.name;

    if (!content) {
      return NextResponse.json(
        { error: 'Document has no content to analyze' },
        { status: 400 },
      );
    }

    // Analyze using Gemini AI
    const summary = await analyzeWithGemini(content, analysisType);

    // Build update data conditionally — only touch fields relevant to this analysis type
    const updateData: {
      aiSummary: string;
      sentiment?: string;
      aiKeywords?: string[];
    } = {
      aiSummary: summary,
    };

    if (analysisType === 'sentiment') {
      // Extract just the sentiment word
      const firstLine = summary.split('\n')[0].trim();
      updateData.sentiment = firstLine;
    }

    if (analysisType === 'entities') {
      // Split comma-separated keywords into an array
      updateData.aiKeywords = summary
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
    }

    // Save Results to DB
    const updateDocument = await prisma.document.update({
      where: {
        id: documentId,
      },
      data: updateData,
    });

    // Return the Response
    return NextResponse.json({
      success: true,
      summary,
      document: {
        id: updateDocument.id,
        name: updateDocument.name,
        aiKeywords: updateDocument.aiKeywords,
      },
    });
  } catch (error: any) {
    console.error('Analysis error', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze document' },
      { status: 500 },
    );
  }
}
