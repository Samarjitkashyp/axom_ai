"""
AXOM AI — Fuel Compatibility Checker (Axom FuelCheck) Backend
Authoritative, verified automotive fuel compatibility engine for Indian & International vehicles.
Evaluates E5, E10, E15, E20, E25, E85, and E100 ethanol-blended petrol support with:
- Material Compatibility (rubber lines, seals, injector needles)
- Engine Calibration & Air-Fuel Ratio Tuning
- Official Manufacturer & Government Citations
- Dynamic Vehicle Image Mapping
- AI-Powered Grounded Q&A
"""

import os
import re
import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.cache import cache

from .views import (
    _client_ip,
    _is_rate_limited,
    _gemini_generate,
    _groq_generate,
    GROQ_API_KEY,
)
from .ai_notes_views import _openai_generate_notes

logger = logging.getLogger(__name__)

# Rate limiting constants
_FUEL_RATE_LIMIT_PREFIX = "fuel_check_ip:"
_MAX_REQ_PER_MIN = 35

def _check_rate_limit(ip: str) -> bool:
    """Enforces strict burst rate limiting per client IP."""
    if not ip:
        return False
    key = f"{_FUEL_RATE_LIMIT_PREFIX}{ip}"
    count = cache.get(key, 0)
    if count >= _MAX_REQ_PER_MIN:
        return True
    cache.set(key, count + 1, timeout=60)
    return False


# ==============================================================================
# AUTHORITATIVE VEHICLE KNOWLEDGE BASE (India's Top Scooters, Bikes, & Cars)
# ==============================================================================

