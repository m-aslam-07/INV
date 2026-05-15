import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';
import { saveInvoice, getInvoices, getInvoice, updateInvoice, deleteInvoice } from '@/lib/storage';

/**
 * GET /api/invoices
 * Get user's invoices (pro only)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await getInvoices(userId);
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Save a new invoice (pro only)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user plan
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    if (userError || user?.plan !== 'pro') {
      return NextResponse.json(
        { error: 'Pro plan required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const invoice = await saveInvoice(body, userId);

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Failed to save invoice:', error);
    return NextResponse.json(
      { error: 'Failed to save invoice' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/invoices/[id]
 * Update an invoice
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    
    const invoice = await updateInvoice(id, body, userId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/[id]
 * Delete an invoice
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
    await deleteInvoice(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
