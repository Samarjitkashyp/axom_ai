'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Fuel,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  BookOpen,
  ChevronRight,
  HelpCircle,
  RefreshCw,
  Car,
  Bike,
  Info,
  ArrowRight,
  Share2,
  Copy,
  Check,
  FileText,
  Zap,
  Award,
  Layers,
  Wrench,
  Percent,
  TrendingDown
} from 'lucide-react';

interface FuelBlendInfo {
  status: 'compatible' | 'caution' | 'incompatible' | string;
  label: string;
  ethanol: string;
}

interface VehicleReport {
  is_verified: boolean;
  vehicle: {
    id: string;
    name: string;
    brand: string;
    category: string;
    image: string;
    engine: string;
    year_selected: number | string;
    variant: string;
    bs_stage: string;
    max_approved_blend: string;
  };
  fuel_matrix: Record<string, FuelBlendInfo>;
  technical_explanation: {
    material_compatibility: string;
    calibration_status: string;
    details: string;
    mileage_impact: string;
  };
  evidence: {
    official_quote: string;
    source: string;
  };
  actionable_guidance: {
    summary: string;
    what_to_do: string;
    tips: string[];
  };
}

const QUICK_POPULAR_VEHICLES = [
  { name: 'Honda Activa 6G', year: 2023, cat: 'scooter', label: '🛵 Activa 6G' },
  { name: 'Hero Splendor Plus', year: 2023, cat: 'bike', label: '🏍️ Splendor Plus' },
  { name: 'Maruti Suzuki Swift', year: 2024, cat: 'car', label: '🚗 Maruti Swift' },
  { name: 'Hyundai Creta', year: 2023, cat: 'car', label: '🚗 Hyundai Creta' },
  { name: 'Royal Enfield Classic 350', year: 2023, cat: 'bike', label: '🏍️ Classic 350' },
  { name: 'TVS Jupiter', year: 2023, cat: 'scooter', label: '🛵 TVS Jupiter' },
  { name: 'Tata Nexon Petrol', year: 2023, cat: 'car', label: '🚗 Tata Nexon' },
  { name: 'Bajaj Pulsar 150', year: 2023, cat: 'bike', label: '🏍️ Pulsar 150' },
  { name: 'Mahindra Thar Petrol', year: 2023, cat: 'car', label: '🚙 Mahindra Thar' },
  { name: 'Honda City', year: 2021, cat: 'car', label: '🚗 Honda City' },
];

const PREPOPULATED_QUESTIONS = [
  "Can I put XP95 or Speed95 petrol to completely avoid ethanol?",
  "What happens if I accidentally filled E20 in my 2017 bike?",
  "Will using E20 petrol void my vehicle warranty?",
  "Is ethanol fuel stabilizer effective for 2-wheelers?"
];

