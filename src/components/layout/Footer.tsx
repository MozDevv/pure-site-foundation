import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tags = [
  { label: 'Data Science', href: '/apply?interest=Data+Science' },
  { label: 'AI', href: '/apply?interest=AI' },
  { label: 'Machine Learning', href: '/apply?interest=Machine+Learning' },
  { label: 'Python', href: '/apply?interest=Python' },
  { label: 'Web Dev', href: '/apply?interest=Web+Dev' },
  { label: 'Cloud', href: '/apply?interest=Cloud' },
  { label: 'Cybersecurity', href: '/apply?interest=Cybersecurity' },
  { label: 'Innovation', href: '/apply?interest=Innovation' },
  { label: 'Deep Learning', href: '/apply?interest=Deep+Learning' },
  { label: 'SQL', href: '/apply?interest=SQL' },
  { label: 'MLOps', href: '/apply?interest=MLOps' },
  { label: 'DevOps', href: '/apply?interest=DevOps' },
];

const programs = [
  { label: 'TechAI Course', href: '/apply' },
  { label: 'Mentorship Program', href: '/apply' },
  { label: 'Innovation Showcase', href: '/apply' },
  { label: 'Code Playground', href: '/signin' },
];

const quickLinks = [
  { label: 'Student Portal', href: '/signin' },
  { label: 'Tutor Portal', href: '/signin' },
  { label: 'Learning Materials', href: '/signin' },
  { label: 'Apply Now', href: '/apply' },
  { label: 'Contact Us', href: '#' },
];

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer style={{ background: '#1a1a18', borderTop: '1px solid hsl(150 3% 18%)' }}>
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* About Us */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#9ca3af' }}>About Us</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-primary p-1.5">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold text-white">TechAI Program</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>
              Empowering youth across Kenya with hands-on tech and data career training, expert mentorship, and real-world innovation exposure.
            </p>
            <div className="mt-5 space-y-1 text-sm" style={{ color: '#9ca3af' }}>
              <p>info@techaipath.com</p>
              <p>+254 799 367 087</p>
              <p>Nairobi, Kenya</p>
            </div>
          </div>

          {/* Tag Cloud */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#9ca3af' }}>Tag Cloud</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => navigate(tag.href)}
                  className="px-2.5 py-1 text-xs font-medium rounded cursor-pointer transition-all hover:opacity-90 hover:scale-105"
                  style={{ background: 'hsl(172 66% 50% / 0.18)', color: 'hsl(172 66% 60%)', border: '1px solid hsl(172 66% 50% / 0.25)' }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#9ca3af' }}>Programs</p>
            <ul className="space-y-3">
              {programs.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: '#9ca3af' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#DCCFFF')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: 'hsl(172 66% 50%)' }} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#9ca3af' }}>Quick Links</p>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: '#9ca3af' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#DCCFFF')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: 'hsl(261 100% 91%)' }} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid hsl(150 3% 16%)' }}>
        <div className="container py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs" style={{ color: '#6b7280' }}>
            © {new Date().getFullYear()} TechAI Program — All Rights Reserved
          </p>
          <div className="flex gap-6 text-xs" style={{ color: '#6b7280' }}>
            <a href="#" style={{ color: '#6b7280' }} onMouseEnter={e => (e.currentTarget.style.color = '#DCCFFF')} onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>Privacy Policy</a>
            <a href="#" style={{ color: '#6b7280' }} onMouseEnter={e => (e.currentTarget.style.color = '#DCCFFF')} onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