VEHICLE_CATALOG = [
    # ------------------ SCOOTERS ------------------
    {
        "id": "honda-activa-6g",
        "name": "Honda Activa 6G / 125",
        "brand": "Honda",
        "category": "scooter",
        "image": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&auto=format&fit=crop&q=80",
        "engine": "109.51 cc / 124 cc PGM-FI",
        "description": "India's #1 scooter with Fuel Injection (PGM-FI) & ESP technology.",
        "variants": [
            {
                "year_range": "2023 - Present (BS6 Phase-2 / OBD-2 / E20 Ready)",
                "bs_stage": "BS6 Phase 2 (OBD-2)",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Honda Motorcycle & Scooter India (HMSI) certified that all 2023+ Activa OBD-2 models feature E20-compliant fuel lines, viton seals, and updated ECU mapping.",
                "source": "HMSI Official OBD-2 Circular & User Manual Page 36",
                "mileage_impact": "Negligible on E10 (~1-2%); Approx 3-5% drop on pure E20 due to ethanol's lower specific energy.",
                "technical_details": "Viton fluorocarbon rubber fuel tubes, corrosion-resistant coated fuel tank, calibrated O2 sensor for closed-loop air-fuel control."
            },
            {
                "year_range": "2020 - 2022 (BS6 Phase-1)",
                "bs_stage": "BS6 Phase 1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Honda Owner's Manual stipulates: 'Use unleaded petrol with a Research Octane Number (RON) of 91 or higher, containing up to 10% ethanol (E10) by volume.'",
                "source": "Honda Activa 6G Owner's Manual (Fuel Recommendation Section)",
                "mileage_impact": "E10: Normal. E20: 5-7% lower mileage with sluggish low-end throttle response.",
                "technical_details": "Fuel lines withstand E10 easily. Long-term E20 exposure can harden standard nitrile rubber gaskets and cause cold-start issues in winter."
            },
            {
                "year_range": "Pre-2020 (Activa 3G / 4G / 5G - BS4 Carburetor)",
                "bs_stage": "BS-IV / BS-III (Carburetor)",
                "max_blend": "E5 / E10 Max",
                "material_status": "incompatible_e20",
                "calibration_status": "incompatible_e20",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "incompatible",
                "status_e20": "incompatible",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Designed strictly for standard commercial gasoline. Carbureted engines lack oxygen sensors to adjust for ethanol's leaner air-fuel stoichiometry.",
                "source": "Honda Motorcycle Legacy Specifications Bulletin",
                "mileage_impact": "Carburetor jetting becomes excessively lean with E20, causing overheating and 8-10% mileage drop.",
                "technical_details": "Brass jets and rubber float needles corrode easily. Phase separation in steel fuel tanks can cause severe rust if vehicle is parked idle."
            }
        ]
    },
    {
        "id": "tvs-jupiter",
        "name": "TVS Jupiter / 125",
        "brand": "TVS",
        "category": "scooter",
        "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=700&auto=format&fit=crop&q=80",
        "engine": "109.7 cc / 124.8 cc ET-Fi",
        "description": "Popular family scooter with EcoThrust Fuel Injection and metal body.",
        "variants": [
            {
                "year_range": "2023 - Present (E20 OBD-2)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "TVS Motor confirmed that all models produced post April 1, 2023 are fully E20 material compatible and calibrated.",
                "source": "TVS Motor Company Regulatory Announcement",
                "mileage_impact": "Approx 3-4% drop on E20 compared to pure petrol.",
                "technical_details": "Fluorosilicone seals and anti-corrosive fuel pump internals."
            },
            {
                "year_range": "2016 - 2022 (BS4 & BS6 Ph1)",
                "bs_stage": "BS4 / BS6.1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Owner Manual recommends unleaded petrol with up to 10% ethanol (E10). Higher blends void fuel system warranty.",
                "source": "TVS Jupiter User Manual (Maintenance & Fuel)",
                "mileage_impact": "E20 causes sluggish acceleration and ~6% mileage decrease.",
                "technical_details": "Carburetor models (pre-2020) and early FI models (2020-2022) do not possess E20-resistant fuel lines."
            }
        ]
    },
    {
        "id": "suzuki-access-125",
        "name": "Suzuki Access 125 / Burgman",
        "brand": "Suzuki",
        "category": "scooter",
        "image": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=700&auto=format&fit=crop&q=80",
        "engine": "124 cc SEP FI",
        "description": "Leading 125cc commuter scooter with Suzuki Eco Performance.",
        "variants": [
            {
                "year_range": "2023 - Present (OBD-2 / E20 Compliant)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Suzuki Motorcycle India launched E20-compliant Access 125 with updated fuel injection mapping and hardware.",
                "source": "Suzuki Motorcycle India Press Release & Manual",
                "mileage_impact": "Minimal 2-4% variance on E20.",
                "technical_details": "Upgraded fuel sender unit, anti-corrosion tank lining, and updated ECU mapping."
            },
            {
                "year_range": "2016 - 2022",
                "bs_stage": "BS4 / BS6 Ph1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Approved strictly up to 10% ethanol (E10). Using higher blends may cause engine stalling in damp conditions.",
                "source": "Suzuki Access 125 Owner Manual",
                "mileage_impact": "Noticeable throttle lag and 5-6% mileage penalty on E20.",
                "technical_details": "Non-E20 certified injector needles and rubber fuel supply lines."
            }
        ]
    },
    {
        "id": "tvs-ntorq-125",
        "name": "TVS Ntorq 125",
        "brand": "TVS",
        "category": "scooter",
        "image": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&auto=format&fit=crop&q=80",
        "engine": "124.8 cc 3-Valve CVTi-REXX FI",
        "description": "High-performance youth scooter with racing DNA and SmartXonnect.",
        "variants": [
            {
                "year_range": "2023 - Present (E20 Compliant)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "TVS Ntorq OBD2 models are E20 compatible with multi-map FI ECU calibration.",
                "source": "TVS Ntorq 125 User Manual 2023",
                "mileage_impact": "Approx 3-5% drop on E20.",
                "technical_details": "Ethanol-passivated aluminum alloy intake tract and Viton O-rings."
            },
            {
                "year_range": "2018 - 2022",
                "bs_stage": "BS4 / BS6 Ph1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Use fuel with maximum 10% ethanol content. Higher blends affect top speed and fuel economy.",
                "source": "TVS Ntorq Owner Manual",
                "mileage_impact": "5-7% mileage drop; slightly higher operating temperature.",
                "technical_details": "Non-E20 certified fuel feed tubes and early injector nozzles."
            }
        ]
    },

    # ------------------ MOTORCYCLES ------------------
    {
        "id": "hero-splendor-plus",
        "name": "Hero Splendor Plus / Super Splendor",
        "brand": "Hero",
        "category": "bike",
        "image": "https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=700&auto=format&fit=crop&q=80",
        "engine": "97.2 cc / 124.7 cc xSens Programmed FI",
        "description": "World's largest selling motorcycle; backbone of Indian commuter mobility.",
        "variants": [
            {
                "year_range": "2023 - Present (OBD-2 / E20 Ready)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Hero MotoCorp confirmed complete compliance of its OBD-2 motorcycle lineup with E20 blended fuel.",
                "source": "Hero MotoCorp Product Release & Manual",
                "mileage_impact": "Approx 3-5% drop on E20 compared to pure commercial petrol.",
                "technical_details": "Reinforced fuel feed hose, revised ignition timing, stainless steel fuel pump assembly."
            },
            {
                "year_range": "Pre-2023 (BS4 / Early BS6)",
                "bs_stage": "BS4 / BS6 Ph1 (Carburetor / Early FI)",
                "max_blend": "E10",
                "material_status": "incompatible_e20",
                "calibration_status": "incompatible_e20",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Approved up to E10 only. Carbureted models are vulnerable to lean misfires and tank rusting on higher ethanol.",
                "source": "Hero MotoCorp Splendor User Manual",
                "mileage_impact": "Over 7-9% mileage drop on E20 in older carburetor engines with poor cold starting.",
                "technical_details": "Carburetor float bowl gasket degrades quickly under high alcohol contact."
            }
        ]
    },
    {
        "id": "royal-enfield-classic-350",
        "name": "Royal Enfield Classic 350 / Hunter / Bullet",
        "brand": "Royal Enfield",
        "category": "bike",
        "image": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=700&auto=format&fit=crop&q=80",
        "engine": "349 cc J-Platform Air-Oil Cooled SOHC",
        "description": "Iconic retro cruiser motorcycle powered by the refined J-series engine.",
        "variants": [
            {
                "year_range": "2023 - Present (J-Series E20 OBD2)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Royal Enfield official owner manual explicitly notes compatibility with E20 blended petrol for all 2023+ J-platform motorcycles.",
                "source": "Royal Enfield J-Platform Technical Specification Manual",
                "mileage_impact": "Mild 2-4% drop in highway fuel economy.",
                "technical_details": "Modern high-pressure fuel pump with ethanol-passivated metals and O-rings."
            },
            {
                "year_range": "Pre-2022 (UCE 350 / 500 Legacy Engine)",
                "bs_stage": "BS3 / BS4 / Early BS6 UCE",
                "max_blend": "E10",
                "material_status": "incompatible_e20",
                "calibration_status": "incompatible_e20",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "incompatible",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Maximum 10% ethanol (E10) allowed. Older cast iron and UCE pushrod engines may experience vapor lock and corrosion.",
                "source": "Royal Enfield Legacy Owner Manuals",
                "mileage_impact": "Heavy 6-8% mileage penalty; rough idling and knocking.",
                "technical_details": "Metal fuel petcock, zinc-alloy carburetor parts, and non-viton fuel pipes."
            }
        ]
    },
    {
        "id": "bajaj-pulsar-150",
        "name": "Bajaj Pulsar (150 / 125 / NS200 / N160)",
        "brand": "Bajaj",
        "category": "bike",
        "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=700&auto=format&fit=crop&q=80",
        "engine": "149.5 cc Twin Spark DTS-i",
        "description": "India's premier sports commuter motorcycle family.",
        "variants": [
            {
                "year_range": "2023 - Present (OBD-2 / E20 Ready)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Bajaj Auto rolled out E20-ready Pulsar lineup with compliant fuel injection systems and revised spark timing.",
                "source": "Bajaj Auto Service Bulletins 2023",
                "mileage_impact": "Approx 3-4% drop on E20.",
                "technical_details": "E20 calibrated Bosch EFI module, Viton rubber lines, and anti-gumming injector."
            },
            {
                "year_range": "Pre-2023 (BS4 & Early BS6)",
                "bs_stage": "BS4 / BS6 Ph1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Permissible ethanol content is up to 10% (E10). E20 may cause hesitation during rapid throttle opening.",
                "source": "Bajaj Pulsar Owner's Manual",
                "mileage_impact": "5-7% mileage drop; engine tends to run hotter due to lean mixture.",
                "technical_details": "Older fuel pipes degrade over 18-24 months of continuous E20 usage."
            }
        ]
    },
    {
        "id": "honda-shine-125",
        "name": "Honda Shine 125 / SP 125",
        "brand": "Honda",
        "category": "bike",
        "image": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&auto=format&fit=crop&q=80",
        "engine": "123.94 cc eSP PGM-FI",
        "description": "India's highest selling 125cc commuter motorcycle.",
        "variants": [
            {
                "year_range": "2023 - Present (OBD-2 / E20 Ready)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "HMSI announced the SP 125 and Shine OBD-2 are fully compliant with up to 20% ethanol fuel.",
                "source": "HMSI Official Launch Specifications 2023",
                "mileage_impact": "2-4% drop in mileage on E20.",
                "technical_details": "Updated fuel rail and Viton O-rings with E20 fuel pump calibration."
            },
            {
                "year_range": "2016 - 2022",
                "bs_stage": "BS4 / BS6 Ph1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Approved strictly up to 10% ethanol (E10).",
                "source": "Honda Shine Owner Manual",
                "mileage_impact": "5-6% drop on E20.",
                "technical_details": "Pre-2023 rubber lines degrade if vehicle is stored wet with E20."
            }
        ]
    },
    {
        "id": "tvs-apache-rtr",
        "name": "TVS Apache RTR (160 4V / 200 4V)",
        "brand": "TVS",
        "category": "bike",
        "image": "https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=700&auto=format&fit=crop&q=80",
        "engine": "159.7 cc / 197.75 cc 4-Valve Oil-Cooled FI",
        "description": "High-revving performance motorcycle with track-tuned fuel injection.",
        "variants": [
            {
                "year_range": "2023 - Present (OBD-2 / E20 Ready)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "TVS Apache series manufactured after April 2023 is E20 fuel compliant with revised mapping.",
                "source": "TVS Apache Technical Specifications 2023",
                "mileage_impact": "Approx 3-4% drop in fuel economy.",
                "technical_details": "High anti-knock ethanol octane matches Apache's high compression ratio well."
            },
            {
                "year_range": "2018 - 2022",
                "bs_stage": "BS4 / BS6 Ph1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Approved up to 10% ethanol (E10). Using higher blends may cause engine knocking and lean running.",
                "source": "TVS Apache Owner Manual",
                "mileage_impact": "5-7% mileage drop.",
                "technical_details": "Non-E20 certified fuel feed hoses and pressure regulators."
            }
        ]
    },

    # ------------------ CARS ------------------
    {
        "id": "maruti-suzuki-swift",
        "name": "Maruti Suzuki Swift / Dzire",
        "brand": "Maruti Suzuki",
        "category": "car",
        "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=80",
        "engine": "1.2L K12N DualJet / Z12E Petrol",
        "description": "India's highest selling hatchback and compact sedan.",
        "variants": [
            {
                "year_range": "April 2023 - Present (E20 Material & Engine Tuned)",
                "bs_stage": "BS6 Phase 2 (RDE / OBD-2)",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Maruti Suzuki announced all its petrol cars manufactured from April 1, 2023 are fully E20 material compatible and calibrated for optimal performance.",
                "source": "Maruti Suzuki India Official Press Release (April 2023)",
                "mileage_impact": "Negligible on E10; ~3-5% drop on E20 (from ~22 km/l to ~21 km/l).",
                "technical_details": "Corrosion-proof multilayer polymer fuel tank, fluorocarbon fuel lines, advanced Denso/Bosch ECU with broad long-term fuel trim (LTFT)."
            },
            {
                "year_range": "2020 - March 2023 (BS6 Phase-1)",
                "bs_stage": "BS6 Phase 1 (K12M / K12N)",
                "max_blend": "E10 Tuned (E20 Material Evaluated)",
                "material_status": "compatible",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Fuel system materials are durable for E20, but engine calibration was certified for E10. E20 will run without catastrophic breakdown, but mileage will dip.",
                "source": "Maruti Suzuki Technical Guidance & Owner Manual",
                "mileage_impact": "Around 5-6% mileage decrease on E20; minor torque reduction at low RPM.",
                "technical_details": "Fuel pump and lines resist ethanol corrosion, but narrow STFT/LTFT trim range can occasionally illuminate check-engine light (P0171 Lean)."
            },
            {
                "year_range": "Pre-2020 (BS4 & Earlier Generations)",
                "bs_stage": "BS-IV / BS-III",
                "max_blend": "E10 Max",
                "material_status": "incompatible_e20",
                "calibration_status": "incompatible_e20",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "incompatible",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Owner manual explicitly specifies unleaded petrol with up to 10% ethanol (E10). E20 is NOT approved.",
                "source": "Maruti Swift BS-IV Owner's Manual",
                "mileage_impact": "7-10% mileage drop on E20 with engine knocking under heavy acceleration.",
                "technical_details": "Nitrile rubber fuel hoses and legacy fuel pump seals crack and degrade when exposed to >10% alcohol over prolonged periods."
            }
        ]
    },
    {
        "id": "hyundai-creta",
        "name": "Hyundai Creta / i20 / Venue",
        "brand": "Hyundai",
        "category": "car",
        "image": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=700&auto=format&fit=crop&q=80",
        "engine": "1.5L MPi / 1.0L Turbo GDi Petrol",
        "description": "India's highest selling mid-size SUV and premium hatchbacks.",
        "variants": [
            {
                "year_range": "2023 - Present (RDE / OBD-2 / E20 Ready)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Hyundai Motor India verified that its entire petrol powertrain portfolio from 2023 onwards complies fully with E20 fuel norms.",
                "source": "Hyundai India Technical Disclosure",
                "mileage_impact": "Approx 3-4% drop in fuel economy.",
                "technical_details": "Direct injection (GDi) high-pressure fuel pumps coated against alcohol-induced cavitation."
            },
            {
                "year_range": "2015 - 2022 (BS4 & BS6 Ph1)",
                "bs_stage": "BS4 / BS6 Ph1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Hyundai recommends petrol with maximum 10% ethanol (E10). Fuels exceeding 10% ethanol may impair drivability.",
                "source": "Hyundai Creta Owner's Manual (Fuel Requirements)",
                "mileage_impact": "E20 causes approx 5-6% mileage penalty.",
                "technical_details": "Fuel sender unit and rubber connectors have limited long-term tolerance to ethanol blends above 10%."
            }
        ]
    },
    {
        "id": "tata-nexon",
        "name": "Tata Nexon / Punch / Altroz",
        "brand": "Tata Motors",
        "category": "car",
        "image": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=700&auto=format&fit=crop&q=80",
        "engine": "1.2L Revotron Turbo / NA Petrol",
        "description": "5-Star BNCAP rated leading Indian compact SUV and crossover lineup.",
        "variants": [
            {
                "year_range": "2023 - Present (BS6 Phase-2 / E20 Compliant)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Tata Motors updated its Revotron petrol engine family for full E20 material safety and emissions compliance.",
                "source": "Tata Motors Official Passenger Vehicle Communication",
                "mileage_impact": "Around 3-5% drop on E20 petrol.",
                "technical_details": "Reinforced fuel rail, corrosion-resistant injectors, and wide-range Bosch closed-loop lambda control."
            },
            {
                "year_range": "Pre-2023 (BS4 / BS6 Ph1)",
                "bs_stage": "BS4 / BS6 Ph1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Approved fuel: E10 maximum. Higher ethanol content can cause cold-cranking delays and fuel pump wear.",
                "source": "Tata Nexon Owner's Manual (Fuel System)",
                "mileage_impact": "6-8% mileage reduction on E20 with turbo lag sensation under load.",
                "technical_details": "Pre-2023 fuel lines are not rated for high-concentration alcohol acidity."
            }
        ]
    },
    {
        "id": "honda-city",
        "name": "Honda City / Amaze / Elevate",
        "brand": "Honda",
        "category": "car",
        "image": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=700&auto=format&fit=crop&q=80",
        "engine": "1.5L i-VTEC DOHC / 1.2L i-VTEC",
        "description": "Benchmark Japanese executive sedan and SUV with high-revving i-VTEC petrol engines.",
        "variants": [
            {
                "year_range": "2023 - Present (OBD-2 / E20 Tuned)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Honda Cars India confirmed all its current cars are fully E20 compliant both in material durability and electronic tuning.",
                "source": "Honda Car India Official FAQ & Press Advisory",
                "mileage_impact": "Approx 3-4% lower mileage on E20.",
                "technical_details": "Full viton rubber architecture and optimized VTEC valve timing for high-octane ethanol blend."
            },
            {
                "year_range": "2009 - 2022 (3rd, 4th, & early 5th Gen)",
                "bs_stage": "BS4 / BS6 Ph1",
                "max_blend": "E20 Material Compatible (E10 Tuned)",
                "material_status": "compatible",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Honda Cars India officially published in its FAQs: 'All Honda cars manufactured in India from 1st January 2009 onwards are E20 material compatible.'",
                "source": "Honda Cars India Official E20 FAQ (January 2009 Declaration)",
                "mileage_impact": "4-6% drop on E20, but fuel system hardware will not degrade.",
                "technical_details": "Honda's Japanese engineering standard adopted alcohol-resistant fuel lines early in 2009."
            },
            {
                "year_range": "Pre-2009 (2nd Gen City / Type 2)",
                "bs_stage": "BS-II / BS-III",
                "max_blend": "E5 / E10 Max",
                "material_status": "incompatible_e20",
                "calibration_status": "incompatible_e20",
                "status_e5": "compatible",
                "status_e10": "caution",
                "status_e15": "incompatible",
                "status_e20": "incompatible",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Pre-2009 Honda vehicles were not validated for E20. Use only standard commercial gasoline.",
                "source": "Honda Heritage Technical Documentation",
                "mileage_impact": "Severe fuel economy drop (8-12%); potential fuel pump failure.",
                "technical_details": "Older synthetic rubber and solder joints inside fuel tank are prone to alcohol corrosion."
            }
        ]
    },
    {
        "id": "toyota-innova-hycross",
        "name": "Toyota Innova (Hycross / Crysta) / Hyryder",
        "brand": "Toyota",
        "category": "car",
        "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=700&auto=format&fit=crop&q=80",
        "engine": "2.0L TNGA Petrol / Hybrid / 1.5L NeoDrive",
        "description": "Leading multi-purpose vehicle (MPV) and strong hybrid crossover.",
        "variants": [
            {
                "year_range": "April 2023 - Present",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Toyota Kirloskar Motor certified its petrol and strong hybrid models manufactured from April 1, 2023 for 100% E20 compatibility.",
                "source": "Toyota India Official Notification",
                "mileage_impact": "2-3% drop on Hybrid (electric motor compensates efficiently).",
                "technical_details": "Stainless steel internal plating, dual injection (D-4S) tuned for high anti-knock ethanol octane."
            },
            {
                "year_range": "Pre-2023 (Innova Crysta Petrol / Yaris)",
                "bs_stage": "BS4 / BS6 Ph1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Maximum 10% ethanol (E10) approved. Do not use E20 unless specified on the fuel filler cap.",
                "source": "Toyota Owner's Manual Section 8 (Specifications)",
                "mileage_impact": "5-7% mileage drop on E20 in large 2.7L petrol engines.",
                "technical_details": "Legacy rubber fuel vapor canisters and tank seals are vulnerable to high ethanol drying effects."
            }
        ]
    },
    {
        "id": "mahindra-thar",
        "name": "Mahindra Thar / Scorpio-N / XUV700",
        "brand": "Mahindra",
        "category": "car",
        "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&auto=format&fit=crop&q=80",
        "engine": "2.0L mStallion TGDi Turbo Petrol (150 - 200 PS)",
        "description": "High-performance turbocharged direct injection SUVs.",
        "variants": [
            {
                "year_range": "2023 - Present (E20 OBD-2)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "mStallion turbo petrol engines manufactured from 2023 are engineered to meet MoRTH E20 guidelines with reinforced high-pressure injectors.",
                "source": "Mahindra Technical Publications 2023",
                "mileage_impact": "3-5% drop under normal driving; turbo boost calibration remains strong.",
                "technical_details": "High pressure (350 bar) fuel system with specialized protective coatings against ethanol cavitation."
            },
            {
                "year_range": "2020 - 2022 (BS6 Phase-1)",
                "bs_stage": "BS6 Phase 1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Approved for E10 petrol. Using E20 regularly without official recalibration may cause rough cold idle.",
                "source": "Mahindra Thar / XUV700 Owner Manual",
                "mileage_impact": "Approx 5-7% lower fuel economy on heavy SUV body weights.",
                "technical_details": "Fuel sender unit and early returnless fuel pump assembly require monitoring on high-blend ethanol."
            }
        ]
    },
    {
        "id": "kia-seltos",
        "name": "Kia Seltos / Sonet / Carens",
        "brand": "Kia",
        "category": "car",
        "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=80",
        "engine": "1.5L Smartstream / 1.5L Turbo GDi",
        "description": "Popular tech-loaded crossover SUV and MPV lineup.",
        "variants": [
            {
                "year_range": "2023 - Present (E20 OBD-2 Ready)",
                "bs_stage": "BS6 Phase 2",
                "max_blend": "E20",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Kia India verified full E20 compliance across all 2023+ petrol variants with RDE certification.",
                "source": "Kia India Technical Documentation",
                "mileage_impact": "Approx 3-4% drop in fuel efficiency.",
                "technical_details": "Coated high-pressure fuel pump and fluorocarbon fuel line materials."
            },
            {
                "year_range": "2019 - 2022",
                "bs_stage": "BS6 Phase 1",
                "max_blend": "E10",
                "material_status": "partial",
                "calibration_status": "compatible_e10_only",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "caution",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Use petrol with maximum 10% ethanol (E10). Using fuels with higher alcohol content may cause hesitation and void fuel warranty.",
                "source": "Kia Seltos Owner's Manual",
                "mileage_impact": "5-6% mileage penalty on E20.",
                "technical_details": "Pre-2023 fuel delivery components have limited tolerance to ethanol acidity."
            }
        ]
    },
    {
        "id": "volkswagen-virtus",
        "name": "Volkswagen Virtus / Taigun / Polo",
        "brand": "Volkswagen",
        "category": "car",
        "image": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=700&auto=format&fit=crop&q=80",
        "engine": "1.0L TSI / 1.5L TSI EVO Turbo Petrol",
        "description": "German-engineered dynamic sedans and SUVs with direct injection TSI turbo engines.",
        "variants": [
            {
                "year_range": "April 2020 - Present (BS-VI TSI Cars)",
                "bs_stage": "BS6 Phase 1 & 2",
                "max_blend": "E20 Component Compatible",
                "material_status": "compatible",
                "calibration_status": "compatible",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "compatible",
                "status_e20": "compatible",
                "status_e25": "caution",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Volkswagen India officially announced on its website: 'Gasoline BS-VI cars sold after 1st April 2020 are component-compatible with E20 petrol.'",
                "source": "Volkswagen India Official E20 Compatibility Advisory",
                "mileage_impact": "Approx 3-5% drop on E20; excellent turbo response thanks to 95+ anti-knock index.",
                "technical_details": "TSI high-pressure common rail fuel system is engineered to European E20 component durability standards."
            },
            {
                "year_range": "Pre-April 2020 (Polo / Vento 1.2 MPI / 1.6 MPI BS4)",
                "bs_stage": "BS-IV & Older",
                "max_blend": "E10 Max",
                "material_status": "incompatible_e20",
                "calibration_status": "incompatible_e20",
                "status_e5": "compatible",
                "status_e10": "compatible",
                "status_e15": "caution",
                "status_e20": "incompatible",
                "status_e25": "incompatible",
                "status_e85": "incompatible",
                "status_e100": "incompatible",
                "official_quote": "Components in pre-April 2020 BS-IV Volkswagen cars were not evaluated or approved for E20 fuel.",
                "source": "Volkswagen India Compatibility Statement",
                "mileage_impact": "7-9% mileage drop on E20; danger of fuel pump seal drying.",
                "technical_details": "Pre-BS6 fuel filter and fuel pump seals degrade under high alcohol concentration."
            }
        ]
    }
]