export default function FuelChecker() {
  // Input States
  const [searchQuery, setSearchQuery] = useState('Honda Activa 6G');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'car' | 'bike' | 'scooter'>('all');
  const [manufacturingYear, setManufacturingYear] = useState<number>(2023);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('honda-activa-6g');

  // Search suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Results State
  const [report, setReport] = useState<VehicleReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'engine' | 'mileage' | 'proof' | 'advice'>('matrix');

  // Q&A State
  const [askQuestion, setAskQuestion] = useState('');
  const [askAnswer, setAskAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Search input ref for closing dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial report on mount
  useEffect(() => {
    handleEvaluate('Honda Activa 6G', 2023, 'honda-activa-6g');
  }, []);

  // Handle Autocomplete Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/fuel-check/search/?q=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSuggestions(data.results || []);
          }
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Click outside listener for search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Evaluate compatibility
  const handleEvaluate = async (vName?: string, vYear?: number, vId?: string) => {
    const name = vName !== undefined ? vName : searchQuery;
    const year = vYear !== undefined ? vYear : manufacturingYear;
    const id = vId !== undefined ? vId : selectedVehicleId;

    if (!name.trim()) {
      setErrorMsg('Please enter or select a vehicle name.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setAskAnswer('');

    try {
      const res = await fetch('/api/fuel-check/evaluate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_name: name,
          manufacturing_year: year,
          vehicle_id: id,
          category: selectedCategory !== 'all' ? selectedCategory : 'car',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate vehicle compatibility');
      }

      const data = await res.json();
      if (data.success) {
        setReport(data);
      } else {
        setErrorMsg(data.error || 'Could not verify compatibility for this vehicle.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Asking Custom Doubt
  const handleAskDoubt = async (queryText?: string) => {
    const q = (queryText || askQuestion).trim();
    if (!q) return;

    setIsAsking(true);
    setAskAnswer('');

    try {
      const res = await fetch('/api/fuel-check/ask/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          vehicle_context: report ? report.vehicle : { name: searchQuery, year_selected: manufacturingYear },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAskAnswer(data.answer);
        } else {
          setAskAnswer(data.error || 'Failed to generate answer.');
        }
      }
    } catch (err) {
      setAskAnswer('Network error while answering your doubt. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  // Helper: Status Badges and Color Accents
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compatible':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          text: 'Compatible',
        };
      case 'caution':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          text: 'Verify / Caution',
        };
      default:
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: XCircle,
          text: 'Incompatible',
        };
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs md:text-sm py-2 px-4 text-center font-medium shadow-sm">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          India's 1st Authoritative <strong>Ethanol Fuel Compatibility Engine (E5 to E100)</strong> — Backed by MoRTH, ARAI &amp; Official Owner Manuals.
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Main Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Fuel className="w-3.5 h-3.5 text-indigo-600" />
            Automotive Intelligence Utility
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Vehicle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">Fuel Compatibility</span> Checker
          </h1>
          <p className="mt-3 text-slate-600 text-base sm:text-lg leading-relaxed">
            Find out if your Bike, Scooter, or Car is officially certified for <strong>E10, E20, E85, or E100</strong> petrol.
            Get exact manufacturer citations, engine material safety reports, and expected mileage impact.
          </p>
        </div>

        {/* Interactive Search Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 mb-10 relative">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">Category:</span>
            {(['all', 'car', 'bike', 'scooter'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' && <Layers className="w-3.5 h-3.5" />}
                {cat === 'car' && <Car className="w-3.5 h-3.5" />}
                {cat === 'bike' && <Bike className="w-3.5 h-3.5" />}
                {cat === 'scooter' && <Fuel className="w-3.5 h-3.5" />}
                {cat === 'all' ? 'All Vehicles' : cat === 'car' ? 'Cars' : cat === 'bike' ? 'Bikes' : 'Scooters'}
              </button>
            ))}
          </div>

          {/* Search Bar & Year Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative">
            {/* Search Input with Autocomplete */}
            <div className="md:col-span-8 relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Vehicle Name / Model
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="e.g. Honda Activa 6G, Maruti Swift, Pulsar 150, Creta..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-base transition-all"
                />
                {isSearching && (
                  <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Verified Vehicle Matches
                  </div>
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.name);
                        setSelectedVehicleId(item.id);
                        setShowDropdown(false);
                        handleEvaluate(item.name, manufacturingYear, item.id);
                      }}
                      className="px-4 py-3 hover:bg-indigo-50/70 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300';
                          }}
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.engine} • {item.brand}</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        Select →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Year Selector */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Manufacturing Year
              </label>
              <select
                value={manufacturingYear}
                onChange={(e) => setManufacturingYear(Number(e.target.value))}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-base transition-all"
              >
                {Array.from({ length: 26 }, (_, i) => 2026 - i).map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} {yr >= 2023 ? '⭐ (BS6 Phase-2 / E20 Norms)' : yr >= 2020 ? '(BS6 Phase-1)' : '(BS4 / Older)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Select Popular Vehicles */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Popular Searches:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_POPULAR_VEHICLES.map((v) => (
                <button
                  key={v.name}
                  onClick={() => {
                    setSearchQuery(v.name);
                    setManufacturingYear(v.year);
                    handleEvaluate(v.name, v.year);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-transparent text-xs font-medium text-slate-700 transition-all"
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              Grounded in official OEM vehicle manuals and MoRTH/ARAI standards.
            </div>

            <button
              onClick={() => handleEvaluate()}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Verifying Vehicle Data...
                </>
              ) : (
                <>
                  <Gauge className="w-5 h-5 text-indigo-200" />
                  Check Fuel Compatibility
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Results Section */}
        {report && (
          <div className="space-y-8 animate-fadeIn">
            {/* Vehicle Profile Hero Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              {/* Left Side: Vehicle Info & Specs */}
              <div className="space-y-3 z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700">
                  {report.is_verified ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Manufacturer Record
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Regulatory Estimated Record
                    </>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {report.vehicle.name}
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                    Year: {report.vehicle.year_selected}
                  </span>
                  <span className="font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                    Stage: {report.vehicle.bs_stage}
                  </span>
                  <span className="font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Engine: {report.vehicle.engine}
                  </span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed pt-1">
                  <strong>Variant Generation:</strong> {report.vehicle.variant}
                </p>

                {/* Main E20 Status Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 mt-2 ${
                  report.fuel_matrix['E20'].status === 'compatible'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : report.fuel_matrix['E20'].status === 'caution'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full ${
                      report.fuel_matrix['E20'].status === 'compatible'
                        ? 'bg-emerald-500 ring-4 ring-emerald-200'
                        : report.fuel_matrix['E20'].status === 'caution'
                        ? 'bg-amber-500 ring-4 ring-amber-200'
                        : 'bg-rose-500 ring-4 ring-rose-200'
                    }`} />
                    <div>
                      <div className="text-xs uppercase font-extrabold tracking-wider opacity-75">
                        E20 Compatibility Status
                      </div>
                      <div className="text-base sm:text-lg font-bold">
                        {report.fuel_matrix['E20'].label}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200 shadow-sm">
                    Max: {report.vehicle.max_approved_blend}
                  </span>
                </div>
              </div>

              {/* Right Side: Vehicle Dynamic Image */}
              <div className="relative w-full md:w-80 h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 flex-shrink-0 shadow-inner group">
                <img
                  src={report.vehicle.image}
                  alt={report.vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-bold bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                    {report.vehicle.brand} Official Portfolio
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
              {[
                { id: 'matrix', label: '⛽ Fuel Matrix (E5-E100)', icon: Gauge },
                { id: 'engine', label: '⚙️ Engine & Materials', icon: Wrench },
                { id: 'mileage', label: '📉 Mileage Impact', icon: TrendingDown },
                { id: 'proof', label: '📜 Official Proof & Quote', icon: FileText },
                { id: 'advice', label: '🛡️ Owner Action Advice', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Fuel Compatibility Matrix Grid */}
            {activeTab === 'matrix' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(report.fuel_matrix).map(([blendKey, blendData]) => {
                    const badge = getStatusBadge(blendData.status);
                    const StatusIcon = badge.icon;
                    return (
                      <div
                        key={blendKey}
                        className={`bg-white border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden ${
                          blendKey === 'E20' ? 'ring-2 ring-indigo-500 border-indigo-300' : 'border-slate-200'
                        }`}
                      >
                        {blendKey === 'E20' && (
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg">
                            National Focus
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {blendKey}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {blendData.ethanol} Ethanol
                          </span>
                        </div>

                        <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 mb-3 ${badge.bg}`}>
                          <StatusIcon className="w-4 h-4 flex-shrink-0" />
                          <span>{blendData.label}</span>
                        </div>

                        {/* Gasoline vs Ethanol Visual Meter */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                            <span>Gasoline: {100 - parseInt(blendData.ethanol)}%</span>
                            <span>Alcohol: {blendData.ethanol}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${100 - parseInt(blendData.ethanol)}%` }}
                              className="bg-slate-400 h-full"
                            />
                            <div
                              style={{ width: blendData.ethanol }}
                              className={
                                blendData.status === 'compatible'
                                  ? 'bg-emerald-500 h-full'
                                  : blendData.status === 'caution'
                                  ? 'bg-amber-500 h-full'
                                  : 'bg-rose-500 h-full'
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Important Callout */}
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Crucial Indian Automotive Fact:</strong> As per Government of India guidelines, all commercial pumps are transitioning to E20.
                    Vehicles manufactured prior to April 2023 were designed for E10. While single fill-ups do not stall the engine instantly, long-term exposure requires regular fuel hose checks.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Engine & Materials */}
            {activeTab === 'engine' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-indigo-600" />
                    Fuel System Materials &amp; Calibration Report
                  </h3>
                  <p className="text-sm text-slate-600">
                    Ethanol is hygroscopic (absorbs moisture) and highly corrosive to standard rubber and zinc/brass alloys.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs uppercase font-bold text-slate-500 mb-1">
                      Material Compatibility (Hoses, Seals, Tank)
                    </div>
                    <div className="text-base font-bold text-slate-900 capitalize mb-2">
                      {report.technical_explanation.material_compatibility.replace(/_/g, ' ')}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {report.technical_explanation.details}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs uppercase font-bold text-slate-500 mb-1">
                      Engine Calibration (ECU / Stoichiometry)
                    </div>
                    <div className="text-base font-bold text-slate-900 capitalize mb-2">
                      {report.technical_explanation.calibration_status.replace(/_/g, ' ')}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ethanol requires richer air-fuel mixtures. OBD-2 compliant models dynamically adjust Long Term Fuel Trims (LTFT) to maintain smooth combustion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Mileage Impact */}
            {activeTab === 'mileage' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-amber-600" />
                    Fuel Economy &amp; Mileage Variance
                  </h3>
                  <p className="text-sm text-slate-600">
                    Ethanol has approximately <strong>33% less energy density</strong> than pure commercial gasoline.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                  <div className="text-sm font-bold flex items-center gap-2">
                    <Percent className="w-4 h-4 text-amber-700" />
                    Estimated Fuel Economy Impact:
                  </div>
                  <p className="text-sm">
                    {report.technical_explanation.mileage_impact}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="text-xs text-slate-500 font-semibold mb-1">E10 Blend</div>
                    <div className="text-xl font-black text-slate-900">~1% - 2%</div>
                    <div className="text-[11px] text-slate-500">Minimal drop (Standard)</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
                    <div className="text-xs text-amber-700 font-semibold mb-1">E20 Blend</div>
                    <div className="text-xl font-black text-amber-800">~3% - 6%</div>
                    <div className="text-[11px] text-amber-700">Noticeable mileage loss</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50">
                    <div className="text-xs text-rose-700 font-semibold mb-1">E85 (Flex-Fuel)</div>
                    <div className="text-xl font-black text-rose-800">~25% - 30%</div>
                    <div className="text-[11px] text-rose-700">Requires dual-calibration</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Official Proof */}
            {activeTab === 'proof' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Official Manufacturer Citation &amp; Evidence
                  </h3>
                  <p className="text-sm text-slate-600">
                    Verified against official automotive documents to ensure zero hallucination.
                  </p>
                </div>

                <blockquote className="p-5 rounded-2xl bg-slate-50 border-l-4 border-indigo-600 text-slate-800 text-sm italic font-medium leading-relaxed">
                  "{report.evidence.official_quote}"
                </blockquote>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <strong>Document Source:</strong> {report.evidence.source}
                </div>
              </div>
            )}

            {/* Tab 5: Owner Action Advice */}
            {activeTab === 'advice' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Recommended Driver Action Plan
                  </h3>
                  <p className="text-sm text-slate-600">
                    {report.actionable_guidance.summary}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-sm leading-relaxed">
                  <strong>What you should do:</strong> {report.actionable_guidance.what_to_do}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Expert Maintenance Tips:
                  </h4>
                  <ul className="space-y-2">
                    {report.actionable_guidance.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* AI Doubt Solver Q&A Box */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Axom FuelCheck AI Assistant
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Have a specific doubt about your vehicle &amp; fuel?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-4">
                Ask our grounded automotive intelligence engine about petrol pumps, additives, emergency fill-ups, or XP95.
              </p>

              {/* Pre-populated Questions */}
              <div className="flex flex-wrap gap-2 mb-4">
                {PREPOPULATED_QUESTIONS.map((pq, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAskQuestion(pq);
                      handleAskDoubt(pq);
                    }}
                    className="text-xs bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm transition-all text-left"
                  >
                    {pq}
                  </button>
                ))}
              </div>

              {/* Ask Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={askQuestion}
                  onChange={(e) => setAskQuestion(e.target.value)}
                  placeholder={`Ask anything about ${report.vehicle.name} & E20 fuel...`}
                  className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskDoubt();
                  }}
                />
                <button
                  onClick={() => handleAskDoubt()}
                  disabled={isAsking || !askQuestion.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                >
                  {isAsking ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ask AI'}
                </button>
              </div>

              {/* AI Answer Box */}
              {askAnswer && (
                <div className="mt-4 p-5 rounded-2xl bg-white border border-indigo-200 shadow-sm text-sm text-slate-800 leading-relaxed whitespace-pre-line animate-fadeIn">
                  <div className="font-bold text-indigo-700 mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Automotive Engineer Response:
                  </div>
                  {askAnswer}
                </div>
              )}
            </div>

            {/* Share / Copy / Actions */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
              <span>Verified against MoRTH Notification &amp; SIAM Circulars (2025-2026)</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                {copiedLink ? 'Link Copied!' : 'Share Vehicle Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
