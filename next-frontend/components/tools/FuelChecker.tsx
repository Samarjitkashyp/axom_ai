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
  desc?: string;
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

interface CatalogVehicle {
  id: string;
  name: string;
  brand: string;
  category: string;
  years_start: number;
  years_end: number;
  years_available: number[];
  latest_year: number;
  engine: string;
  image: string;
  description: string;
}

const DEFAULT_POPULAR_TAGS = [
  { name: 'Activa 6G / 125', brand: 'Honda', cat: 'scooter', year: 2024, label: '🛵 Honda Activa 6G' },
  { name: 'Swift', brand: 'Maruti Suzuki', cat: 'car', year: 2024, label: '🚗 Maruti Swift' },
  { name: 'Splendor Plus / Super Splendor', brand: 'Hero', cat: 'bike', year: 2024, label: '🏍️ Hero Splendor Plus' },
  { name: 'Creta', brand: 'Hyundai', cat: 'car', year: 2024, label: '🚗 Hyundai Creta' },
  { name: 'Classic 350 (J-Series & UCE)', brand: 'Royal Enfield', cat: 'bike', year: 2023, label: '🏍️ RE Classic 350' },
  { name: 'Jupiter 110 / 125', brand: 'TVS', cat: 'scooter', year: 2024, label: '🛵 TVS Jupiter' },
  { name: 'Nexon Petrol', brand: 'Tata Motors', cat: 'car', year: 2024, label: '🚗 Tata Nexon' },
  { name: 'Pulsar 150 / Pulsar 125', brand: 'Bajaj', cat: 'bike', year: 2024, label: '🏍️ Bajaj Pulsar 150' },
  { name: 'Fronx', brand: 'Maruti Suzuki', cat: 'car', year: 2024, label: '🚗 Maruti Fronx (2024)' },
  { name: 'Thar Petrol', brand: 'Mahindra', cat: 'car', year: 2024, label: '🚙 Mahindra Thar' },
];

const PREPOPULATED_QUESTIONS = [
  "Can I put XP95 or Speed95 petrol to completely avoid ethanol?",
  "What happens if I accidentally filled E20 in my older BS4 bike/car?",
  "Will using E20 blended petrol void my manufacturer warranty?",
  "How long can I leave E20 petrol parked in the fuel tank before phase separation?"
];