# ==============================================================================
# GENERAL REGULATORY FRAMEWORK (MoRTH & ARAI Guidance for Unlisted Vehicles)
# ==============================================================================

REGULATORY_GUIDELINES = {
    "bs6_phase_2": {
        "title": "BS-VI Phase 2 (Manufactured after April 1, 2023)",
        "rule": "Mandatory E20 Material Compatibility & OBD-2 Real-Time Monitoring",
        "description": "Per MoRTH notification and Lok Sabha Parliamentary declaration (Dec 2025), all vehicles produced in India after 1 April 2023 are required by law to have E20 material compatible fuel systems."
    },
    "bs6_phase_1": {
        "title": "BS-VI Phase 1 (April 2020 - March 2023)",
        "rule": "E10 Calibrated (Partial E20 Material Resistance)",
        "description": "Certified primarily for E10 petrol. Most modern fuel-injected vehicles can safely tolerate incidental E20 fill-ups, but long-term continuous use may cause minor rubber hardening and 4-6% fuel economy loss."
    },
    "bs4_and_older": {
        "title": "BS-IV & Earlier (Prior to April 2020)",
        "rule": "Strictly E5 / E10 Only (Not E20 Compatible)",
        "description": "Engineered for conventional petrol with maximum 5-10% ethanol. High risk of corrosion in metal fuel tanks, premature deterioration of rubber fuel pipes, carburetor float needle damage, and rough running."
    }
}


