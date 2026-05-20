import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap, LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuthStore';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, openLoginModal, signOut } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'Templates', href: '/templates' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <nav className={`sticky top-0 z-50 bg-white border-b border-gray-100 transition-shadow duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900">Strikin</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            l.href.startsWith('#') ? (
              <a key={l.label} href={l.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{l.label}</a>
            ) : (
              <Link key={l.label} to={l.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{l.label}</Link>
            )
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={signOut} className="hidden sm:flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-2">
              <LogOut size={16} /> Sign out
            </button>
          ) : (
            <button onClick={openLoginModal} className="hidden sm:flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-2">
              <LogIn size={16} /> Sign in
            </button>
          )}
          <Link to="/app" className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg px-4 py-2 font-medium transition-colors hidden sm:block">
            {user ? 'Go to App →' : 'Create free invoice →'}
          </Link>
          <button className="md:hidden p-1.5" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-3 animate-fade-in">
          {links.map(l => (
            l.href.startsWith('#') ? (
              <a key={l.label} href={l.href} className="block text-sm text-gray-600 py-2" onClick={() => setMenuOpen(false)}>{l.label}</a>
            ) : (
              <Link key={l.label} to={l.href} className="block text-sm text-gray-600 py-2" onClick={() => setMenuOpen(false)}>{l.label}</Link>
            )
          ))}
          <div className="border-t border-gray-100 my-2 pt-2" />
          {user ? (
            <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full text-left text-sm text-gray-600 py-2 flex items-center gap-2">
              <LogOut size={16} /> Sign out
            </button>
          ) : (
            <button onClick={() => { openLoginModal(); setMenuOpen(false); }} className="w-full text-left text-sm text-gray-600 py-2 flex items-center gap-2">
              <LogIn size={16} /> Sign in
            </button>
          )}
          <Link to="/app" className="block bg-blue-600 text-white text-sm rounded-lg px-4 py-2.5 font-medium text-center" onClick={() => setMenuOpen(false)}>
            {user ? 'Go to App →' : 'Create free invoice →'}
          </Link>
        </div>
      )}
    </nav>
  );
}
