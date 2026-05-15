import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { saveCompanyProfile, getCompanyProfile, uploadLogo } from '@/lib/storage';

/**
 * GET /api/company
 * Get user's company profile
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getCompanyProfile(userId);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to fetch company profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company
 * Save or update company profile
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const profile = await saveCompanyProfile(body, userId);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to save company profile:', error);
    return NextResponse.json(
      { error: 'Failed to save company profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company/upload-logo
 * Upload company logo
 */
export async function POST_LOGO(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const logoUrl = await uploadLogo(file, userId);
    return NextResponse.json({ logoUrl });
  } catch (error) {
    console.error('Failed to upload logo:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}