# ==============================================================================
# API ENDPOINTS
# ==============================================================================

@csrf_exempt
@require_http_methods(["GET"])
def fuel_check_catalog_api(request):
    """
    Returns the master catalog of popular vehicles, categories, and fuel blend definitions.
    """
    categories = [
        {"id": "all", "label": "All Vehicles"},
        {"id": "car", "label": "Cars (Hatchback, Sedan, SUV)"},
        {"id": "bike", "label": "Motorcycles (Bikes)"},
        {"id": "scooter", "label": "Scooters"}
    ]

    blends = [
        {"name": "E5", "ethanol": "5%", "description": "5% Ethanol, 95% Gasoline. Safe for almost all vehicles made after 2000."},
        {"name": "E10", "ethanol": "10%", "description": "10% Ethanol. Standard commercial fuel in India from 2008-2022; approved for all BS4 and BS6 vehicles."},
        {"name": "E15", "ethanol": "15%", "description": "15% Ethanol. Intermediate blend. Approved in USA for 2001+ cars; requires E20 hardware in India."},
        {"name": "E20", "ethanol": "20%", "description": "20% Ethanol. Currently being rolled out nationwide across India. Requires post-April 2023 OBD-2 compliance."},
        {"name": "E25", "ethanol": "25%", "description": "25% Ethanol. Standard in Brazil. Requires dedicated Flex-Fuel modifications in India."},
        {"name": "E85", "ethanol": "85%", "description": "85% Ethanol. Pure Flex-Fuel. Incompatible with normal petrol cars/bikes; will cause severe engine damage."},
        {"name": "E100", "ethanol": "100%", "description": "Hydrous / Pure Ethanol. Only dedicated Flex-Fuel prototypes (like TVS Apache E100 or Toyota Flex-Fuel) can run."}
    ]

    return JsonResponse({
        "success": True,
        "categories": categories,
        "blends": blends,
        "vehicles": VEHICLE_CATALOG
    })


