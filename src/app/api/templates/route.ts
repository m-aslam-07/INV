import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { saveTemplate, getTemplates, deleteTemplate } from '@/lib/storage';

/**
 * GET /api/templates
 * Get user's saved templates (pro only)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await getTemplates(userId);
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Save a new template (pro only)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const template = await saveTemplate(
      {
        id: crypto.randomUUID(),
        user_id: userId,
        template_name: body.template_name,
        settings_json: body.settings_json,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      userId
    );

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Failed to save template:', error);
    return NextResponse.json(
      { error: 'Failed to save template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    await deleteTemplate(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
