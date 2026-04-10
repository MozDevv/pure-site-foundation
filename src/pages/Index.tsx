import {
  Brain,
  Code,
  Users,
  GraduationCap,
  Rocket,
  HandHeart,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  ClipboardList,
  Star,
  X,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingAIChat } from '@/components/chat/FloatingAIChat';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.12, ease: 'easeOut' } }),
};

const STATS = [
  { value: 100, suffix: '+', label: 'Students',    icon: Users,        accent: '#7c3aed', accentBg: 'rgba(124,58,237,.12)' },
  { value: 10,  suffix: '+', label: 'Instructors', icon: GraduationCap, accent: '#0891b2', accentBg: 'rgba(8,145,178,.12)' },
  { value: 10,  suffix: '+', label: 'Mentors',     icon: HandHeart,    accent: '#059669', accentBg: 'rgba(5,150,105,.12)' },
  { value: 5,   suffix: '+', label: 'Programs',    icon: BookOpen,     accent: '#d97706', accentBg: 'rgba(217,119,6,.12)' },
];

const HIGHLIGHTS = [
  { icon: GraduationCap, iconBg: '#ede9fe', iconColor: '#7c3aed', accentBorder: '#7c3aed', title: 'Comprehensive Training', body: 'Data science, AI, and emerging technology curriculum built with industry experts \u2014 not textbooks.' },
  { icon: Users, iconBg: '#e0f2fe', iconColor: '#0891b2', accentBorder: '#0891b2', title: 'Expert Mentorship', body: 'Guided real-world projects with mentors from leading companies who have walked the path.' },
  { icon: Rocket, iconBg: '#d1fae5', iconColor: '#059669', accentBorder: '#059669', title: 'Innovation Showcase', body: 'Participants ship products to Pwani and Nairobi Innovation Weeks \u2014 real audiences, real feedback.', tag: 'Flagship', tagColor: '#059669', tagBg: '#d1fae5' },
  { icon: HandHeart, iconBg: '#fef3c7', iconColor: '#d97706', accentBorder: '#d97706', title: 'Strategic Partnerships', body: 'Direct connections to investors, employers, and the broader East African tech ecosystem.' },
  { icon: Code, iconBg: '#fee2e2', iconColor: '#dc2626', accentBorder: '#dc2626', title: 'Career Pathway', body: 'A clear route from your first line of code to investor exposure and entrepreneurial ventures.' },
  { icon: Brain, iconBg: '#ede9fe', iconColor: '#7c3aed', accentBorder: '#4f46e5', title: 'Real-World Impact', body: 'Every project solves a genuine community or industry challenge. You graduate with a portfolio, not just a certificate.' },
];