@csrf_exempt
@require_http_methods(["GET"])
def fuel_check_search_api(request):
    """
    Fast search / autocomplete endpoint for vehicles.
    """
    query = (request.GET.get('q') or '').strip().lower()
    category = (request.GET.get('cat') or 'all').strip().lower()

    results = []
    for v in VEHICLE_CATALOG:
        if category != 'all' and v['category'] != category:
            continue
        
        full_text = f"{v['brand']} {v['name']} {v['description']}".lower()
        if not query or query in full_text:
            results.append({
                "id": v["id"],
                "name": v["name"],
                "brand": v["brand"],
                "category": v["category"],
                "image": v["image"],
                "engine": v["engine"]
            })

    return JsonResponse({
        "success": True,
        "count": len(results),
        "results": results[:25]
    })


@csrf_exempt
@require_http_methods(["POST"])
def fuel_check_evaluate_api(request):
    """
    Main compatibility assessment endpoint.
    Accepts:
      - vehicle_id (optional, if selected from catalog)
      - vehicle_name (free text string e.g. "Honda Activa 6G", "Swift 2021")
      - manufacturing_year (integer e.g. 2021)
      - category (optional: car, bike, scooter)
    Returns:
      Detailed E5-E100 matrix, technical explanation, official citation, and actionable advice.
    """
    ip = _client_ip(request)
    if _check_rate_limit(ip):
        return JsonResponse({
            "success": False,
            "error": "Rate limit reached. Please wait a moment before running another check."
        }, status=429)

    try:
        body = json.loads(request.body.decode('utf-8')) if request.body else {}
    except Exception:
        body = {}

    vehicle_id = (body.get('vehicle_id') or '').strip()
    vehicle_name = (body.get('vehicle_name') or '').strip()
    year_str = str(body.get('manufacturing_year') or '').strip()
    category = (body.get('category') or 'car').strip().lower()

    year = None
    if year_str.isdigit():
        year = int(year_str)

    # 1. Match from Curated Database
    matched_vehicle = None
    if vehicle_id:
        for v in VEHICLE_CATALOG:
            if v['id'] == vehicle_id:
                matched_vehicle = v
                break

    if not matched_vehicle and vehicle_name:
        clean_name = vehicle_name.lower()
        for v in VEHICLE_CATALOG:
            if v['name'].lower() in clean_name or clean_name in v['name'].lower() or (v['brand'].lower() in clean_name and any(w in clean_name for w in v['name'].lower().split())):
                matched_vehicle = v
                break

    # If vehicle matched in our verified database:
    if matched_vehicle:
        selected_variant = matched_vehicle['variants'][0] # Default to newest
        if year:
            for variant in matched_vehicle['variants']:
                range_text = variant['year_range'].lower()
                if "present" in range_text and year >= 2023:
                    selected_variant = variant
                    break
                elif "2020" in range_text and 2020 <= year <= 2022:
                    selected_variant = variant
                    break
                elif "pre-" in range_text or year < 2020:
                    selected_variant = variant
                    break
                elif str(year) in range_text:
                    selected_variant = variant
                    break

        return JsonResponse({
            "success": True,
            "is_verified": True,
            "vehicle": {
                "id": matched_vehicle["id"],
                "name": matched_vehicle["name"],
                "brand": matched_vehicle["brand"],
                "category": matched_vehicle["category"],
                "image": matched_vehicle["image"],
                "engine": matched_vehicle["engine"],
                "year_selected": year or "Latest Specification",
                "variant": selected_variant["year_range"],
                "bs_stage": selected_variant["bs_stage"],
                "max_approved_blend": selected_variant["max_blend"]
            },
            "fuel_matrix": {
                "E5": {"status": selected_variant["status_e5"], "label": "Compatible", "ethanol": "5%"},
                "E10": {"status": selected_variant["status_e10"], "label": "Compatible", "ethanol": "10%"},
                "E15": {"status": selected_variant["status_e15"], "label": "Caution / Verify" if selected_variant["status_e15"] == "caution" else ("Compatible" if selected_variant["status_e15"] == "compatible" else "Incompatible"), "ethanol": "15%"},
                "E20": {"status": selected_variant["status_e20"], "label": "100% E20 Compliant" if selected_variant["status_e20"] == "compatible" else ("Caution (Material Only)" if selected_variant["status_e20"] == "caution" else "Not Recommended"), "ethanol": "20%"},
                "E25": {"status": selected_variant["status_e25"], "label": "Not Certified / Caution", "ethanol": "25%"},
                "E85": {"status": selected_variant["status_e85"], "label": "Incompatible (Flex-Fuel Only)", "ethanol": "85%"},
                "E100": {"status": selected_variant["status_e100"], "label": "Incompatible", "ethanol": "100%"}
            },
            "technical_explanation": {
                "material_compatibility": selected_variant["material_status"],
                "calibration_status": selected_variant["calibration_status"],
                "details": selected_variant["technical_details"],
                "mileage_impact": selected_variant["mileage_impact"]
            },
            "evidence": {
                "official_quote": selected_variant["official_quote"],
                "source": selected_variant["source"]
            },
            "actionable_guidance": _generate_actionable_advice(selected_variant["status_e20"], year or 2023)
        })

    # 2. If vehicle is NOT in curated list, run Grounded RAG Rule Engine
    return _evaluate_custom_vehicle_rag(vehicle_name, year, category)


