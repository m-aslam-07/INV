import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { getAllTemplates } from '../components/invoice/templateRegistry';
import { useInvoiceStore } from '../hooks/useInvoiceStore';
import { Suspense, useMemo } from 'react';

function TemplateThumbnail({ template }: { template: any }) {
  const baseState = useMemo(() => useInvoiceStore.getState(), []);
  
  const state = useMemo(() => {
    return {
      ...baseState,
      style: {
        ...baseState.style,
        template: template.key
      }
    };
  }, [baseState, template.key]);

  const TemplateComponent = template.component;

  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-50 pointer-events-none select-none pt-4">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50"></div>
      <div 
        className="absolute z-10 origin-top transform group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300 left-1/2" 
        style={{ 
          transform: 'translateX(-50%) scale(0.35)', 
          width: '794px', 
          background: 'white', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <Suspense fallback={<div className="w-full h-96 bg-white flex items-center justify-center text-gray-400">Loading...</div>}>
          <TemplateComponent state={state} isPro={true} />
        </Suspense>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const allTemplates = getAllTemplates();

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-3">
            24 Unique Invoice Templates
          </h1>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Choose from {allTemplates.length} professionally designed unique templates. Fully customizable and GST-ready.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allTemplates.map((template) => (
              <Link key={template.key} to={`/app?template=${template.key}`}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all group flex flex-col">
                <div className="h-72 bg-gray-50 relative overflow-hidden border-b border-gray-50">
                  <TemplateThumbnail template={template} />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{template.label} Template</h3>
                  </div>
                  <span className="text-sm text-blue-600 font-medium group-hover:underline flex items-center gap-1 mt-4">
                    Use template <span>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
