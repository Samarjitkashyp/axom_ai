'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ArticleSummary, CategoryItem } from '../lib/api';

interface BlogSearchFilterProps {
  initialArticles: ArticleSummary[];
  categories: CategoryItem[];
  totalCount?: number;
}

export default function BlogSearchFilter({ initialArticles, categories, totalCount }: BlogSearchFilterProps) {
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

  // Featured Article Spotlight (when no search & all categories)
  const featuredArticle = useMemo(() => {
    if (!searchQuery && !selectedCategory && filteredArticles.length > 0) {
      return filteredArticles[0];
    }
    return null;
  }, [filteredArticles, searchQuery, selectedCategory]);

  // Grid articles (remaining articles or all matching articles)
  const gridArticles = useMemo(() => {
    if (featuredArticle) {
      return filteredArticles.slice(1);
    }
    return filteredArticles;
  }, [filteredArticles, featuredArticle]);

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
      <section className="relative hero-assam-bg pt-16 pb-20 border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
            Official Axom AI Blog &amp; Insights
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
            Ideas, Technology &amp; Insights <br className="hidden sm:block" />
            <span className="gradient-text">
              from Assam's AI Frontier
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            Explore practical guides, new AI models, regional research, and digital strategies empowering students, freelancers, and businesses across Assam.
          </p>

          {/* PROPERLY STYLED AJAX SEARCH BAR */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="relative flex items-center">
              {/* Glowing Accent Ring on Search Bar */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full blur opacity-25 group-focus-within:opacity-75 transition duration-300 pointer-events-none" />

              <div className="relative w-full flex items-center rounded-full bg-slate-900/90 border border-white/15 group-focus-within:border-fuchsia-500/60 shadow-2xl transition-all">
                {/* Search Icon */}
                <div className="pl-5 pr-3 text-gray-400 text-sm">
                  <i className={`fa-solid ${isSearching ? 'fa-spinner fa-spin text-fuchsia-400' : 'fa-magnifying-glass'}`} />
                </div>

                {/* Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search topics, models, guides (e.g. Students, Productivity, Tools)..."
                  className="w-full py-4 pr-24 bg-transparent text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none"
                />

                {/* Clear Button (Shown when text is typed) */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="mr-2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white grid place-items-center text-xs transition"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}

                {/* Live Counter Badge */}
                <div className="pr-3 hidden sm:flex items-center">
                  <span className="px-3 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-[11px] font-semibold text-fuchsia-300 whitespace-nowrap">
                    {filteredArticles.length} {filteredArticles.length === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AJAX CATEGORY FILTER TABS */}
      <section className="sticky top-[72px] z-40 bg-[#06060b]/90 backdrop-blur-xl border-b border-white/10 py-3 transition-all">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {/* All Articles Button */}
            <button
              onClick={() => setSelectedCategory('')}
              className={`cat-btn shrink-0 px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 ${
                !selectedCategory
                  ? 'active'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className="fa-solid fa-layer-group text-[11px] opacity-70" />
              <span>All Articles</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  !selectedCategory ? 'bg-fuchsia-500/30 text-fuchsia-200' : 'bg-white/10 text-gray-400'
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
                  className={`cat-btn shrink-0 px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 ${
                    isActive
                      ? 'active'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-fuchsia-500/30 text-fuchsia-200' : 'bg-white/10 text-gray-400'
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
      <section className="max-w-7xl mx-auto px-5 py-12">
        {/* Active Filter Notice */}
        {(searchQuery || selectedCategory) && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5 text-sm flex-wrap">
              <span className="text-gray-400">Filtering:</span>
              {searchQuery && (
                <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-semibold text-xs border border-fuchsia-500/40 inline-flex items-center gap-1.5">
                  <i className="fa-solid fa-magnifying-glass text-[10px]" /> "{searchQuery}"
                </span>
              )}
              {selectedCategory && (
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-semibold text-xs border border-purple-500/40 inline-flex items-center gap-1.5">
                  <i className="fa-solid fa-tag text-[10px]" />{' '}
                  {categories.find((c) => c.val === selectedCategory)?.label || selectedCategory}
                </span>
              )}
              <span className="text-gray-500 text-xs">({filteredArticles.length} matching)</span>
            </div>

            <button
              onClick={resetFilters}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 hover:underline flex items-center gap-1 font-semibold"
            >
              <i className="fa-solid fa-rotate-left" /> Reset filters
            </button>
          </div>
        )}

        {/* FEATURED STORY SPOTLIGHT (When no search & all categories) */}
        {featuredArticle && (
          <div className="mb-14">
            <div className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-star text-amber-400" /> Featured Insight
            </div>

            <Link href={featuredArticle.link || `/blog/${featuredArticle.slug}/`} className="group block">
              <div className="featured-card rounded-2xl p-6 sm:p-8 lg:p-10 transition-all duration-300 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  {/* Left Content */}
                  <div className="lg:col-span-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-[11px] font-bold uppercase tracking-wider">
                        {featuredArticle.category_label}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1.5">
                        <i className="fa-regular fa-clock text-fuchsia-400" /> {featuredArticle.read_time}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1.5">
                        <i className="fa-regular fa-calendar text-gray-500" /> {featuredArticle.published_at}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white group-hover:text-fuchsia-300 transition-colors leading-tight mb-4">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 grid place-items-center text-white font-bold text-xs shadow-md">
                          {(featuredArticle.author_name || 'A').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-xs font-semibold text-gray-200">
                          By {featuredArticle.author_name}
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 text-sm font-bold text-fuchsia-400 group-hover:translate-x-1.5 transition-transform">
                        <span>Read Full Article</span>
                        <i className="fa-solid fa-arrow-right text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Right Featured Image Box */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-2xl overflow-hidden border border-white/10 bg-slate-900/80 relative shadow-xl min-h-[220px] lg:min-h-[270px] group-hover:border-fuchsia-500/40 transition-all duration-300">
                    <div className="w-full h-full relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[270px]">
                      <img
                        src={featuredArticle.cover_image_url || 'https://aiaxom.co.in/static/dist/hero/assam.avif'}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to default asset if URL fails
                          (e.target as HTMLImageElement).src = 'https://aiaxom.co.in/static/dist/hero/assam.avif';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/90 via-black/20 to-transparent pointer-events-none" />
                      
                      {/* Floating metadata badges on the image */}
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] text-fuchsia-300 font-bold uppercase tracking-wider">
                          {featuredArticle.category_label}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] text-gray-200 font-medium flex items-center gap-1.5">
                          <i className="fa-regular fa-clock text-fuchsia-400 text-[9px]" /> {featuredArticle.read_time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ARTICLES GRID */}
        {gridArticles.length > 0 ? (
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-between">
              <span>
                {searchQuery || selectedCategory
                  ? `Found Articles (${filteredArticles.length})`
                  : 'Latest Stories & Guides'}
              </span>
              <span className="text-gray-500 text-[11px] font-normal">Real-time updated</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {gridArticles.map((art, i) => {
                const fallbackGradients = [
                  'from-fuchsia-600 via-purple-600 to-indigo-800',
                  'from-pink-600 via-rose-600 to-purple-800',
                  'from-amber-500 via-orange-600 to-red-700',
                  'from-cyan-500 via-blue-600 to-indigo-800',
                ];
                const grad = fallbackGradients[i % fallbackGradients.length];

                return (
                  <article
                    key={art.id || i}
                    className="glass-card rounded-2xl flex flex-col justify-between overflow-hidden group hover:border-fuchsia-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg shadow-black/40 hover:shadow-fuchsia-500/10"
                  >
                    {/* Top Image Banner */}
                    <div className={`h-44 relative overflow-hidden shrink-0 bg-gradient-to-br ${grad}`}>
                      {art.cover_image_url ? (
                        <img
                          src={art.cover_image_url}
                          alt={art.title}
                          className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="absolute inset-0 grid-bg opacity-30" />
                          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 grid place-items-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                      {/* Category Badge on Image */}
                      <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider text-white font-bold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15 z-10 shadow-md">
                        {art.category_label || art.category}
                      </div>
                    </div>

                    {/* Top Card Body */}
                    <div className="p-6 pb-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] text-gray-400 font-medium">
                          {art.published_at}
                        </span>
                        <span className="text-xs text-fuchsia-300 flex items-center gap-1.5">
                          <i className="fa-regular fa-clock text-fuchsia-400 text-[10px]" /> {art.read_time}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors leading-snug mb-3 line-clamp-2">
                        <Link href={art.link || `/blog/${art.slug}/`} className="focus:outline-none">
                          {art.title}
                        </Link>
                      </h3>

                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4">
                        {art.excerpt}
                      </p>
                    </div>

                    {/* Bottom Card Meta */}
                    <div className="px-6 py-4 border-t border-white/5 bg-slate-950/40 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-600 grid place-items-center text-white font-bold text-[10px] shadow-sm">
                          {(art.author_name || 'A').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-200 truncate max-w-[110px]">
                            {art.author_name}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={art.link || `/blog/${art.slug}/`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 group-hover:translate-x-1 transition-all"
                      >
                        <span>Read</span>
                        <i className="fa-solid fa-arrow-right text-[10px]" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          /* EMPTY STATE (No matching search results) */
          <div className="text-center py-20 px-5 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-2xl text-fuchsia-400 mx-auto mb-5 shadow-xl">
              <i className="fa-solid fa-magnifying-glass" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No matching articles found</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              We couldn't find any articles matching your search query or selected category. Try searching with different keywords.
            </p>
            <button
              onClick={resetFilters}
              className="btn-primary inline-flex items-center gap-2 text-xs px-6 py-3 rounded-full"
            >
              <i className="fa-solid fa-rotate-left" /> Clear Filters &amp; View All
            </button>
          </div>
        )}

        {/* COMMUNITY & NEWSLETTER BANNER */}
        <div className="mt-20 rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-purple-950/60 via-slate-900 to-fuchsia-950/60 border border-fuchsia-500/20 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold uppercase tracking-wider mb-4">
              <i className="fa-solid fa-wand-magic-sparkles text-fuchsia-300 text-xs" /> Axom AI Community
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              Build, Learn &amp; Innovate with AI in Assam
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
              Join thousands of students, researchers, and builders using Assam's indigenous AI platform for smarter productivity, document intelligence, and content creation.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://chat.aiaxom.co.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs sm:text-sm px-6 py-3 rounded-full inline-flex items-center gap-2"
              >
                Start Chatting Free <i className="fa-solid fa-arrow-right text-xs" />
              </a>
              <Link
                href="/#tools"
                className="btn-ghost text-xs sm:text-sm px-6 py-3 rounded-full inline-flex items-center gap-2"
              >
                Explore 12+ AI Tools
              </Link>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>
    </>
  );
}