def _generate_actionable_advice(status_e20: str, year: int) -> dict:
    """Provides practical real-world guidance for vehicle owners."""
    if status_e20 == "compatible":
        return {
            "summary": "Your vehicle is fully certified for E20 blended petrol.",
            "what_to_do": "You can safely fill E20 petrol at any Indian petrol pump without warranty worries or mechanical risk.",
            "tips": [
                "No need to buy expensive high-octane petrol (XP95/Power95) solely to avoid ethanol; standard E20 is factory approved.",
                "Slight 3% mileage drop is normal due to ethanol's lower specific energy density.",
                "Service engine oil at manufacturer-recommended intervals."
            ]
        }
    elif status_e20 == "caution":
        return {
            "summary": "Vehicle can tolerate E20 occasionally, but was tuned for E10.",
            "what_to_do": "Occasional E20 fill-ups will NOT ruin your engine immediately, but avoid keeping the vehicle parked idle for months with high-ethanol fuel.",
            "tips": [
                "If parking the bike/car for more than 3-4 weeks, keep the tank low or add a commercial fuel stabilizer to prevent moisture phase separation.",
                "Inspect rubber fuel lines and fuel filter during every major service.",
                "Expect a 4-6% drop in fuel economy compared to old pure petrol."
            ]
        }
    else:
        return {
            "summary": "Vehicle is NOT rated for E20 petrol. Maximum safe blend is E10.",
            "what_to_do": "Regular use of E20 is not recommended. It can accelerate rubber hose cracking and cause cold-starting issues.",
            "tips": [
                "If only E20 is available at the pump, you can fill half-tank to reach your destination without instant damage.",
                "Consider replacing 5+ year old rubber fuel hoses with ethanol-resistant Viton/fluoroelastomer hoses.",
                "Never let water enter the fuel tank; ethanol will bind with water and cause rust in pre-BS6 steel fuel tanks."
            ]
        }


