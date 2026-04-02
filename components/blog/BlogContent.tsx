'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, Clock, Calendar, User, Share2, BookmarkPlus, ChevronDown, ChevronUp, TrendingUp, DollarSign, Shield, Star } from 'lucide-react';
import { useState, useRef } from 'react';

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({ number, label, sublabel, color = 'blue' }: { number: string; label: string; sublabel?: string; color?: 'blue' | 'green' | 'amber' }) {
  const colors = {
    blue: 'from-brand-blue to-blue-400',
    green: 'from-brand-green to-emerald-400',
    amber: 'from-amber to-yellow-400',
  };
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] p-6 group hover:border-white/[0.12] transition-colors"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors[color]}`} />
      <p className={`text-4xl sm:text-5xl font-bold font-display bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
        {number}
      </p>
      <p className="mt-2 text-white/80 font-semibold text-sm">{label}</p>
      {sublabel && <p className="mt-1 text-white/40 text-xs">{sublabel}</p>}
    </motion.div>
  );
}

// ─── Comparison Bar ───────────────────────────────────────────────────────
function ComparisonBar({ label, usCost, mxCost, savings }: { label: string; usCost: number; mxCost: number; savings: string }) {
  const pct = Math.round((mxCost / usCost) * 100);
  return (
    <div className="bg-white/[0.03] rounded-xl p-5 border border-white/[0.06] hover:border-white/[0.1] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold text-sm">{label}</span>
        <span className="text-emerald-400 font-bold text-sm">{savings} saved</span>
      </div>
      <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-500/80 to-red-400/80"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-red-400/80">🇺🇸 US: ${usCost.toLocaleString()}</span>
        <span className="text-emerald-400/80">🇲🇽 MX: ${mxCost.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ─── Pull Quote ───────────────────────────────────────────────────────────
function PullQuote({ children, author }: { children: React.ReactNode; author?: string }) {
  return (
    <motion.blockquote
      className="my-12 relative"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-brand-blue to-brand-green" />
      <div className="pl-8">
        <span className="text-6xl font-display text-brand-blue/30 leading-none select-none">"</span>
        <p className="text-xl sm:text-2xl text-white/90 font-display leading-relaxed -mt-4 italic">
          {children}
        </p>
        {author && (
          <p className="mt-4 text-brand-blue text-sm font-semibold">— {author}</p>
        )}
      </div>
    </motion.blockquote>
  );
}

// ─── Expandable Section ───────────────────────────────────────────────────
function Expandable({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-6 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        {icon && <span className="text-brand-blue">{icon}</span>}
        <span className="flex-1 text-white font-semibold text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-5"
        >
          <div className="text-white/60 text-sm leading-relaxed">{children}</div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Section Divider with Icon ────────────────────────────────────────────
function SectionDivider({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-4 my-16">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
    </div>
  );
}

// ─── Rich Content Renderer (Dark Theme) ───────────────────────────────────
function RichContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inTable = false;
  let tableLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';
  let isFirstParagraph = true;
  let sectionIndex = 0;

  const flushTable = (key: string) => {
    if (tableLines.length < 2) { tableLines = []; inTable = false; return; }
    const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
    const rows = tableLines.slice(2).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()));
    sectionIndex++;

    // Render as comparison cards instead of tables
    if (headers.length === 3 && headers.some(h => h.toLowerCase().includes('save'))) {
      elements.push(
        <div key={key} className="my-10 grid gap-4">
          {rows.map((row, ri) => {
            const label = row[0]?.replace(/\*\*/g, '') || '';
            const usRaw = row[1]?.replace(/[^0-9–]/g, '') || '';
            const mxRaw = row[2]?.replace(/[^0-9–]/g, '') || '';
            const usNum = parseInt(usRaw.split('–')[0]) || 0;
            const mxNum = parseInt(mxRaw.split('–')[0]) || 0;
            const savings = usNum > 0 ? `${Math.round(((usNum - mxNum) / usNum) * 100)}%` : '—';
            return <ComparisonBar key={ri} label={label} usCost={usNum} mxCost={mxNum} savings={savings} />;
          })}
        </div>
      );
    } else if (headers.length === 2) {
      elements.push(
        <div key={key} className="my-10 overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full">
            <thead><tr className="bg-gradient-to-r from-brand-navy/80 to-brand-blue/80">
              {headers.map((h, i) => <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">{h.replace(/\*\*/g, '')}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.map((row, ri) => (
                <tr key={ri} className={`${ri % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.01]'} hover:bg-white/[0.04] transition-colors`}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-5 py-3 text-sm text-white/70"
                      dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      elements.push(
        <div key={key} className="my-10 overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full">
            <thead><tr className="bg-gradient-to-r from-brand-navy/80 to-brand-blue/80">
              {headers.map((h, i) => <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">{h.replace(/\*\*/g, '')}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.01]'}>
                  {row.map((cell, ci) => <td key={ci} className="px-4 py-3 text-sm text-white/70" dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableLines = [];
    inTable = false;
  };

  const flushList = (key: string) => {
    if (!listItems.length) { inList = false; return; }
    const ListTag = listType;
    elements.push(
      <ListTag key={key} className={`my-6 space-y-3 ${listType === 'ul' ? 'list-none pl-0' : 'list-decimal pl-6'}`}>
        {listItems.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-white/60 leading-relaxed text-[15px]">
            {listType === 'ul' && <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0" />}
            <span dangerouslySetInnerHTML={{
              __html: item.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90 font-semibold">$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
            }} />
          </li>
        ))}
      </ListTag>
    );
    listItems = [];
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const key = `el-${i}`;

    if (trimmed.match(/^!\[.*?\]\(.*?\)$/)) {
      if (inList) flushList(key);
      if (inTable) flushTable(key);
      const altMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (altMatch) {
        const [, alt, src] = altMatch;
        elements.push(
          <motion.figure key={key} className="my-12 -mx-4 sm:mx-0"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="relative w-full h-56 sm:h-72 lg:h-[28rem] rounded-2xl overflow-hidden border border-white/[0.06]">
              <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/80 text-sm">{alt}</p>
              </div>
            </div>
          </motion.figure>
        );
      }
      continue;
    }

    if (trimmed.startsWith('|')) {
      if (inList) flushList(key);
      if (!inTable) inTable = true;
      if (!trimmed.match(/^\|[-\s|]+\|$/)) tableLines.push(trimmed);
      continue;
    } else if (inTable) { flushTable(key); }

    if (trimmed.startsWith('## ')) {
      if (inList) flushList(key);
      sectionIndex++;
      const text = trimmed.replace('## ', '');
      elements.push(
        <motion.h2 key={key} className="group mt-16 mb-6 text-2xl sm:text-3xl font-bold font-display text-white flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <span className="w-1 h-8 rounded-full bg-gradient-to-b from-brand-blue to-brand-green flex-shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, '<span class="bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">$1</span>') }} />
        </motion.h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (inList) flushList(key);
      const text = trimmed.replace('### ', '');
      elements.push(
        <h3 key={key} className="mt-10 mb-4 text-lg font-semibold text-white/90 font-display"
          dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, '<span class="text-brand-blue">$1</span>') }} />
      );
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inTable) flushTable(key);
      if (!inList) { inList = true; listType = 'ul'; }
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      continue;
    }

    if (trimmed.match(/^\d+\.\s+/)) {
      if (inTable) flushTable(key);
      if (!inList) { inList = true; listType = 'ol'; }
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      continue;
    }

    if (!trimmed) {
      if (inList) flushList(key);
      if (inTable) flushTable(key);
      continue;
    }

    if (inList) flushList(key);
    if (inTable) flushTable(key);

    const isDrop = isFirstParagraph && !trimmed.startsWith('#');
    elements.push(
      <p key={key} className={`mb-5 text-white/60 leading-[1.85] text-[17px] ${isDrop ? 'first-letter:text-5xl first-letter:font-bold first-letter:font-display first-letter:text-brand-blue first-letter:float-left first-letter:mr-3 first-letter:mt-1' : ''}`}
        dangerouslySetInnerHTML={{
          __html: trimmed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90 font-semibold">$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
        }} />
    );
    if (isDrop) isFirstParagraph = false;
  }
  if (inList) flushList('end-list');
  if (inTable) flushTable('end-table');

  return <>{elements}</>;
}

