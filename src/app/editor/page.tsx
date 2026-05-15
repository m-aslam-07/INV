'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUserPlan } from '@/hooks/useAuth';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { ProGated } from '@/components/auth/ProGated';
import { getInvoices, saveInvoice } from '@/lib/storage';
import Link from 'next/link';

/**
 * Editor Page
 * Main invoice editor - works for both free and pro users
 */
export default function EditorPage() {
  const { user } = useAuth();
  const { isPro } = useUserPlan();
  const invoiceState = useInvoiceStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const fullState = invoiceState.getFullState();
      await saveInvoice(fullState, user?.id);
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation using jsPDF
    console.log('Generate PDF');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Editor</h1>
          <div className="flex gap-4">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download PDF
            </button>
            
            <ProGated>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save to Cloud'}
              </button>
            </ProGated>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="col-span-1 space-y-6">
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Business Details</h2>
            {/* Form inputs here */}
          </section>

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Client Details</h2>
            {/* Form inputs here */}
          </section>

          <ProGated fallback={<div className="bg-blue-50 p-4 rounded text-sm">Save to cloud with PRO</div>}>
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Saved Templates</h2>
              {/* Templates list */}
            </section>
          </ProGated>
        </div>

        {/* Preview Panel */}
        <div className="col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          {/* Invoice preview */}
        </div>
      </main>
    </div>
  );
}