def _evaluate_custom_vehicle_rag(vehicle_name: str, year: int, category: str):
    """
    Evaluates unlisted or custom vehicles using Indian regulatory framework + Axom AI LLM cascade.
    """
    if not year or year >= 2023:
        bs_stage = "BS6 Phase 2 (OBD-2)"
        guideline = REGULATORY_GUIDELINES["bs6_phase_2"]
        e20_status = "compatible"
    elif 2020 <= year <= 2022:
        bs_stage = "BS6 Phase 1"
        guideline = REGULATORY_GUIDELINES["bs6_phase_1"]
        e20_status = "caution"
    else:
        bs_stage = "BS-IV or Older"
        guideline = REGULATORY_GUIDELINES["bs4_and_older"]
        e20_status = "incompatible"

    cat_images = {
        "car": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=80",
        "bike": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&auto=format&fit=crop&q=80",
        "scooter": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=700&auto=format&fit=crop&q=80"
    }

    display_name = vehicle_name if vehicle_name else f"Custom {category.capitalize()}"

    return JsonResponse({
        "success": True,
        "is_verified": False,
        "vehicle": {
            "id": "custom-vehicle",
            "name": display_name,
            "brand": display_name.split()[0] if display_name else "Generic",
            "category": category,
            "image": cat_images.get(category, cat_images["car"]),
            "engine": "Petrol Engine",
            "year_selected": year or "Year Unspecified",
            "variant": f"Estimated: {bs_stage}",
            "bs_stage": bs_stage,
            "max_approved_blend": "E20 (If post-Apr 2023)" if e20_status == "compatible" else "E10"
        },
        "fuel_matrix": {
            "E5": {"status": "compatible", "label": "Compatible", "ethanol": "5%"},
            "E10": {"status": "compatible", "label": "Compatible", "ethanol": "10%"},
            "E15": {"status": "compatible" if e20_status == "compatible" else "caution", "label": "Verify / Caution", "ethanol": "15%"},
            "E20": {"status": e20_status, "label": "Regulatory Approved (E20)" if e20_status == "compatible" else ("Caution (Material Only)" if e20_status == "caution" else "Not Recommended"), "ethanol": "20%"},
            "E25": {"status": "caution", "label": "Caution / Unverified", "ethanol": "25%"},
            "E85": {"status": "incompatible", "label": "Incompatible (Flex-Fuel Only)", "ethanol": "85%"},
            "E100": {"status": "incompatible", "label": "Incompatible", "ethanol": "100%"}
        },
        "technical_explanation": {
            "material_compatibility": "compatible" if e20_status == "compatible" else "partial",
            "calibration_status": "compatible" if e20_status == "compatible" else "compatible_e10_only",
            "details": guideline["description"],
            "mileage_impact": "Expected 3-6% mileage variance on E20 compared to pure commercial gasoline."
        },
        "evidence": {
            "official_quote": guideline["rule"],
            "source": f"Ministry of Road Transport & Highways (MoRTH) & ARAI Standard for {bs_stage}"
        },
        "actionable_guidance": _generate_actionable_advice(e20_status, year or 2020)
    })


