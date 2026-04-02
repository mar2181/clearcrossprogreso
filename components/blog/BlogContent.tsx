'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, Calendar, User, Share2, BookmarkPlus } from 'lucide-react';

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

// Simple MDX-like content renderer with image support
function RichContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inTable = false;
  let tableLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';

  const flushTable = (key: string) => {
    if (tableLines.length < 2) return;
    const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
    const rows = tableLines.slice(2).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()));

    elements.push(
      <div key={key} className="my-8 overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full sm:rounded-xl overflow-hidden shadow-lg shadow-brand-navy/5">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-brand-navy to-brand-blue">
                {headers.map((h, i) => (
                  <th key={i} className="px-5 py-3.5 text-left text-xs sm:text-sm font-semibold text-white tracking-wide uppercase">
                    {h.replace(/\*\*/g, '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, ri) => (
                <tr key={ri} className={`${ri % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'} hover:bg-brand-blue-light/50 transition-colors`}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap"
                      dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, '<strong class="text-brand-navy font-semibold">$1</strong>') }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
    tableLines = [];
    inTable = false;
  };

  const flushList = (key: string) => {
    if (!listItems.length) return;
    const ListTag = listType;
    elements.push(
      <ListTag key={key} className={`my-6 space-y-3 ${listType === 'ul' ? 'list-none pl-0' : 'list-decimal pl-6'}`}>
        {listItems.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-700 leading-relaxed">
            {listType === 'ul' && (
              <span className="mt-2 w-2 h-2 rounded-full bg-brand-green flex-shrink-0" />
            )}
            <span dangerouslySetInnerHTML={{
              __html: item
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
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

    // Image
    if (trimmed.match(/^!\[.*?\]\(.*?\)$/)) {
      if (inList) flushList(key);
      if (inTable) flushTable(key);
      const altMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (altMatch) {
        const [, alt, src] = altMatch;
        elements.push(
          <motion.figure
            key={key}
            className="my-10 -mx-4 sm:mx-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-full h-56 sm:h-72 lg:h-96 rounded-2xl overflow-hidden shadow-xl shadow-brand-navy/10">
              <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            {alt && (
              <figcaption className="mt-3 text-center text-sm text-gray-500 italic px-4">
                {alt}
              </figcaption>
            )}
          </motion.figure>
        );
      }
      continue;
    }

    // Table
    if (trimmed.startsWith('|')) {
      if (inList) flushList(key);
      if (!inTable) inTable = true;
      if (!trimmed.match(/^\|[-\s|]+\|$/)) {
        tableLines.push(trimmed);
      }
      continue;
    } else if (inTable) {
      flushTable(key);
    }

    // H2
    if (trimmed.startsWith('## ')) {
      if (inList) flushList(key);
      const text = trimmed.replace('## ', '');
      elements.push(
        <motion.h2
          key={key}
          className="group mt-14 mb-6 text-2xl sm:text-3xl font-bold font-display text-brand-navy flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-blue to-brand-green flex-shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, '<span class="text-brand-blue">$1</span>') }} />
        </motion.h2>
      );
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      if (inList) flushList(key);
      const text = trimmed.replace('### ', '');
      elements.push(
        <h3 key={key} className="mt-10 mb-4 text-xl font-semibold text-gray-900 font-display"
          dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, '<span class="text-brand-blue">$1</span>') }} />
      );
      continue;
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inTable) flushTable(key);
      if (!inList) { inList = true; listType = 'ul'; }
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      continue;
    }

    // Ordered list
    if (trimmed.match(/^\d+\.\s+/)) {
      if (inTable) flushTable(key);
      if (!inList) { inList = true; listType = 'ol'; }
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      continue;
    }

    // Empty line — flush
    if (!trimmed) {
      if (inList) flushList(key);
      if (inTable) flushTable(key);
      continue;
    }

    // Paragraph
    if (inList) flushList(key);
    if (inTable) flushTable(key);

    elements.push(
      <p key={key} className="mb-5 text-gray-600 leading-[1.85] text-[17px]"
        dangerouslySetInnerHTML={{
          __html: trimmed
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
        }} />
    );
  }
  if (inList) flushList('end-list');
  if (inTable) flushTable('end-table');

  return <>{elements}</>;
}

export default function BlogContent({ post, relatedPosts }: BlogContentProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ===== HERO SECTION ===== */}
      <section className="relative">
        {/* Cover image full-bleed */}
        {post.coverImage ? (
          <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/30 to-transparent" />

            {/* Content overlay on hero */}
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 w-full">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="inline-block px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-white/30 transition-colors capitalize"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>

                {/* Title */}
                <motion.h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white leading-tight max-w-3xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  {post.title}
                </motion.h1>

                {/* Meta row */}
                <motion.div
                  className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {post.readingTime}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          /* Fallback: no image, gradient hero */
          <div className="relative w-full bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy py-20 sm:py-28">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2 mb-5">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-block px-3 py-1 text-xs font-semibold bg-white/15 text-white rounded-full border border-white/20 capitalize">
                    {tag}
                  </Link>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white leading-tight">{post.title}</h1>
              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/70">
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formattedDate}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readingTime}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===== ARTICLE BODY ===== */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back link */}
        <Link href="/blog"
          className="inline-flex items-center text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          All Articles
        </Link>

        {/* Excerpt callout */}
        <div className="relative bg-gradient-to-r from-brand-blue-light/60 to-brand-green-light/40 border-l-4 border-brand-blue rounded-r-xl px-6 py-5 mb-10">
          <p className="text-gray-700 text-lg leading-relaxed italic">
            {post.excerpt}
          </p>
        </div>

        {/* Content */}
        <article className="prose-enhanced">
          <RichContent content={post.content} />
        </article>

        {/* ===== CTA CARD ===== */}
        <motion.div
          className="mt-14 relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-navy to-brand-blue p-8 sm:p-10 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-green/10 rounded-full" />

          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold font-display mb-3">
              Ready to Find Your Provider?
            </h3>
            <p className="text-blue-100 text-lg mb-8 max-w-lg">
              Compare prices, read verified reviews, and book your appointment with confidence on ClearCross Progreso.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/search"
                className="inline-flex items-center px-7 py-3.5 bg-white text-brand-navy font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-black/10">
                Find a Provider
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/how-it-works"
                className="inline-flex items-center px-7 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm">
                How It Works
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ===== SHARE & BOOKMARK BAR ===== */}
        <div className="mt-10 flex items-center justify-between border-t border-b border-gray-200 py-4">
          <span className="text-sm text-gray-500">Found this helpful?</span>
          <div className="flex gap-3">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-blue transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-blue transition-colors">
              <BookmarkPlus className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* ===== AUTHOR CARD ===== */}
        <div className="mt-10 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg font-display">CC</span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 font-display">{post.author}</h4>
            <p className="mt-1 text-gray-600 leading-relaxed">
              The ClearCross Progreso team provides accurate, helpful information about medical tourism in Mexico. We help patients make informed decisions about their care across the border.
            </p>
          </div>
        </div>

        {/* ===== RELATED POSTS ===== */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rp, idx) => (
                <motion.div
                  key={rp.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <Link href={`/blog/${rp.slug}`}
                    className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-44 overflow-hidden">
                      {rp.coverImage ? (
                        <Image src={rp.coverImage} alt={rp.title} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 33vw" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-navy to-brand-blue" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="p-5">
                      {rp.tags[0] && (
                        <span className="text-xs font-semibold text-brand-blue uppercase tracking-wide">{rp.tags[0]}</span>
                      )}
                      <h3 className="mt-2 text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
                        {rp.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{rp.excerpt}</p>
                      <span className="mt-3 inline-block text-xs text-gray-400">
                        {new Date(rp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
