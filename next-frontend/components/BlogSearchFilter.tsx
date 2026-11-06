'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  X,
  Layers,
  Tag,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { ArticleSummary, CategoryItem } from '../lib/api';

interface BlogSearchFilterProps {
  initialArticles: ArticleSummary[];
  categories: CategoryItem[];
  totalCount?: number;
}

export default function BlogSearchFilter({
  initialArticles,
  categories,
  totalCount,
}: BlogSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Instant client-side search filter
  const filteredArticles = useMemo(() => {
    let list = initialArticles;

    // 1. Category Filter
    if (selectedCategory) {
      list = list.filter((a) => a.category === selectedCategory);
    }

    // 2. Search Query Filter (Title, Excerpt, Content, Author, Category Label)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
          (a.content_snippet && a.content_snippet.toLowerCase().includes(q)) ||
          (a.category_label && a.category_label.toLowerCase().includes(q)) ||
          (a.author_name && a.author_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [initialArticles, selectedCategory, searchQuery]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 200);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  return (
    <>
      {/* HERO & SEARCH SECTION */}
      <section className="relative hero-assam-bg pt-12 sm:pt-16 pb-16 sm:pb-20 border-b border-emerald-900/15 dark:border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Official Axom AI Blog &amp; Engineering Publication
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-emerald-950 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto mb-4 sm:mb-6">
            Ideas, Technology &amp; Insights <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              from Assam&apos;s AI Frontier
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            Explore practical guides, new AI models, regional research, and digital strategies empowering students, freelancers, and businesses across Assam.
          </p>

          {/* PROPERLY STYLED AJAX SEARCH BAR */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="relative flex items-center">
              {/* Glowing Accent Ring on Search Bar */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full blur opacity-25 group-focus-within:opacity-75 transition duration-300 pointer-events-none" />

              <div className="relative w-full flex items-center rounded-full bg-white/95 dark:bg-slate-900/95 border border-emerald-900/20 dark:border-white/15 group-focus-within:border-emerald-500/60 shadow-xl transition-all">
                {/* Search Icon */}
                <div className="pl-5 pr-3 text-slate-500 dark:text-slate-400 text-sm">
                  {isSearching ? (
                    <span className="inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search size={18} />
                  )}
                </div>

                {/* Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search topics, models, guides (e.g. Students, Notes, PDF, Tools)..."
                  className="w-full py-3.5 sm:py-4 pr-24 bg-transparent text-emerald-950 dark:text-white placeholder-slate-400 text-xs sm:text-sm md:text-base focus:outline-none"
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="mr-2 w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 grid place-items-center text-xs transition"
                  >
                    <X size={14} />
                  </button>
                )}

                {/* Live Counter Badge */}
                <div className="pr-3 hidden sm:flex items-center">
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                    {filteredArticles.length} {filteredArticles.length === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AJAX CATEGORY FILTER TABS */}
      <section className="sticky top-[64px] sm:top-[72px] z-30 bg-[#f0fdf4]/95 dark:bg-[#0b1220]/95 backdrop-blur-xl border-b border-emerald-900/15 dark:border-white/10 py-3 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1">
            {/* All Articles Button */}
            <button
              onClick={() => setSelectedCategory('')}
              className={`cat-btn shrink-0 px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 transition ${
                !selectedCategory
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'border-emerald-900/15 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/10'
              }`}
            >
              <Layers size={13} />
              <span>All Articles</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  !selectedCategory
                    ? 'bg-white/20 text-white font-bold'
                    : 'bg-emerald-900/5 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                }`}
              >
                {initialArticles.length}
              </span>
            </button>

            {/* Category Pills */}
            {categories.map((cat, i) => {
              const isActive = selectedCategory === cat.val;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedCategory(cat.val)}
                  className={`cat-btn shrink-0 px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 transition ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-emerald-900/15 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/10'
                  }`}
                >
                  <Tag size={12} />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-emerald-900/5 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ARTICLES CONTAINER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Active Filter Notice */}
        {(searchQuery || selectedCategory) && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-emerald-900/15 dark:border-white/10">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm flex-wrap">
              <span className="text-slate-600 dark:text-slate-400">Filtering:</span>
              {searchQuery && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold text-xs border border-emerald-500/30 inline-flex items-center gap-1.5">
                  <Search size={11} /> &quot;{searchQuery}&quot;
                </span>
              )}
              {selectedCategory && (
                <span className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 font-semibold text-xs border border-teal-500/30 inline-flex items-center gap-1.5">
                  <Tag size={11} />{' '}
                  {categories.find((c) => c.val === selectedCategory)?.label || selectedCategory}
                </span>
              )}
              <span className="text-slate-500 dark:text-slate-400 text-xs">
                ({filteredArticles.length} matching)
              </span>
            </div>

            <button
              onClick={resetFilters}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw size={12} /> Reset filters
            </button>
          </div>
        )}

        {/* ARTICLES GRID — UNIFORM CARDS FOR ALL ARTICLES */}
        {filteredArticles.length > 0 ? (
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 flex items-center justify-between">
              <span>
                {searchQuery || selectedCategory
                  ? `Found Articles (${filteredArticles.length})`
                  : `All Articles & Guides (${filteredArticles.length})`}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">
                Real-time updated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredArticles.map((art, i) => {
                const fallbackGradients = [
                  'from-emerald-600 via-teal-600 to-cyan-700',
                  'from-teal-600 via-cyan-600 to-sky-700',
                  'from-emerald-700 via-teal-700 to-emerald-900',
                  'from-cyan-600 via-teal-600 to-emerald-700',
                ];
                const grad = fallbackGradients[i % fallbackGradients.length];

                return (
                  <article
                    key={art.id || i}
                    className="glass-card rounded-2xl flex flex-col justify-between overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10"
                  >
                    {/* Top Image Banner */}
                    <div className={`h-48 relative overflow-hidden shrink-0 bg-gradient-to-br ${grad}`}>
                      {art.cover_image_url ? (
                        <img
                          src={art.cover_image_url}
                          alt={art.title}
                          className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://aiaxom.co.in/static/dist/hero/assam.avif';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 grid place-items-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                      {/* Category Badge on Image */}
                      <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider text-emerald-950 dark:text-white font-bold bg-white/90 dark:bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-900/20 dark:border-white/15 z-10 shadow-sm">
                        {art.category_label || art.category}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 pb-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {art.published_at}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-2.5 line-clamp-2">
                        <Link href={art.link || `/blog/${art.slug}/`} className="focus:outline-none">
                          {art.title}
                        </Link>
                      </h3>

                      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-[13px] leading-relaxed line-clamp-3 mb-4">
                        {art.excerpt}
                      </p>
                    </div>

                    {/* Bottom Card Meta (Author + Read Link) */}
                    <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 grid place-items-center text-white font-bold text-[10px] shadow-xs">
                          {(art.author_name || 'A').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                            {art.author_name}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={art.link || `/blog/${art.slug}/`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 group-hover:translate-x-1 transition-all"
                      >
                        <span>Read</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="text-center py-16 sm:py-20 px-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid place-items-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4 shadow-sm">
              <Search size={22} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              No matching articles found
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              We couldn&apos;t find any articles matching your search query or selected category. Try searching with different keywords.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 text-xs px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
            >
              <RotateCcw size={13} /> Clear Filters &amp; View All
            </button>
          </div>
        )}
      </section>
    </>
  );
}