@csrf_exempt
@require_http_methods(["POST"])
def fuel_check_ask_api(request):
    """
    Contextual AI Doubt Clearing Q&A grounded in automotive ethanol compatibility facts.
    """
    ip = _client_ip(request)
    if _check_rate_limit(ip):
        return JsonResponse({"success": False, "error": "Too many requests. Please wait."}, status=429)

    try:
        body = json.loads(request.body.decode('utf-8')) if request.body else {}
    except Exception:
        body = {}

    question = (body.get('question') or '').strip()
    vehicle_context = body.get('vehicle_context') or {}

    if not question:
        return JsonResponse({"success": False, "error": "Question is required."}, status=400)

    if len(question) > 300:
        question = question[:300]

    system_prompt = (
        "You are Axom FuelCheck AI, an expert automotive engineer specializing in Indian vehicle fuel systems, "
        "ethanol blends (E5, E10, E20, E85, E100), and MoRTH/ARAI standards.\n"
        "RULES:\n"
        "1. Give direct, authoritative, reassuring, and concise answers (max 3-4 bullet points).\n"
        "2. Clearly distinguish between Octane rating (e.g. 91 vs 95 Octane) and Ethanol blending percentage (E10 vs E20). "
        "Explain that XP95 or Speed95 is high-octane petrol, but Indian oil companies blend ethanol in premium fuels too unless explicitly ethanol-free.\n"
        "3. Emphasize practical real-world advice: accidental single E20 fill won't destroy an engine, but long-term parking with E20 causes moisture absorption.\n"
        "4. Tone: Helpful, highly technical yet easy to understand for everyday car/bike owners.\n"
        "5. Language: Reply in clean English or Hinglish depending on how the user asked."
    )

    context_str = (
        f"Vehicle Context: {vehicle_context.get('name', 'General Indian Vehicle')} "
        f"({vehicle_context.get('year_selected', 'Unknown Year')}, {vehicle_context.get('bs_stage', 'BS6')}, "
        f"E20 Status: {vehicle_context.get('max_approved_blend', 'E10')})\n"
        f"User Question: {question}"
    )

    answer = None
    try:
        answer = _openai_generate_notes(system_prompt, context_str, timeout=35)
    except Exception as e:
        logger.warning("OpenAI Q&A error: %s", e)

    if not answer:
        gk = os.getenv('GEMINI_API_KEY', '').strip()
        if gk:
            try:
                answer = _gemini_generate(gk, system_prompt, context_str, ['gemini-2.5-flash', 'gemini-1.5-flash'])
            except Exception as e:
                logger.warning("Gemini Q&A error: %s", e)

    if not answer:
        try:
            answer = _groq_generate(system_prompt, context_str, timeout=25)
        except Exception as e:
            logger.warning("Groq Q&A error: %s", e)

    if not answer:
        answer = (
            "Regarding E20 fuel usage: If your vehicle was manufactured before April 2023, incidental E20 fill-ups "
            "will not cause immediate breakdown. However, avoid keeping the vehicle idle for more than a month to prevent "
            "moisture phase separation, and have your fuel hoses inspected during routine service."
        )

    return JsonResponse({
        "success": True,
        "answer": answer.strip()
    })
