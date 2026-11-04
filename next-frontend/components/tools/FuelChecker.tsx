'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Fuel,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  RefreshCw,
  Car,
  Bike,
  Info,
  Share2,
  Check,
  FileText,
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

const PREPOPULATED_QUESTIONS = [
  "Can I put XP95 or Speed95 petrol to completely avoid ethanol?",
  "What happens if I accidentally filled E20 in my older BS4 bike/car?",
  "Will using E20 blended petrol void my manufacturer warranty?",
  "How long can I leave E20 petrol parked before moisture phase separation?"
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

  // 3. Compute Available Brands for current category
  const availableBrands = useMemo(() => {
    if (brandsByCategory[selectedCategory] && brandsByCategory[selectedCategory].length > 0) {
      return brandsByCategory[selectedCategory];
    }
    const filtered = selectedCategory === 'all' 
      ? vehicles 
      : vehicles.filter(v => v.category === selectedCategory);
    return Array.from(new Set(filtered.map(v => v.brand))).sort();
  }, [brandsByCategory, selectedCategory, vehicles]);

  // 4. Compute Available Models for current brand & category
  const availableModels = useMemo(() => {
    return vehicles.filter(v => {
      const matchCat = selectedCategory === 'all' || v.category === selectedCategory;
      const matchBrand = v.brand === selectedBrand;
      return matchCat && matchBrand;
    });
  }, [vehicles, selectedCategory, selectedBrand]);

  // 5. Currently Selected Model Object
  const currentModel = useMemo(() => {
    return vehicles.find(v => v.id === selectedModelId) || availableModels[0] || null;
  }, [vehicles, selectedModelId, availableModels]);

  // 6. Compute Available Years for current model
  const availableYears = useMemo(() => {
    if (currentModel && currentModel.years_available && currentModel.years_available.length > 0) {
      return currentModel.years_available;
    }
    return [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  }, [currentModel]);

  // Cascading Handler 1: Change Category
  const handleCategoryChange = (newCat: 'all' | 'car' | 'bike' | 'scooter') => {
    setSelectedCategory(newCat);
    
    const brandsInCat = (brandsByCategory[newCat] && brandsByCategory[newCat].length > 0)
      ? brandsByCategory[newCat]
      : Array.from(new Set(vehicles.filter(v => newCat === 'all' || v.category === newCat).map(v => v.brand))).sort();

    let targetBrand = selectedBrand;
    if (!brandsInCat.includes(selectedBrand)) {
      targetBrand = brandsInCat[0] || 'Honda';
      setSelectedBrand(targetBrand);
    }

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

  // Formatter for AI Response: Converts raw asterisks and bullets into clean normal text
  const renderFormattedAnswer = (rawText: string) => {
    if (!rawText) return null;

    // Split text into non-empty lines
    const rawLines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    return (
      <div className="space-y-2.5 mt-3">
        {rawLines.map((line, idx) => {
          // Remove leading bullets or numbered marks
          let cleaned = line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '');

          // Check for bold topic pattern: **Topic**: Description or **Topic** - Description
          const boldMatch = cleaned.match(/^\*\*(.*?)\*\*:?\s*(.*)$/);

          if (boldMatch) {
            const topic = boldMatch[1].replace(/\*/g, '').trim();
            const description = boldMatch[2].replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();

            return (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs sm:text-sm text-slate-800 transition-all hover:bg-slate-50"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold text-slate-900">{topic}: </span>
                  <span className="text-slate-700 font-normal">{description}</span>
                </div>
              </div>
            );
          }

          // Strip any stray markdown asterisks for plain clean text
          const plainText = cleaned.replace(/\*\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();

          return (
            <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg text-xs sm:text-sm text-slate-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <span className="flex-1 font-normal">{plainText}</span>
            </div>
          );
        })}
      </div>
    );
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
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-[11px] sm:text-xs md:text-sm py-2 px-3 sm:px-4 text-center font-medium shadow-sm">
        <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-pulse flex-shrink-0" />
          <span>India's 1st Authoritative <strong>Ethanol Fuel Compatibility Engine (E5 to E100)</strong> — Backed by MoRTH, ARAI &amp; Official OEM Manuals.</span>
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-6 md:py-12">
        {/* Main Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4 shadow-sm">
            <Fuel className="w-3.5 h-3.5 text-indigo-600" />
            Automotive Intelligence Utility
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Vehicle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">Fuel Compatibility</span> Checker
          </h1>
          <p className="mt-2 sm:mt-3 text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed px-2">
            Find out if your Bike, Scooter, or Car is officially certified for <strong>E10, E20, E85, or E100</strong> petrol.
            Select your vehicle brand, model, and manufacturing year below for instant verified compatibility.
          </p>
        </div>

        {/* ==============================================================================
            CASCADING SELECTION CARD (Clean 3-Dropdown Grid, No Search / Popular Bloat)
            ============================================================================== */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-200/60 mb-8 sm:mb-10 relative">
          
          {/* Step 1: Category Filter Pills (Responsive 2x2 on Mobile, Flex on Desktop) */}
          <div className="mb-5 sm:mb-6">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Select Vehicle Category:
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Step 1 of 4</span>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
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
                    className={`w-full sm:w-auto px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center sm:justify-start gap-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.01]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{catItem.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2, 3, 4: Three Cascading Dependent Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 pt-4 border-t border-slate-100">
            
            {/* Dropdown 1: Company / Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  1. Company / Brand
                </span>
                <span className="text-[11px] text-slate-400 font-normal">({availableBrands.length} brands)</span>
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm sm:text-base transition-all cursor-pointer shadow-sm"
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-indigo-600" />
                  2. Vehicle Model
                </span>
                <span className="text-[11px] text-slate-400 font-normal">({availableModels.length} models)</span>
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm sm:text-base transition-all cursor-pointer shadow-sm"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 3: Manufacturing Year */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center justify-between">
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
                className="w-full px-3.5 py-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm sm:text-base transition-all cursor-pointer shadow-sm"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} {yr >= 2023 ? '(BS6 Phase-2 / OBD-2 / E20 Ready)' : yr >= 2020 ? '(BS6 Phase-1 / E10 Calibrated)' : yr >= 2016 ? '(BS-IV Norms / E10 Max)' : '(BS-III / Older Carburetor)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 text-xs font-semibold py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Evaluating dynamic fuel specifications for {selectedYear} model...
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* ==============================================================================
            DYNAMIC RESULTS SECTION (Mobile Optimized & Clean)
            ============================================================================== */}
        {report && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            {/* Vehicle Profile Hero Card */}
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 overflow-hidden relative">
              
              {/* Left Side: Vehicle Info & Dynamic Emission Specs */}
              <div className="space-y-2.5 sm:space-y-3 z-10 w-full md:max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700">
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

                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {report.vehicle.name}
                </h2>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
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

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed pt-0.5">
                  <strong>Variant Specification:</strong> {report.vehicle.variant}
                </p>

                {/* Dynamic E20 Status Banner */}
                <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2 transition-all ${
                  report.fuel_matrix['E20'].status === 'compatible'
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : report.fuel_matrix['E20'].status === 'caution'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex-shrink-0 ${
                      report.fuel_matrix['E20'].status === 'compatible'
                        ? 'bg-emerald-500 ring-4 ring-emerald-200'
                        : report.fuel_matrix['E20'].status === 'caution'
                        ? 'bg-amber-500 ring-4 ring-amber-200'
                        : 'bg-rose-500 ring-4 ring-rose-200'
                    }`} />
                    <div>
                      <div className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider opacity-75">
                        E20 Compatibility Status ({report.vehicle.year_selected})
                      </div>
                      <div className="text-sm sm:text-base md:text-lg font-bold">
                        {report.fuel_matrix['E20'].label}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-white border border-slate-200 shadow-sm text-slate-800 self-start sm:self-auto whitespace-nowrap">
                    Max: {report.vehicle.max_approved_blend}
                  </span>
                </div>
              </div>

              {/* Right Side: Vehicle Dynamic Image */}
              <div className="relative w-full md:w-80 h-48 sm:h-56 md:h-60 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-inner group">
                <img
                  src={report.vehicle.image}
                  alt={report.vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const fallback = report.vehicle.category === 'scooter'
                      ? 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800'
                      : report.vehicle.category === 'bike'
                      ? 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=800'
                      : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800';
                    (e.target as any).src = fallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent flex items-end p-3 sm:p-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
                      {report.vehicle.category} • {report.vehicle.brand}
                    </span>
                    <span className="text-white text-xs sm:text-sm font-extrabold block truncate drop-shadow-md">
                      {report.vehicle.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Horizontal Scrollable on Mobile) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
              {[
                { id: 'matrix', label: 'Fuel Matrix (E5–E100)', icon: Gauge },
                { id: 'engine', label: 'Materials & ECU', icon: Wrench },
                { id: 'mileage', label: 'Mileage Impact', icon: TrendingDown },
                { id: 'proof', label: 'Official OEM Quote', icon: FileText },
                { id: 'advice', label: 'Driver Advice', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Fuel Compatibility Matrix Grid */}
            {activeTab === 'matrix' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(report.fuel_matrix).map(([blendKey, blendData]) => {
                    const badge = getStatusBadge(blendData.status);
                    const StatusIcon = badge.icon;
                    return (
                      <div
                        key={blendKey}
                        className={`bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden ${
                          blendKey === 'E20' ? 'ring-2 ring-indigo-500 border-indigo-300' : 'border-slate-200'
                        }`}
                      >
                        {blendKey === 'E20' && (
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                            National Standard
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {blendKey}
                          </span>
                          <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {blendData.ethanol} Ethanol
                          </span>
                        </div>

                        <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold flex items-center gap-2 mb-2.5 sm:mb-3 ${badge.bg}`}>
                          <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{blendData.label}</span>
                        </div>

                        <p className="text-[11px] sm:text-xs text-slate-600 mb-2.5 sm:mb-3 leading-relaxed">
                          {blendData.desc}
                        </p>

                        {/* Gasoline vs Ethanol Meter */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 font-medium">
                            <span>Petrol: {100 - parseInt(blendData.ethanol)}%</span>
                            <span>Ethanol: {blendData.ethanol}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden flex">
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
                <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Indian Fuel Infrastructure Notice:</strong> Oil Marketing Companies (IOCL, BPCL, HPCL) are dispensing E20 petrol across most retail outlets.
                    If your vehicle was manufactured before April 2023, do not panic about an accidental single fill; incidental usage will not damage your vehicle immediately. Follow our maintenance tips in the advice tab.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Materials & ECU */}
            {activeTab === 'engine' && (
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2 flex items-center gap-2">
                    <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    Fuel System Materials &amp; Calibration Specification ({report.vehicle.year_selected})
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Higher ethanol blends require specialized fluorocarbon rubber (Viton) and active closed-loop lambda control.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] sm:text-xs uppercase font-bold text-slate-500 mb-1">
                      Material Compatibility (Fuel Lines &amp; Seals)
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 capitalize mb-2">
                      {report.technical_explanation.material_compatibility.replace(/_/g, ' ')}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {report.technical_explanation.details}
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] sm:text-xs uppercase font-bold text-slate-500 mb-1">
                      ECU Tuning &amp; Stoichiometry ({report.vehicle.bs_stage})
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 capitalize mb-2">
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
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    Fuel Economy &amp; Mileage Variance
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Ethanol contains ~21.2 MJ/L of energy compared to 32 MJ/L for gasoline.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5 sm:space-y-2">
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-amber-700" />
                    Expected Mileage Impact on Your {report.vehicle.name} ({report.vehicle.year_selected}):
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {report.technical_explanation.mileage_impact}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="text-[11px] sm:text-xs text-slate-500 font-semibold mb-1">E10 Blend</div>
                    <div className="text-lg sm:text-xl font-black text-slate-900">~1% – 2%</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500">Negligible difference</div>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-amber-200 bg-amber-50/50">
                    <div className="text-[11px] sm:text-xs text-amber-700 font-semibold mb-1">E20 Blend</div>
                    <div className="text-lg sm:text-xl font-black text-amber-800">~2% – 5%</div>
                    <div className="text-[10px] sm:text-[11px] text-amber-700">Expected reduction</div>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-rose-200 bg-rose-50/50">
                    <div className="text-[11px] sm:text-xs text-rose-700 font-semibold mb-1">E85 (Flex-Fuel)</div>
                    <div className="text-lg sm:text-xl font-black text-rose-800">~25% – 30%</div>
                    <div className="text-[10px] sm:text-[11px] text-rose-700">Flex-Fuel prototypes only</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Official Proof */}
            {activeTab === 'proof' && (
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Official Manufacturer Citation &amp; Document Source
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Verified against official OEM service bulletins and MoRTH regulatory notifications.
                  </p>
                </div>

                <blockquote className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border-l-4 border-indigo-600 text-slate-800 text-xs sm:text-sm italic font-medium leading-relaxed">
                  "{report.evidence.official_quote}"
                </blockquote>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span><strong>Document Source:</strong> {report.evidence.source}</span>
                </div>
              </div>
            )}

            {/* Tab 5: Owner Action Advice */}
            {activeTab === 'advice' && (
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    Practical Driver Action Plan for {report.vehicle.name} ({report.vehicle.year_selected})
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {report.actionable_guidance.summary}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 text-xs sm:text-sm leading-relaxed">
                  <strong>Recommended Step:</strong> {report.actionable_guidance.what_to_do}
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                    Essential Ownership Tips:
                  </h4>
                  <ul className="space-y-2">
                    {report.actionable_guidance.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* AI Doubt Solver Q&A Box Grounded in Selected Vehicle */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-md">
              <div className="flex items-center gap-1.5 text-indigo-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                Axom FuelCheck AI Assistant
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2">
                Have a doubt about your {report.vehicle.name}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-4">
                Ask our grounded automotive intelligence engine about petrol pumps, additives, emergency fill-ups, or XP95.
              </p>

              {/* Pre-populated Questions (Clean wrapping on mobile) */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                {PREPOPULATED_QUESTIONS.map((pq, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAskQuestion(pq);
                      handleAskDoubt(pq);
                    }}
                    className="text-xs bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm transition-all text-left leading-normal"
                  >
                    {pq}
                  </button>
                ))}
              </div>

              {/* Ask Input & Button (Column on small mobile, row on tablet/desktop) */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={askQuestion}
                  onChange={(e) => setAskQuestion(e.target.value)}
                  placeholder={`Ask anything about ${report.vehicle.name} (${report.vehicle.year_selected}) & E20 fuel...`}
                  className="w-full px-3.5 sm:px-4 py-3 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskDoubt();
                  }}
                />
                <button
                  onClick={() => handleAskDoubt()}
                  disabled={isAsking || !askQuestion.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
                >
                  {isAsking ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ask AI'}
                </button>
              </div>

              {/* AI Answer Box with Clean Normal Text Formatting (No Asterisks) */}
              {askAnswer && (
                <div className="mt-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-indigo-200 shadow-sm animate-fadeIn">
                  <div className="font-bold text-indigo-700 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                    Automotive Engineer Response
                  </div>
                  {renderFormattedAnswer(askAnswer)}
                </div>
              )}
            </div>

            {/* Share / Copy / Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-4 border-t border-slate-200 text-center sm:text-left">
              <span>Verified against MoRTH Notification &amp; SIAM Circulars (2025–2026)</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Vehicle Report'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