const PROGRAMS = [
  {
    levelLabel: 'Beginner',
    levelColor: '#059669',
    levelBg: '#d1fae5',
    title: 'Data Fundamentals',
    desc: 'Master SQL, data visualization, and Python basics. Build your first end-to-end data pipeline.',
    fullDesc: 'This track is your launchpad into the world of data. You will learn to query databases, clean messy datasets, and communicate insights clearly through compelling visualizations — all using tools actually used in Kenyan companies today.',
    topics: ['SQL & Analytics', 'Excel & Google Sheets', 'Data Visualization', 'Storytelling with Data'],
    benefits: ['Live weekly sessions with an assigned mentor', 'Real dataset projects from local businesses', 'Certificate of completion', 'Access to TechAI career board'],
    barColor: '#7c3aed',
    duration: '8 weeks',
    req: 'No experience needed',
    schedule: 'Weekday evenings + Saturday morning sessions',
  },
  {
    levelLabel: 'Intermediate',
    levelColor: '#7c3aed',
    levelBg: '#ede9fe',
    title: 'Python for AI',
    desc: 'Deep dive into machine learning with scikit-learn and real datasets from Kenyan industry.',
    fullDesc: 'Go beyond tutorials. This track turns foundational Python knowledge into real applied ML skills. You will build, evaluate, and deploy predictive models using datasets from healthcare, agriculture, and fintech — sectors driving East Africa\'s digital economy.',
    topics: ['Python Basics', 'Pandas & NumPy', 'APIs & Automation', 'Intro to ML Libraries'],
    benefits: ['1-on-1 code reviews with a senior developer', 'Participation in monthly hackathons', 'LinkedIn recommendation upon completion', 'Introduction to partner hiring companies'],
    barColor: '#0891b2',
    duration: '10 weeks',
    req: 'Python basics',
    schedule: 'Flexible self-paced + bi-weekly live labs',
  },
  {
    levelLabel: 'Advanced',
    levelColor: '#d97706',
    levelBg: '#fef3c7',
    title: 'Machine Learning',
    desc: 'Production ML systems, MLOps, and model deployment. Ship models that actually run in the real world.',
    fullDesc: 'This is the capstone track for practitioners who want to go pro. You will design, train, and deploy end-to-end ML pipelines — from raw data ingestion to a live API endpoint — following industry standards in model monitoring and CI/CD for ML.',
    topics: ['Supervised Learning', 'Model Evaluation', 'NLP Basics', 'Capstone Project'],
    benefits: ['Capstone project featured in Innovation Showcase', 'Direct introductions to TechAI hiring partners', 'Advanced portfolio review with industry mentors', 'Priority access to internship placements'],
    barColor: '#d97706',
    duration: '12 weeks',
    req: 'ML fundamentals',
    schedule: 'Intensive cohort with live sessions 3× per week',
  },
];

const TESTIMONIALS = [
  { text: 'I went from zero programming knowledge to landing a data analyst role at Safaricom in 6 months. The mentorship here is unlike anything else in Nairobi.', name: 'Amara Osei', role: 'Data Analyst, Safaricom', initials: 'AO', avatarBg: 'linear-gradient(135deg,#6d28d9,#4f46e5)' },
  { text: 'The Innovation Showcase changed everything. I pitched my agri-tech solution and got connected to three investors on the same day.', name: 'Michael Kamau', role: 'ML Engineer, Startup Founder', initials: 'MK', avatarBg: 'linear-gradient(135deg,#0891b2,#0e7490)' },
  { text: "TechAI gave me a real portfolio, not just certificates. When I interviewed at Andela, my projects spoke for themselves.", name: 'Joyce Wanjiru', role: 'Software Engineer, Andela', initials: 'JW', avatarBg: 'linear-gradient(135deg,#059669,#047857)' },
];

