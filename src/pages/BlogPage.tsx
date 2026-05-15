import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { Link } from 'react-router-dom';

const posts = [
  { slug: 'gst-invoice-guide', title: 'Complete Guide to GST Invoicing for Indian Freelancers', excerpt: 'Everything you need to know about creating GST-compliant invoices — CGST, SGST, IGST explained.', date: '2025-12-15' },
  { slug: 'freelancer-tax-tips', title: '10 Tax Tips Every Indian Freelancer Should Know', excerpt: 'Save money on taxes with these essential tips for freelancers and self-employed professionals in India.', date: '2025-11-28' },
  { slug: 'invoice-best-practices', title: 'Invoice Best Practices: Get Paid Faster', excerpt: 'Learn how to create professional invoices that help you get paid on time, every time.', date: '2025-11-10' },
];

export default function BlogPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>
          <div className="space-y-6">
            {posts.map(post => (
              <article key={post.slug} className="border border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-sm transition-all">
                <time className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                <h2 className="text-lg font-semibold text-gray-900 mt-1 mb-2">{post.title}</h2>
                <p className="text-sm text-gray-500 mb-3">{post.excerpt}</p>
                <Link to="/blog" className="text-sm text-blue-600 font-medium hover:underline">Read more →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