// ─── Main Blog Content Component ──────────────────────────────────────────
interface BlogContentProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    tags: string[];
    coverImage?: string;
    content: string;
    readingTime: string;
  };
  relatedPosts: Array<{
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    coverImage?: string;
    tags: string[];
  }>;
}

export default function BlogContent({ post, relatedPosts }: BlogContentProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative h-[85vh] sm:h-screen overflow-hidden">
        {post.coverImage ? (
          <>
            <motion.div className="absolute inset-0" style={{ y: heroY, scale: heroScale }}>
              <Image src={post.coverImage} alt={post.title} fill priority className="object-cover" sizes="100vw" />
            </motion.div>
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/40 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-[#0A0A0A] to-brand-navy" />
        )}

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 pb-16 w-full">
            {/* Accent line */}
            <motion.div className="w-16 h-1 rounded-full bg-gradient-to-r from-brand-blue to-brand-green mb-6"
              initial={{ width: 0 }} animate={{ width: 64 }} transition={{ duration: 0.8, delay: 0.3 }} />

            {/* Tags */}
            <motion.div className="flex flex-wrap gap-2 mb-5"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {post.tags.map(tag => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-blue bg-brand-blue/10 rounded-full border border-brand-blue/20 hover:bg-brand-blue/20 transition-colors">
                  {tag}
                </Link>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.1] max-w-3xl"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
              {post.title}
            </motion.h1>

            {/* Meta */}
            <motion.div className="mt-8 flex items-center gap-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center">
                  <span className="text-white text-xs font-bold">CC</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{post.author}</p>
                  <p className="text-white/40 text-xs flex items-center gap-3">
                    <span>{formattedDate}</span>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* ===== KEY STATS BAR ===== */}
      <section className="relative z-10 -mt-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard number="70–96%" label="Savings vs. U.S." sublabel="Across all categories" color="green" />
            <StatCard number="$7,350" label="Avg. Dental Savings" sublabel="Two crowns + implant" color="blue" />
            <StatCard number="$3,150" label="Avg. Rx Savings" sublabel="3 meds + glasses/year" color="amber" />
            <StatCard number="30+" label="Years of Trust" sublabel="Medical tourism hub" color="green" />
          </div>
        </div>
      </section>

      {/* ===== ARTICLE BODY ===== */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-brand-blue hover:text-white transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          All Articles
        </Link>

        {/* Excerpt */}
        <div className="relative bg-gradient-to-r from-brand-blue/10 to-brand-green/5 border-l-2 border-brand-blue/50 rounded-r-xl px-7 py-6 mb-12">
          <p className="text-white/70 text-lg leading-relaxed italic">{post.excerpt}</p>
        </div>

        {/* Why This Matters Callout */}
        <motion.div className="my-14 p-8 rounded-2xl bg-gradient-to-br from-brand-navy/40 to-brand-blue/10 border border-white/[0.06]"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-blue" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Why This Matters</h3>
          </div>
          <p className="text-white/60 leading-relaxed">
            Healthcare costs in the U.S. have risen 40% in the last decade. Over 27 million Americans lack health insurance entirely. For millions more with high-deductible plans, a single dental emergency or monthly prescription can mean choosing between health and rent. Nuevo Progreso represents a practical, accessible alternative — not a last resort, but a smart financial decision made by millions every year.
          </p>
        </motion.div>

        {/* Content */}
        <article><RichContent content={post.content} /></article>

        {/* ===== SAVINGS SUMMARY ===== */}
        <SectionDivider icon="💰" label="Total Savings Potential" />
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <motion.div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-6 text-center"
            whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-3xl font-bold font-display text-emerald-400">$7,350</p>
            <p className="text-white/50 text-sm mt-1">Dental Tourist</p>
            <p className="text-white/30 text-xs mt-2">2 crowns + 1 implant</p>
          </motion.div>
          <motion.div className="rounded-2xl bg-gradient-to-br from-brand-blue/10 to-blue-600/5 border border-brand-blue/20 p-6 text-center"
            whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <Shield className="w-8 h-8 text-brand-blue mx-auto mb-3" />
            <p className="text-3xl font-bold font-display text-brand-blue">$3,150</p>
            <p className="text-white/50 text-sm mt-1">Pharmacy Runner</p>
            <p className="text-white/30 text-xs mt-2">3 Rx + eye exam/glasses</p>
          </motion.div>
          <motion.div className="rounded-2xl bg-gradient-to-br from-amber/10 to-yellow-600/5 border border-amber/20 p-6 text-center"
            whileHover={{ y: -4 }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Star className="w-8 h-8 text-amber mx-auto mb-3" />
            <p className="text-3xl font-bold font-display text-amber">$9,280</p>
            <p className="text-white/50 text-sm mt-1">Full Makeover</p>
            <p className="text-white/30 text-xs mt-2">Dental + Botox + glasses</p>
          </motion.div>
        </div>

        {/* ===== PULL QUOTE ===== */}
        <PullQuote>
          A single dental implant in the U.S. costs roughly what a full mouth of work costs in Nuevo Progreso. If you need extensive dental work, the savings alone can pay for your trip — multiple times over.
        </PullQuote>

        {/* ===== EXPANDABLE: Quality Verification ===== */}
        <Expandable title="How to Verify Provider Quality" icon={<Shield className="w-4 h-4" />}>
          <ul className="space-y-2">
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> Ask for before-and-after photos of actual patients</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> Check if the dentist studied or trained in the U.S.</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> Look for memberships in international dental organizations</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> Read patient reviews on third-party platforms</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> Ask about specific implant brands (Straumann, Nobel Biocare, Zimmer)</li>
          </ul>
        </Expandable>

        <Expandable title="Important Notes About Pharmacy Purchases" icon={<Shield className="w-4 h-4" />}>
          <ul className="space-y-2">
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> Bring your prescription — helps especially when re-entering the U.S.</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> Stick to licensed pharmacies with licensed pharmacists</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> U.S. customs allows 90-day supply for personal use</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> Keep medications in original packaging</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-green" /> Generic medications show the biggest savings vs. brand-name</li>
          </ul>
        </Expandable>

        {/* ===== CTA ===== */}
        <motion.div className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-navy via-brand-blue/80 to-brand-navy p-10 sm:p-14 border border-white/[0.06]"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-blue/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-brand-green/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-3xl sm:text-4xl font-bold font-display mb-4">Ready to Find Your Provider?</h3>
            <p className="text-white/50 text-lg mb-8 max-w-lg">Compare prices, read verified reviews, and book with confidence on ClearCross Progreso.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/search" className="px-8 py-4 bg-white text-brand-navy font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-xl shadow-black/20">
                Find a Provider →
              </Link>
              <Link href="/how-it-works" className="px-8 py-4 bg-white/[0.06] text-white font-semibold rounded-xl border border-white/[0.1] hover:bg-white/[0.12] transition-colors">
                How It Works
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ===== SHARE BAR ===== */}
        <div className="mt-12 flex items-center justify-between border-t border-b border-white/[0.06] py-4">
          <span className="text-sm text-white/30">Found this helpful?</span>
          <div className="flex gap-4">
            <button className="flex items-center gap-1.5 text-sm text-white/40 hover:text-brand-blue transition-colors"><Share2 className="w-4 h-4" />Share</button>
            <button className="flex items-center gap-1.5 text-sm text-white/40 hover:text-brand-blue transition-colors"><BookmarkPlus className="w-4 h-4" />Save</button>
          </div>
        </div>

        {/* ===== AUTHOR CARD ===== */}
        <div className="mt-10 rounded-2xl p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg font-display">CC</span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white font-display">{post.author}</h4>
            <p className="mt-1 text-white/50 leading-relaxed">
              The ClearCross Progreso team provides accurate, helpful information about medical tourism in Mexico. We help patients make informed decisions about their care across the border.
            </p>
          </div>
        </div>

        {/* ===== RELATED POSTS ===== */}
        {relatedPosts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rp, idx) => (
                <motion.div key={rp.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.1 }}>
                  <Link href={`/blog/${rp.slug}`}
                    className="group block rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-44 overflow-hidden">
                      {rp.coverImage ? (
                        <Image src={rp.coverImage} alt={rp.title} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-navy to-brand-blue" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                    </div>
                    <div className="p-5">
                      {rp.tags[0] && <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">{rp.tags[0]}</span>}
                      <h3 className="mt-2 text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">{rp.title}</h3>
                      <p className="mt-2 text-xs text-white/40 line-clamp-2">{rp.excerpt}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ===== FOOTER NOTE ===== */}
        <div className="mt-20 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-xs text-white/20">
            Sources: Placidway, Medical Tourism Co, Dental Departures, WhatClinic, Dental Solutions Algodones, TravelAwaits, MexFacts. Prices reflect 2026 market data. Individual results may vary.
          </p>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