const Index = () => {
  const [selectedProgram, setSelectedProgram] = useState<typeof PROGRAMS[0] | null>(null);

  return (
    <div className="min-h-screen bg-[#F3F5F9] dark:bg-background">
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 bg-[#F3F5F9] dark:bg-background">
        {/* light-mode gradient wash */}
        <div className="absolute inset-0 dark:hidden pointer-events-none" style={{ background: 'linear-gradient(160deg,#ede9fe 0%,#F3F5F9 55%)' }} />
        {/* dark-mode ambient purple glow */}
        <div className="absolute inset-0 hidden dark:block pointer-events-none" style={{ background: 'radial-gradient(ellipse at 70% 0%,hsl(261 100% 91% / 0.07) 0%,transparent 60%)' }} />
        <div aria-hidden className="pointer-events-none absolute -top-32 right-0 w-[520px] h-[520px] rounded-full" style={{ background: 'radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%)' }} />

        <div className="container relative flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16 pb-16 md:pb-24 pt-8">

          {/* Left — copy */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div
              className="inline-flex items-center gap-2 mb-5 text-xs font-bold tracking-widest uppercase rounded-full px-4 py-1.5"
              style={{ background: '#ede9fe', color: '#7c3aed', border: '1px solid rgba(124,58,237,.25)' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#8b5cf6' }} />
              Kenya's #1 Youth Tech Program
            </div>

            <h1
              className="font-black leading-[1.02] mb-6 text-[#0f172a] dark:text-foreground"
              style={{ fontSize: 'clamp(2.75rem,6vw,4.75rem)', letterSpacing: '-0.02em', fontFamily: '"Bebas Neue",sans-serif' }}
            >
              Launch Your<br />
              <span style={{ background: 'linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Tech Career
              </span><br />
              From Zero.
            </h1>

            <p
              className="mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed text-[#475569] dark:text-muted-foreground"
              style={{ fontSize: '1.0625rem' }}
            >
              Hands-on training, senior mentorship, and real project experience — everything you need to break into data and AI careers.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a
                href="/apply"
                className="inline-flex items-center gap-2 font-bold rounded-full px-7 py-3.5 text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 24px rgba(124,58,237,.35)', fontSize: '0.9375rem' }}
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/signin"
                className="inline-flex items-center gap-2 font-medium rounded-full px-7 py-3.5 transition-all duration-200 bg-white dark:bg-card text-[#334155] dark:text-foreground border border-[#e2e8f0] dark:border-border hover:border-[#8b5cf6] dark:hover:border-primary hover:text-[#7c3aed] dark:hover:text-primary"
                style={{ fontSize: '0.9375rem' }}
              >
                Sign In
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3 justify-center md:justify-start">
              <div className="flex -space-x-2">
                {[['K','#6d28d9'],['A','#0891b2'],['M','#059669'],['J','#d97706']].map(([l,c]) => (
                  <div key={l} className="w-8 h-8 rounded-full border-2 border-white dark:border-card flex items-center justify-center text-white text-[10px] font-bold" style={{ background: c }}>{l}</div>
                ))}
              </div>
              <p className="text-sm text-[#64748b] dark:text-muted-foreground">
                <span className="font-bold text-[#0f172a] dark:text-foreground">100+</span> students already enrolled
              </p>
            </div>
          </motion.div>

          {/* Right — circular image */}
          <motion.div
            className="flex-1 hidden md:flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Social proof pill */}
              <div
                className="absolute -top-5 -right-6 z-10 flex items-center gap-3 rounded-xl px-4 py-2.5 bg-white dark:bg-card border border-[#e2e8f0] dark:border-border"
                style={{ boxShadow: '0 8px 24px rgba(15,23,42,.10)' }}
              >
                <div className="flex -space-x-2">
                  {[['K','#6d28d9'],['A','#0891b2'],['M','#059669']].map(([l,c]) => (
                    <div key={l} className="w-7 h-7 rounded-full border-2 border-white dark:border-card flex items-center justify-center text-white text-[10px] font-bold" style={{ background: c }}>{l}</div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0f172a] dark:text-foreground whitespace-nowrap">100+ Students</p>
                  <p className="text-[11px]" style={{ color: '#f59e0b' }}>★★★★★</p>
                </div>
              </div>

              {/* Teal circle with students image */}
              <div
                className="relative w-72 h-72 md:w-[340px] md:h-[340px] rounded-full overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', boxShadow: '0 24px 64px rgba(8,145,178,.30)' }}
              >
                <img
                  src="/landing.png"
                  alt="TechAI students collaborating"
                  className="absolute bottom-0 w-full object-cover object-top"
                  style={{ height: '92%' }}
                  loading="eager"
                />
              </div>

              {/* Score pill */}
              <div
                className="absolute bottom-6 -left-6 rounded-xl px-4 py-2.5"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 24px rgba(124,58,237,.4)' }}
              >
                <p className="text-2xl font-black leading-none text-white">82%</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,.7)' }}>Avg. Score</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white dark:bg-card border-y border-[#e2e8f0] dark:border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e2e8f0] dark:divide-border">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex items-center gap-4 py-7 px-5 md:px-8"
              >
                <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl" style={{ background: stat.accentBg }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
                </div>
                <div>
                  <p className="font-black leading-none text-[#0f172a] dark:text-foreground" style={{ fontSize: '2rem' }}>
                    <CountUp end={stat.value} duration={2.5} suffix={stat.suffix} separator="," />
                  </p>
                  <p className="text-[11px] font-bold tracking-widest uppercase mt-0.5 text-[#64748b] dark:text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 md:py-28 bg-[#F3F5F9] dark:bg-background">
        <div className="container flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-0.5" style={{ background: '#7c3aed' }} />
              <span className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: '#7c3aed' }}>Our Mission</span>
            </div>
            <h2
              className="font-black mb-6 leading-tight text-[#0f172a] dark:text-foreground"
              style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', letterSpacing: '-0.01em' }}
            >
              Bridging the Gap Between<br />
              <span style={{ color: '#7c3aed' }}>Education and Opportunity</span>
            </h2>
            <div className="space-y-4 leading-relaxed text-[#475569] dark:text-muted-foreground" style={{ fontSize: '0.9375rem' }}>
              <p>The TechAI Program was built with one goal: get young Kenyans into high-growth technology careers. Not through theory alone, but through real mentorship, real projects, and real community.</p>
              <p>We combine structured curriculum with industry connections — so when you graduate, you have a portfolio, a network, and a clear next step.</p>
            </div>
            <div className="mt-6 space-y-2.5">
              {['Industry-aligned curriculum','Senior mentor access','Showcase at Innovation Weeks','Direct employer introductions','Investor network access'].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-[#334155] dark:text-foreground/80">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: '#d1fae5', border: '1px solid rgba(5,150,105,.2)' }}>
                    <CheckCircle2 className="h-3 w-3" style={{ color: '#059669' }} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <div className="relative w-full max-w-md">
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(15,23,42,.12)' }}>
                <img
                  src="/landing34.png"
                  alt="TechAI instructor teaching"
                  className="w-full object-cover"
                  style={{ maxHeight: '380px' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(135deg,rgba(109,40,217,.15),transparent 60%)' }} />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                {[['94%','Job placement'],['6 mo','To first job'],['4.9\u2605','Rating']].map(([v,l]) => (
                  <div key={l} className="flex-1 rounded-lg px-2 py-2.5 text-center" style={{ background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)' }}>
                    <p className="font-black text-base leading-none text-[#0f172a]">{v}</p>
                    <p className="text-[10px] font-semibold mt-0.5 tracking-wide text-[#64748b]">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section className="py-20 md:py-24 bg-white dark:bg-card">
        <div className="container">
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-5 h-0.5" style={{ background: '#7c3aed' }} />
              <span className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: '#7c3aed' }}>Programs</span>
              <div className="w-5 h-0.5" style={{ background: '#7c3aed' }} />
            </div>
            <h2 className="font-black leading-tight text-[#0f172a] dark:text-foreground" style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', letterSpacing: '-0.01em' }}>
              Choose Your <span style={{ color: '#7c3aed' }}>Path</span>
            </h2>
            <p className="text-base mt-3 max-w-xl mx-auto text-[#64748b] dark:text-muted-foreground">
              Three structured tracks from beginner to advanced. Every track ends with a real project you own.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PROGRAMS.map((prog, i) => (
              <motion.button
                key={prog.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                onClick={() => setSelectedProgram(prog)}
                className="rounded-xl overflow-hidden text-left w-full transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl bg-white dark:bg-background border border-[#e2e8f0] dark:border-border cursor-pointer group"
              >
                <div className="p-6 pb-4 border-b border-[#e2e8f0] dark:border-border">
                  <div
                    className="inline-block text-[10px] font-bold tracking-[1.5px] uppercase rounded-full px-3 py-1 mb-3"
                    style={{ background: prog.levelBg, color: prog.levelColor }}
                  >
                    {prog.levelLabel}
                  </div>
                  <h3 className="font-black text-xl text-[#0f172a] dark:text-foreground">{prog.title}</h3>
                </div>
                <div className="p-6 pt-4">
                  <p className="text-sm leading-relaxed mb-4 text-[#64748b] dark:text-muted-foreground">{prog.desc}</p>
                  <ul className="space-y-1.5 mb-5">
                    {prog.topics.map(t => (
                      <li key={t} className="flex items-center gap-2 text-sm text-[#334155] dark:text-foreground/80">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#059669' }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold rounded-md px-2.5 py-1 bg-[#F3F5F9] dark:bg-muted text-[#64748b] dark:text-muted-foreground">
                      <Clock className="h-3 w-3" /> {prog.duration}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold rounded-md px-2.5 py-1 bg-[#F3F5F9] dark:bg-muted text-[#64748b] dark:text-muted-foreground">
                      <ClipboardList className="h-3 w-3" /> {prog.req}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold group-hover:gap-2.5 transition-all" style={{ color: '#7c3aed' }}>
                    View Program <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Program Highlights ── */}
      <section className="py-20 md:py-24 bg-[#F3F5F9] dark:bg-background">
        <div className="container">
          <motion.div
            className="mb-14"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-0.5" style={{ background: '#7c3aed' }} />
              <span className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: '#7c3aed' }}>What You Get</span>
            </div>
            <h2 className="font-black leading-tight text-[#0f172a] dark:text-foreground" style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', letterSpacing: '-0.01em' }}>
              Built for People Who Want<br />to Actually Ship Things
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-xl bg-white dark:bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border border-[#e2e8f0] dark:border-border"
                style={{ borderLeft: `3px solid ${h.accentBorder}` }}
              >
                {h.tag && (
                  <span
                    className="absolute top-4 right-4 text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded"
                    style={{ background: h.tagBg, color: h.tagColor }}
                  >
                    {h.tag}
                  </span>
                )}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 dark:opacity-90" style={{ background: h.iconBg }}>
                  <h.icon className="w-5 h-5" style={{ color: h.iconColor }} />
                </div>
                <h3 className="font-bold mb-2 text-[#0f172a] dark:text-foreground" style={{ fontSize: '1rem' }}>{h.title}</h3>
                <p className="leading-relaxed text-[#64748b] dark:text-muted-foreground" style={{ fontSize: '0.875rem' }}>{h.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 md:py-24 bg-white dark:bg-card">
        <div className="container">
          <motion.div
            className="mb-14 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-5 h-0.5" style={{ background: '#7c3aed' }} />
              <span className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: '#7c3aed' }}>Student Stories</span>
              <div className="w-5 h-0.5" style={{ background: '#7c3aed' }} />
            </div>
            <h2 className="font-black leading-tight text-[#0f172a] dark:text-foreground" style={{ fontSize: 'clamp(1.75rem,3vw,2.5rem)', letterSpacing: '-0.01em' }}>
              Real People, <span style={{ color: '#7c3aed' }}>Real Outcomes</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="relative rounded-xl bg-[#F3F5F9] dark:bg-background p-7 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-[#e2e8f0] dark:border-border"
              >
                <div className="absolute top-3 right-5 select-none pointer-events-none" style={{ fontFamily: 'Georgia,serif', fontSize: '5rem', lineHeight: 1, color: 'rgba(109,40,217,.08)', fontWeight: 900 }}>"</div>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 fill-current" style={{ color: '#f59e0b' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-6 text-[#334155] dark:text-foreground/80">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: t.avatarBg }}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0f172a] dark:text-foreground">{t.name}</p>
                    <p className="text-xs mt-0.5 text-[#64748b] dark:text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 md:px-0 py-12 md:py-16 bg-[#F3F5F9] dark:bg-background">
        <div
          className="container rounded-2xl px-8 py-16 md:py-20 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#6d28d9 0%,#4f46e5 50%,#8b5cf6 100%)' }}
        >
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full" style={{ background: 'rgba(255,255,255,.06)' }} />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-12 w-56 h-56 rounded-full" style={{ background: 'rgba(255,255,255,.04)' }} />
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            <p className="text-[11px] font-bold tracking-[2px] uppercase mb-4" style={{ color: 'rgba(255,255,255,.7)' }}>Applications Open</p>
            <h2
              className="font-black mb-4 text-white"
              style={{ fontSize: 'clamp(2.25rem,5vw,4rem)', letterSpacing: '-0.02em', fontFamily: '"Bebas Neue",sans-serif' }}
            >
              Ready to Start?
            </h2>
            <p className="mb-10 max-w-xl mx-auto" style={{ fontSize: '1rem', color: 'rgba(255,255,255,.78)' }}>
              Take the first step toward a career that actually excites you. Applications are open now.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/apply"
                className="inline-flex items-center gap-2 font-bold rounded-xl px-8 py-4 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: '#fff', color: '#6d28d9', fontSize: '0.9375rem', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}
              >
                Apply to Program <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/signin"
                className="inline-flex items-center gap-2 font-semibold rounded-xl px-8 py-4 transition-all duration-200 hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,.3)', fontSize: '0.9375rem' }}
              >
                Sign In
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <FloatingAIChat />

      {/* ── Program Detail Dialog ── */}
      <AnimatePresence>
        {selectedProgram && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProgram(null)}
            />

            {/* panel */}
            <motion.div
              className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden bg-white dark:bg-card shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {/* header bar */}
              <div className="px-7 py-5 border-b border-[#e2e8f0] dark:border-border flex items-start justify-between gap-4">
                <div>
                  <div
                    className="inline-block text-[10px] font-bold tracking-[1.5px] uppercase rounded-full px-3 py-1 mb-2"
                    style={{ background: selectedProgram.levelBg, color: selectedProgram.levelColor }}
                  >
                    {selectedProgram.levelLabel}
                  </div>
                  <h3 className="font-black text-xl text-[#0f172a] dark:text-foreground leading-tight">
                    {selectedProgram.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="mt-1 p-1.5 rounded-lg text-[#94a3b8] hover:text-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-muted dark:hover:text-foreground transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* body */}
              <div className="px-7 py-5 max-h-[65vh] overflow-y-auto">
                <p className="text-sm leading-relaxed text-[#64748b] dark:text-muted-foreground mb-5">
                  {selectedProgram.fullDesc}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold rounded-md px-2.5 py-1 bg-[#F3F5F9] dark:bg-muted text-[#64748b] dark:text-muted-foreground">
                    <Clock className="h-3 w-3" /> {selectedProgram.duration}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold rounded-md px-2.5 py-1 bg-[#F3F5F9] dark:bg-muted text-[#64748b] dark:text-muted-foreground">
                    <ClipboardList className="h-3 w-3" /> {selectedProgram.req}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold rounded-md px-2.5 py-1 bg-[#F3F5F9] dark:bg-muted text-[#64748b] dark:text-muted-foreground">
                    <Clock className="h-3 w-3" /> {selectedProgram.schedule}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-[#0f172a] dark:text-foreground mb-3 uppercase tracking-wide">
                  What you'll learn
                </h4>
                <ul className="space-y-1.5 mb-6">
                  {selectedProgram.topics.map(t => (
                    <li key={t} className="flex items-center gap-2 text-sm text-[#334155] dark:text-foreground/80">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#059669' }} />
                      {t}
                    </li>
                  ))}
                </ul>

                <h4 className="font-bold text-sm text-[#0f172a] dark:text-foreground mb-3 uppercase tracking-wide">
                  What's included
                </h4>
                <ul className="space-y-1.5">
                  {selectedProgram.benefits.map(b => (
                    <li key={b} className="flex items-center gap-2 text-sm text-[#334155] dark:text-foreground/80">
                      <Star className="h-3.5 w-3.5 shrink-0" style={{ color: '#7c3aed' }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* footer CTAs */}
              <div className="px-7 py-5 border-t border-[#e2e8f0] dark:border-border flex flex-col sm:flex-row gap-3">
                <a
                  href="/apply"
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
                >
                  Apply Now
                </a>
                <a
                  href="/signin"
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-bold border border-[#e2e8f0] dark:border-border text-[#334155] dark:text-foreground hover:bg-[#F3F5F9] dark:hover:bg-muted transition-colors"
                >
                  Sign In
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