export default function FuelChecker() {
  // Master Catalog State
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [brandsByCategory, setBrandsByCategory] = useState<Record<string, string[]>>({
    all: [],
    car: [],
    bike: [],
    scooter: []
  });
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  // Cascading Selection State
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'car' | 'bike' | 'scooter'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('Honda');
  const [selectedModelId, setSelectedModelId] = useState<string>('honda-activa-6g');
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  // Search autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CatalogVehicle[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Output Evaluation Report State
  const [report, setReport] = useState<VehicleReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'engine' | 'mileage' | 'proof' | 'advice'>('matrix');

  // Grounded AI Q&A State
  const [askQuestion, setAskQuestion] = useState('');
  const [askAnswer, setAskAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Fetch Master Catalog on Mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/fuel-check/catalog/');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.vehicles) {
            setVehicles(data.vehicles);
            if (data.brands_by_category) {
              setBrandsByCategory(data.brands_by_category);
            }
          }
        }
      } catch (err) {
        console.error('Error loading fuel catalog:', err);
      } finally {
        setIsCatalogLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // 2. Initial Evaluation on Load
  useEffect(() => {
    handleEvaluate('honda-activa-6g', 2024);
  }, []);

  // 3. Click outside search listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 4. Compute Available Brands for current category
  const availableBrands = useMemo(() => {
    if (brandsByCategory[selectedCategory] && brandsByCategory[selectedCategory].length > 0) {
      return brandsByCategory[selectedCategory];
    }
    // Fallback: derive from vehicles list
    const filtered = selectedCategory === 'all' 
      ? vehicles 
      : vehicles.filter(v => v.category === selectedCategory);
    return Array.from(new Set(filtered.map(v => v.brand))).sort();
  }, [brandsByCategory, selectedCategory, vehicles]);

  // 5. Compute Available Models for current brand & category
  const availableModels = useMemo(() => {
    return vehicles.filter(v => {
      const matchCat = selectedCategory === 'all' || v.category === selectedCategory;
      const matchBrand = v.brand === selectedBrand;
      return matchCat && matchBrand;
    });
  }, [vehicles, selectedCategory, selectedBrand]);

  // 6. Currently Selected Model Object
  const currentModel = useMemo(() => {
    return vehicles.find(v => v.id === selectedModelId) || availableModels[0] || null;
  }, [vehicles, selectedModelId, availableModels]);

  // 7. Compute Available Years for current model
  const availableYears = useMemo(() => {
    if (currentModel && currentModel.years_available && currentModel.years_available.length > 0) {
      return currentModel.years_available;
    }
    // Fallback if not loaded yet
    return [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  }, [currentModel]);

  // Handle Search Input Filtering
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = vehicles.filter(v => {
      const full = `${v.brand} ${v.name} ${v.description}`.toLowerCase();
      return full.includes(q);
    });
    setSuggestions(matches.slice(0, 10));
  }, [searchQuery, vehicles]);

  // Cascading Handler 1: Change Category
  const handleCategoryChange = (newCat: 'all' | 'car' | 'bike' | 'scooter') => {
    setSelectedCategory(newCat);
    
    // Check if current brand is valid in new category
    const brandsInCat = (brandsByCategory[newCat] && brandsByCategory[newCat].length > 0)
      ? brandsByCategory[newCat]
      : Array.from(new Set(vehicles.filter(v => newCat === 'all' || v.category === newCat).map(v => v.brand))).sort();

    let targetBrand = selectedBrand;
    if (!brandsInCat.includes(selectedBrand)) {
      targetBrand = brandsInCat[0] || 'Honda';
      setSelectedBrand(targetBrand);
    }

    // Pick first model for this brand & new category
    const models = vehicles.filter(v => {
      const matchCat = newCat === 'all' || v.category === newCat;
      return matchCat && v.brand === targetBrand;
    });

    if (models.length > 0) {
      const targetModel = models[0];
      setSelectedModelId(targetModel.id);
      const targetYear = targetModel.latest_year || 2024;
      setSelectedYear(targetYear);
      handleEvaluate(targetModel.id, targetYear);
    }
  };

  // Cascading Handler 2: Change Company / Brand
  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand);

    // Pick first model belonging to this brand in current category
    const models = vehicles.filter(v => {
      const matchCat = selectedCategory === 'all' || v.category === selectedCategory;
      return matchCat && v.brand === newBrand;
    });

    if (models.length > 0) {
      const targetModel = models[0];
      setSelectedModelId(targetModel.id);
      const targetYear = targetModel.latest_year || 2024;
      setSelectedYear(targetYear);
      handleEvaluate(targetModel.id, targetYear);
    }
  };

  // Cascading Handler 3: Change Vehicle Model
  const handleModelChange = (newModelId: string) => {
    setSelectedModelId(newModelId);
    const targetModel = vehicles.find(v => v.id === newModelId);

    if (targetModel) {
      let targetYear = selectedYear;
      if (!targetModel.years_available.includes(selectedYear)) {
        targetYear = targetModel.latest_year || targetModel.years_available[0] || 2024;
        setSelectedYear(targetYear);
      }
      handleEvaluate(targetModel.id, targetYear);
    }
  };

  // Cascading Handler 4: Change Manufacturing Year
  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    handleEvaluate(selectedModelId, newYear);
  };

  // Select from Search Suggestion or Popular Tag
  const handleSelectVehicleItem = (item: { id?: string; name: string; brand: string; cat?: string; year?: number }) => {
    const matched = vehicles.find(v => (item.id && v.id === item.id) || (v.brand === item.brand && v.name === item.name));
    if (matched) {
      if (item.cat && (['all', 'car', 'bike', 'scooter'].includes(item.cat))) {
        setSelectedCategory(item.cat as any);
      }
      setSelectedBrand(matched.brand);
      setSelectedModelId(matched.id);
      const yr = item.year && matched.years_available.includes(item.year) 
        ? item.year 
        : matched.latest_year;
      setSelectedYear(yr);
      setShowSearchDropdown(false);
      setSearchQuery('');
      handleEvaluate(matched.id, yr);
    }
  };

  // Core Evaluation Fetcher
  const handleEvaluate = async (vId?: string, vYear?: number) => {
    const id = vId || selectedModelId;
    const year = vYear !== undefined ? vYear : selectedYear;

    setIsLoading(true);
    setErrorMsg('');
    setAskAnswer('');

    try {
      const res = await fetch('/api/fuel-check/evaluate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: id,
          manufacturing_year: year,
          category: selectedCategory,
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

  // Contextual AI Doubt Clearing
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
          vehicle_context: report ? report.vehicle : { name: currentModel?.name || 'Vehicle', year_selected: selectedYear },
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

  // Status Badge Colors & Icons
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
          India's 1st Authoritative <strong>Ethanol Fuel Compatibility Engine (E5 to E100)</strong> — Backed by MoRTH, ARAI &amp; Official OEM Manuals.
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
            Select your vehicle brand, model, and manufacturing year below for instant verified compatibility.
          </p>
        </div>

        {/* ==============================================================================
            CASCADING SELECTION CARD (Category -> Brand -> Model -> Dynamic Year)
            ============================================================================== */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 mb-10 relative">
          
          {/* Step 1: Category Filter Pills */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Select Vehicle Category:
              </span>
              <span className="text-xs text-slate-400 font-medium">Step 1 of 4</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all', label: 'All Vehicles', icon: Layers },
                  { id: 'car', label: 'Cars', icon: Car },
                  { id: 'bike', label: 'Bikes', icon: Bike },
                  { id: 'scooter', label: 'Scooters', icon: Fuel },
                ] as const
              ).map((catItem) => {
                const Icon = catItem.icon;
                const isSelected = selectedCategory === catItem.id;
                return (
                  <button
                    key={catItem.id}
                    onClick={() => handleCategoryChange(catItem.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{catItem.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2, 3, 4: Three Cascading Dependent Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            
            {/* Dropdown 1: Company / Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  1. Company / Brand
                </span>
                <span className="text-[11px] text-slate-400 font-normal">({availableBrands.length} brands)</span>
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-base transition-all cursor-pointer shadow-sm"
              >
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: Vehicle Model */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-indigo-600" />
                  2. Vehicle Model
                </span>
                <span className="text-[11px] text-slate-400 font-normal">({availableModels.length} models)</span>
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-base transition-all cursor-pointer shadow-sm"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 3: Manufacturing Year (Strictly filtered by Model's real production years) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                  3. Manufacturing Year
                </span>
                <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                  {currentModel ? `${currentModel.years_start}–${currentModel.years_end}` : 'Active Years'}
                </span>
              </label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-base transition-all cursor-pointer shadow-sm"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} {yr >= 2023 ? '⭐ (BS6 Phase-2 / OBD-2 / E20 Ready)' : yr >= 2020 ? '⚡ (BS6 Phase-1 / E10 Calibrated)' : yr >= 2016 ? '⚠️ (BS-IV Norms / E10 Max)' : '⛔ (BS-III / Older Carburetor)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Search Bar & Popular Vehicles Tags */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row items-center gap-4 justify-between">
            {/* Direct Quick Search Autocomplete */}
            <div className="w-full md:w-80 relative" ref={searchDropdownRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Or search model name..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSearchDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectVehicleItem(item)}
                      className="px-3 py-2.5 hover:bg-indigo-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-8 h-8 object-cover rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=300';
                          }}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{item.brand} {item.name}</div>
                          <div className="text-[10px] text-slate-500">{item.engine}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        Select →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Quick Filter Pills */}
            <div className="w-full md:flex-1 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap mr-1">
                Popular:
              </span>
              {DEFAULT_POPULAR_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectVehicleItem(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-transparent text-slate-700 text-xs font-medium whitespace-nowrap transition-all"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 text-xs font-semibold py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Evaluating dynamic fuel specifications for {selectedYear} model...
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* ==============================================================================
            DYNAMIC RESULTS SECTION (Updates 100% based on Vehicle & Year)
            ============================================================================== */}
        {report && (
          <div className="space-y-8 animate-fadeIn">
            {/* Vehicle Profile Hero Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              
              {/* Left Side: Vehicle Info & Dynamic Emission Specs */}
              <div className="space-y-3 z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700">
                  {report.is_verified ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Automotive Specification
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
                  <span className="font-semibold px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-sm">
                    Year: {report.vehicle.year_selected}
                  </span>
                  <span className="font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                    Standard: {report.vehicle.bs_stage}
                  </span>
                  <span className="font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Engine: {report.vehicle.engine}
                  </span>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed pt-1">
                  <strong>Variant Specification:</strong> {report.vehicle.variant}
                </p>

                {/* Dynamic E20 Status Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 mt-2 transition-all ${
                  report.fuel_matrix['E20'].status === 'compatible'
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : report.fuel_matrix['E20'].status === 'caution'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
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
                        E20 Compatibility Status ({report.vehicle.year_selected})
                      </div>
                      <div className="text-base sm:text-lg font-bold">
                        {report.fuel_matrix['E20'].label}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-800 whitespace-nowrap">
                    Max: {report.vehicle.max_approved_blend}
                  </span>
                </div>
              </div>

              {/* Right Side: Vehicle Dynamic Image */}
              <div className="relative w-full md:w-80 h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0 shadow-inner group">
                <img
                  src={report.vehicle.image}
                  alt={report.vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-bold bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                    {report.vehicle.brand} • {report.vehicle.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
              {[
                { id: 'matrix', label: '⛽ Fuel Matrix (E5–E100)', icon: Gauge },
                { id: 'engine', label: '⚙️ Materials & ECU', icon: Wrench },
                { id: 'mileage', label: '📉 Mileage Impact', icon: TrendingDown },
                { id: 'proof', label: '📜 Official OEM Quote', icon: FileText },
                { id: 'advice', label: '🛡️ Driver Advice', icon: ShieldCheck },
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
                            National Standard
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

                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                          {blendData.desc}
                        </p>

                        {/* Gasoline vs Ethanol Meter */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                            <span>Petrol: {100 - parseInt(blendData.ethanol)}%</span>
                            <span>Ethanol: {blendData.ethanol}</span>
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

                {/* Important Fact Box */}
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Indian Fuel Infrastructure Notice:</strong> Oil Marketing Companies (IOCL, BPCL, HPCL) are dispensing E20 petrol across most retail outlets.
                    If your vehicle is manufactured before April 2023, do not panic about an accidental single fill; incidental usage will not damage your vehicle immediately. Follow our maintenance tips in the advice tab.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Materials & ECU */}
            {activeTab === 'engine' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-indigo-600" />
                    Fuel System Materials &amp; Calibration Specification ({report.vehicle.year_selected})
                  </h3>
                  <p className="text-sm text-slate-600">
                    Higher ethanol blends require specialized fluorocarbon rubber (Viton) and active closed-loop lambda control.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs uppercase font-bold text-slate-500 mb-1">
                      Material Compatibility (Fuel Lines &amp; Seals)
                    </div>
                    <div className="text-base font-bold text-slate-900 capitalize mb-2">
                      {report.technical_explanation.material_compatibility.replace(/_/g, ' ')}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {report.technical_explanation.details}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs uppercase font-bold text-slate-500 mb-1">
                      ECU Tuning &amp; Stoichiometry ({report.vehicle.bs_stage})
                    </div>
                    <div className="text-base font-bold text-slate-900 capitalize mb-2">
                      {report.technical_explanation.calibration_status.replace(/_/g, ' ')}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Ethanol contains 34.7% oxygen by weight, altering the stoichiometric air-fuel ratio from 14.7:1 down to 13.0:1 for pure E20. 
                      Modern OBD-2 ECUs adjust short-term and long-term fuel trim (STFT/LTFT) automatically.
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
                    Ethanol contains ~21.2 MJ/L of energy compared to 32 MJ/L for gasoline.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                  <div className="text-sm font-bold flex items-center gap-2">
                    <Percent className="w-4 h-4 text-amber-700" />
                    Expected Mileage Impact on Your {report.vehicle.name} ({report.vehicle.year_selected}):
                  </div>
                  <p className="text-sm leading-relaxed">
                    {report.technical_explanation.mileage_impact}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="text-xs text-slate-500 font-semibold mb-1">E10 Blend</div>
                    <div className="text-xl font-black text-slate-900">~1% – 2%</div>
                    <div className="text-[11px] text-slate-500">Negligible difference</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
                    <div className="text-xs text-amber-700 font-semibold mb-1">E20 Blend</div>
                    <div className="text-xl font-black text-amber-800">~2% – 5%</div>
                    <div className="text-[11px] text-amber-700">Expected reduction</div>
                  </div>
                  <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50">
                    <div className="text-xs text-rose-700 font-semibold mb-1">E85 (Flex-Fuel)</div>
                    <div className="text-xl font-black text-rose-800">~25% – 30%</div>
                    <div className="text-[11px] text-rose-700">Flex-Fuel prototypes only</div>
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
                    Official Manufacturer Citation &amp; Document Source
                  </h3>
                  <p className="text-sm text-slate-600">
                    Verified against official OEM service bulletins and MoRTH regulatory notifications.
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
                    Practical Driver Action Plan for {report.vehicle.name} ({report.vehicle.year_selected})
                  </h3>
                  <p className="text-sm text-slate-600">
                    {report.actionable_guidance.summary}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-sm leading-relaxed">
                  <strong>Recommended Step:</strong> {report.actionable_guidance.what_to_do}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Essential Ownership Tips:
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

            {/* AI Doubt Solver Q&A Box Grounded in Selected Vehicle */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Axom FuelCheck AI Assistant
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Have a doubt about your {report.vehicle.name}?
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
                  placeholder={`Ask anything about ${report.vehicle.name} (${report.vehicle.year_selected}) & E20 fuel...`}
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
              <span>Verified against MoRTH Notification &amp; SIAM Circulars (2025–2026)</span>
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
