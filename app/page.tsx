"use client";
import { useState } from "react";

/* ── DATA ─────────────────────────────────────────────────── */

type Chip = {
  id: string;
  name: string;
  gen?: string;
  suffix: string;
  tdp: string;
  cores: string;
  threads: string;
  baseClock: string;
  boostClock: string;
  igpu: string;
  ram: string;
  cache: string;
  notes: string;
  best: string;
  avoid: string;
  tag?: string;
};

type Family = {
  id: string;
  label: string;
  desc: string;
  chips: Chip[];
};

const INTEL_FAMILIES: Family[] = [
  {
    id: "i3",
    label: "Core i3",
    desc: "Entry-level. Web, docs, light tasks.",
    chips: [
      {
        id: "i3-1315u", name: "i3-1315U", gen: "13th Gen", suffix: "U",
        tdp: "15W", cores: "2P + 4E", threads: "8",
        baseClock: "1.2 GHz", boostClock: "4.5 GHz",
        igpu: "Intel UHD (64 EU)", ram: "DDR4/DDR5/LPDDR5",
        cache: "10MB", tag: "common",
        notes: "Most common budget 13th-gen i3. Found in ₹35k–₹50k laptops. Decent for office work.",
        best: "Web browsing, Office, video calls",
        avoid: "Multitasking with 10+ tabs, video editing",
      },
      {
        id: "i3-n305", name: "i3-N305", gen: "Alder Lake-N", suffix: "N",
        tdp: "9W", cores: "8E only", threads: "8",
        baseClock: "1.8 GHz", boostClock: "3.8 GHz",
        igpu: "Intel UHD (32 EU)", ram: "LPDDR5 only",
        cache: "6MB", tag: "warn",
        notes: "Atom-class chip. Low power. Single-threaded tasks feel sluggish. Only in sub-₹35k laptops.",
        best: "Basic web, typing",
        avoid: "Anything beyond basic browsing",
      },
    ],
  },
  {
    id: "i5",
    label: "Core i5",
    desc: "Mainstream. Best price-to-performance.",
    chips: [
      {
        id: "i5-1335u", name: "i5-1335U", gen: "13th Gen", suffix: "U",
        tdp: "15W", cores: "2P + 8E", threads: "12",
        baseClock: "1.3 GHz", boostClock: "4.6 GHz",
        igpu: "Intel Iris Xe (80 EU)", ram: "DDR4/DDR5/LPDDR5",
        cache: "12MB", tag: "common",
        notes: "Most sold mid-range chip. Iris Xe GPU handles 1080p video playback and light tasks well. Good battery.",
        best: "Office, coding, video calls, light photo editing",
        avoid: "Gaming, heavy video export",
      },
      {
        id: "i5-1345u", name: "i5-1345U", gen: "13th Gen", suffix: "U",
        tdp: "15–28W", cores: "2P + 8E", threads: "12",
        baseClock: "1.6 GHz", boostClock: "4.7 GHz",
        igpu: "Intel Iris Xe (80 EU)", ram: "DDR4/DDR5/LPDDR5",
        cache: "12MB", tag: "common",
        notes: "Slightly faster than 1335U due to higher base clock and 28W mode. Common in business laptops.",
        best: "Business use, multitasking, long sessions",
        avoid: "Gaming",
      },
      {
        id: "i5-13500h", name: "i5-13500H", gen: "13th Gen", suffix: "H",
        tdp: "45W", cores: "4P + 8E", threads: "16",
        baseClock: "2.6 GHz", boostClock: "4.7 GHz",
        igpu: "Intel Iris Xe (80 EU)", ram: "DDR4/DDR5",
        cache: "18MB", tag: "best",
        notes: "Big jump over U-series. 45W sustained makes this feel like a different class. Usually paired with a dGPU.",
        best: "Coding, content creation, light gaming (with dGPU)",
        avoid: "Ultra-thin chassis — throttles badly",
      },
      {
        id: "i5-13420h", name: "i5-13420H", gen: "13th Gen", suffix: "H",
        tdp: "45W", cores: "4P + 4E", threads: "12",
        baseClock: "2.0 GHz", boostClock: "4.6 GHz",
        igpu: "Intel UHD (64 EU)", ram: "DDR4/DDR5",
        cache: "12MB", tag: "warn",
        notes: "Budget H-series. Fewer E-cores, weaker iGPU than 13500H. Check carefully — often confused with 13500H.",
        best: "Gaming laptops where dGPU does the work",
        avoid: "iGPU workloads",
      },
    ],
  },
  {
    id: "i7",
    label: "Core i7",
    desc: "Performance tier. U vs H matters enormously.",
    chips: [
      {
        id: "i7-1355u", name: "i7-1355U", gen: "13th Gen", suffix: "U",
        tdp: "15W", cores: "2P + 8E", threads: "12",
        baseClock: "1.7 GHz", boostClock: "5.0 GHz",
        igpu: "Intel Iris Xe (96 EU)", ram: "DDR4/DDR5/LPDDR5",
        cache: "12MB", tag: "warn",
        notes: "Despite the i7 label, this is a thin-and-light chip. Only marginally faster than i5-1335U at same TDP. Overpriced tier.",
        best: "Thin laptops where battery matters more than speed",
        avoid: "Expecting i7 performance — it barely beats i5-U",
      },
      {
        id: "i7-1365u", name: "i7-1365U", gen: "13th Gen", suffix: "U",
        tdp: "15–28W", cores: "2P + 8E", threads: "12",
        baseClock: "1.8 GHz", boostClock: "5.2 GHz",
        igpu: "Intel Iris Xe (96 EU)", ram: "DDR4/DDR5/LPDDR5",
        cache: "12MB", tag: "common",
        notes: "Best U-series i7. 28W mode helps in bursty tasks. Good for ultrabooks that need snappy response.",
        best: "Premium ultrabooks, business travel",
        avoid: "Sustained heavy loads",
      },
      {
        id: "i7-13700h", name: "i7-13700H", gen: "13th Gen", suffix: "H",
        tdp: "45W", cores: "6P + 8E", threads: "20",
        baseClock: "2.4 GHz", boostClock: "5.0 GHz",
        igpu: "Intel Iris Xe (96 EU)", ram: "DDR4/DDR5",
        cache: "24MB", tag: "best",
        notes: "The real i7. 20 threads, 24MB cache, 45W. Handles Premiere Pro, 3D, compiling. Usually paired with RTX 4060+.",
        best: "Video editing, 3D, software dev, gaming",
        avoid: "Thin chassis (throttles to ~35W)",
      },
      {
        id: "i7-13620h", name: "i7-13620H", gen: "13th Gen", suffix: "H",
        tdp: "45W", cores: "6P + 4E", threads: "16",
        baseClock: "2.4 GHz", boostClock: "4.9 GHz",
        igpu: "Intel UHD (64 EU)", ram: "DDR4/DDR5",
        cache: "18MB", tag: "common",
        notes: "Cheaper H-series i7. Fewer E-cores, weaker iGPU. Common in budget gaming laptops.",
        best: "Gaming laptops with dGPU",
        avoid: "iGPU work",
      },
    ],
  },
  {
    id: "i9",
    label: "Core i9",
    desc: "Top-end. Workstation-class in a laptop.",
    chips: [
      {
        id: "i9-13900h", name: "i9-13900H", gen: "13th Gen", suffix: "H",
        tdp: "45W", cores: "6P + 8E", threads: "20",
        baseClock: "2.6 GHz", boostClock: "5.4 GHz",
        igpu: "Intel Iris Xe (96 EU)", ram: "DDR4/DDR5",
        cache: "24MB", tag: "best",
        notes: "Fastest H-series i9. Higher clocks than i7-13700H. Pairs with RTX 4070/4080. Runs hot — needs large chassis.",
        best: "4K video editing, game dev, 3D rendering",
        avoid: "Thin laptops, budget cooling",
      },
      {
        id: "i9-13980hx", name: "i9-13980HX", gen: "13th Gen", suffix: "HX",
        tdp: "55W (up to 157W)", cores: "8P + 16E", threads: "32",
        baseClock: "2.2 GHz", boostClock: "5.6 GHz",
        igpu: "Intel UHD (32 EU)", ram: "DDR5 (desktop slots)",
        cache: "36MB", tag: "best",
        notes: "Desktop-class chip in a laptop. Upgradeable RAM. 157W peak requires massive cooling. Only in 2–3kg+ machines.",
        best: "Mobile workstations, 3D/VFX, server-class workloads",
        avoid: "Anyone who doesn't need this level — massive overkill",
      },
    ],
  },
  {
    id: "ultra",
    label: "Core Ultra (Series 1 & 2)",
    desc: "2024 rebrand. Added Arc GPU + NPU for AI.",
    chips: [
      {
        id: "ultra5-125h", name: "Core Ultra 5 125H", gen: "Meteor Lake", suffix: "H",
        tdp: "28–45W", cores: "4P + 8E + 2LPE", threads: "14",
        baseClock: "1.2 GHz", boostClock: "4.5 GHz",
        igpu: "Intel Arc (8 Xe cores)", ram: "DDR5/LPDDR5",
        cache: "18MB", tag: "common",
        notes: "First Ultra with Arc iGPU. The Arc GPU is a real upgrade over Iris Xe — handles light gaming. NPU for AI tasks.",
        best: "AI features, light gaming without dGPU, modern thin laptops",
        avoid: "Heavy sustained workloads",
      },
      {
        id: "ultra7-155h", name: "Core Ultra 7 155H", gen: "Meteor Lake", suffix: "H",
        tdp: "28–45W", cores: "6P + 8E + 2LPE", threads: "16",
        baseClock: "1.4 GHz", boostClock: "4.8 GHz",
        igpu: "Intel Arc (8 Xe cores)", ram: "DDR5/LPDDR5",
        cache: "24MB", tag: "best",
        notes: "Best mainstream Ultra. Arc iGPU plays older titles at 1080p low-medium. NPU handles AI camera/audio processing.",
        best: "Premium thin laptops, light gaming, AI features",
        avoid: "Replacing an H-series gaming chip — TDP is lower",
      },
      {
        id: "ultra9-185h", name: "Core Ultra 9 185H", gen: "Meteor Lake", suffix: "H",
        tdp: "45W", cores: "6P + 8E + 2LPE", threads: "16",
        baseClock: "2.3 GHz", boostClock: "5.1 GHz",
        igpu: "Intel Arc (8 Xe cores)", ram: "DDR5/LPDDR5",
        cache: "24MB", tag: "best",
        notes: "Fastest Meteor Lake chip. Marginal over Ultra 7 155H in most tasks. Higher sustained clocks.",
        best: "Top-tier thin laptops, content creation",
        avoid: "Unless you specifically need the clock bump",
      },
      {
        id: "ultra5-226v", name: "Core Ultra 5 226V", gen: "Lunar Lake (Series 2)", suffix: "V",
        tdp: "17W", cores: "4P + 4E", threads: "8",
        baseClock: "2.1 GHz", boostClock: "4.5 GHz",
        igpu: "Intel Arc 140V (8 Xe2 cores)", ram: "LPDDR5X (on-package, soldered)",
        cache: "12MB", tag: "common",
        notes: "New V-series = very efficient. RAM is soldered on the chip package — not upgradeable. Big battery life gains.",
        best: "Ultra-portable laptops, long battery life, AI PC",
        avoid: "If you need more than 32GB RAM ever",
      },
      {
        id: "ultra7-258v", name: "Core Ultra 7 258V", gen: "Lunar Lake (Series 2)", suffix: "V",
        tdp: "17W", cores: "4P + 4E", threads: "8",
        baseClock: "2.2 GHz", boostClock: "4.8 GHz",
        igpu: "Intel Arc 140V (8 Xe2 cores)", ram: "LPDDR5X (on-package, soldered)",
        cache: "12MB", tag: "best",
        notes: "Best thin-and-light Intel right now. Arc 140V handles 1080p light gaming decently. Battery life rivals Apple M3.",
        best: "Premium ultrabooks, all-day battery, AI tasks",
        avoid: "Power users — TDP ceiling is 17W",
      },
    ],
  },
];

const AMD_FAMILIES: Family[] = [
  {
    id: "r3",
    label: "Ryzen 3",
    desc: "Entry-level. Basic everyday tasks.",
    chips: [
      {
        id: "r3-7320u", name: "Ryzen 3 7320U", gen: "7000 series", suffix: "U",
        tdp: "15W", cores: "4", threads: "8",
        baseClock: "2.4 GHz", boostClock: "4.1 GHz",
        igpu: "AMD Radeon 610M (2 CU, RDNA2)", ram: "LPDDR5X only (soldered)",
        cache: "6MB L3", tag: "warn",
        notes: "Trap chip. Uses RDNA2 GPU (not RDNA3) and soldered LPDDR5X. Found in cheap laptops but misleadingly marketed as '7000 series'. The GPU is much weaker than Ryzen 5 7000.",
        best: "Basic office use only",
        avoid: "Any GPU workload, gaming, upgrading RAM",
      },
      {
        id: "r3-7330u", name: "Ryzen 3 7330U", gen: "7000 series (Zen 3 refresh)", suffix: "U",
        tdp: "15W", cores: "4", threads: "8",
        baseClock: "2.3 GHz", boostClock: "4.3 GHz",
        igpu: "AMD Radeon (Vega 6)", ram: "DDR4/LPDDR4",
        cache: "8MB L3", tag: "warn",
        notes: "This is actually a Zen 3 chip rebadged as 7000. Older architecture, weaker GPU. Often cheaper than 7320U.",
        best: "Budget office tasks",
        avoid: "Expecting modern GPU performance",
      },
    ],
  },
  {
    id: "r5",
    label: "Ryzen 5",
    desc: "Best value. RDNA3 variants are exceptional.",
    chips: [
      {
        id: "r5-7530u", name: "Ryzen 5 7530U", gen: "7000 series (Zen 3 refresh)", suffix: "U",
        tdp: "15W", cores: "6", threads: "12",
        baseClock: "2.0 GHz", boostClock: "4.5 GHz",
        igpu: "AMD Radeon (Vega 7)", ram: "DDR4/LPDDR4",
        cache: "16MB L3", tag: "common",
        notes: "Despite '7000' branding, this is Zen 3 (2021 architecture). Vega GPU is older but chip is very efficient. Good value if priced right.",
        best: "Office, coding, light multitasking",
        avoid: "Expecting RDNA3 GPU — it's Vega",
      },
      {
        id: "r5-7535hs", name: "Ryzen 5 7535HS", gen: "7000 series", suffix: "HS",
        tdp: "35W", cores: "6", threads: "12",
        baseClock: "3.3 GHz", boostClock: "4.55 GHz",
        igpu: "AMD Radeon 660M (RDNA2, 6 CU)", ram: "DDR5/LPDDR5",
        cache: "16MB L3", tag: "common",
        notes: "Real 7000 Zen 4 performance. 35W sustained is a sweet spot. Common in mid-range gaming laptops.",
        best: "Coding, multitasking, gaming laptops with dGPU",
        avoid: "iGPU gaming — 660M is RDNA2, not RDNA3",
      },
      {
        id: "r5-7640u", name: "Ryzen 5 7640U", gen: "7000 series", suffix: "U",
        tdp: "15–28W", cores: "6", threads: "12",
        baseClock: "3.5 GHz", boostClock: "4.9 GHz",
        igpu: "AMD Radeon 760M (RDNA3, 8 CU)", ram: "DDR5/LPDDR5",
        cache: "16MB L3", tag: "best",
        notes: "The mid-range king. RDNA3 GPU changes everything at this tier. Can run CS2, Minecraft, Fortnite at 1080p low-medium. Thin laptop friendly.",
        best: "Best all-rounder under ₹70k, light gaming without dGPU",
        avoid: "Heavy sustained workloads (15W TDP cap)",
      },
    ],
  },
  {
    id: "r7",
    label: "Ryzen 7",
    desc: "Performance tier. 780M iGPU is class-leading.",
    chips: [
      {
        id: "r7-7735hs", name: "Ryzen 7 7735HS", gen: "7000 series (Zen 3 refresh)", suffix: "HS",
        tdp: "35W", cores: "8", threads: "16",
        baseClock: "3.2 GHz", boostClock: "4.75 GHz",
        igpu: "AMD Radeon 680M (RDNA2, 12 CU)", ram: "DDR5/LPDDR5",
        cache: "16MB L3", tag: "warn",
        notes: "Zen 3 repackaged as 7000 series. 680M is RDNA2 despite the name. Still a solid chip but check the price — often overpriced.",
        best: "Multitasking, coding, gaming with dGPU",
        avoid: "Expecting Zen 4 performance",
      },
      {
        id: "r7-7745hx", name: "Ryzen 7 7745HX", gen: "7000 series (Dragon Range)", suffix: "HX",
        tdp: "55W", cores: "8", threads: "16",
        baseClock: "3.6 GHz", boostClock: "5.1 GHz",
        igpu: "AMD Radeon 610M (RDNA2, 2 CU)", ram: "DDR5",
        cache: "32MB L3", tag: "common",
        notes: "Desktop-class Zen 4 in a laptop. Massive cache. Paired with RTX 4070/4080. iGPU is weak — always has dGPU.",
        best: "Gaming + heavy workloads simultaneously",
        avoid: "Without a dGPU — iGPU is stripped down",
      },
      {
        id: "r7-8845hs", name: "Ryzen 7 8845HS", gen: "8000 series (Hawk Point)", suffix: "HS",
        tdp: "35–54W", cores: "8", threads: "16",
        baseClock: "3.8 GHz", boostClock: "5.1 GHz",
        igpu: "AMD Radeon 780M (RDNA3, 12 CU)", ram: "DDR5/LPDDR5",
        cache: "16MB L3", tag: "best",
        notes: "Best laptop iGPU available. 780M can handle GTA V, Cyberpunk (low), Valorant at 1080p. Also has NPU for AI. The chip to get if you want performance without a dGPU.",
        best: "Best iGPU gaming, content creation, AI tasks, devs",
        avoid: "Nothing — best all-round AMD laptop chip",
      },
    ],
  },
  {
    id: "r9",
    label: "Ryzen 9",
    desc: "Workstation-class. Dominates multi-core.",
    chips: [
      {
        id: "r9-7940hs", name: "Ryzen 9 7940HS", gen: "7000 series", suffix: "HS",
        tdp: "35–54W", cores: "8", threads: "16",
        baseClock: "4.0 GHz", boostClock: "5.2 GHz",
        igpu: "AMD Radeon 780M (RDNA3, 12 CU)", ram: "DDR5/LPDDR5",
        cache: "16MB L3", tag: "best",
        notes: "Zen 4 at high clocks. Same 780M GPU as 8845HS but slightly higher boost. Found in premium thin-and-light laptops.",
        best: "Same as 8845HS but faster clock for ceiling-hitting tasks",
        avoid: "Paying premium — 8845HS is very close in real-world tasks",
      },
      {
        id: "r9-7945hx", name: "Ryzen 9 7945HX", gen: "7000 series (Dragon Range)", suffix: "HX",
        tdp: "55W (up to 75W)", cores: "16", threads: "32",
        baseClock: "2.5 GHz", boostClock: "5.4 GHz",
        igpu: "AMD Radeon 610M (RDNA2, 2 CU)", ram: "DDR5",
        cache: "64MB L3", tag: "best",
        notes: "16 cores on a laptop. 64MB cache is absurd — fastest in compiling, 3D, simulation. Destroys Intel i9-13980HX in multi-core. Always paired with dGPU.",
        best: "Compiling, Blender, DaVinci, simulation, server-class tasks",
        avoid: "iGPU use — it's stripped. Needs large chassis.",
      },
      {
        id: "r9-8945hs", name: "Ryzen 9 8945HS", gen: "8000 series (Hawk Point)", suffix: "HS",
        tdp: "35–54W", cores: "8", threads: "16",
        baseClock: "4.0 GHz", boostClock: "5.2 GHz",
        igpu: "AMD Radeon 890M (RDNA3.5, 16 CU)", ram: "DDR5/LPDDR5",
        cache: "16MB L3", tag: "best",
        notes: "890M has 16 CUs vs 780M's 12 CUs. Approaches GTX 1650 territory. Top of what AMD offers in a non-HX slim chip.",
        best: "Best slim laptop for iGPU + performance balance",
        avoid: "HX-level workloads — still 35W limit",
      },
    ],
  },
  {
    id: "ryzen-ai",
    label: "Ryzen AI (Strix Point)",
    desc: "2024. RDNA3.5 GPU + powerful NPU.",
    chips: [
      {
        id: "ai5-hx370", name: "Ryzen AI 5 360", gen: "Strix Point", suffix: "HX",
        tdp: "15–28W", cores: "6", threads: "12",
        baseClock: "3.0 GHz", boostClock: "5.0 GHz",
        igpu: "AMD Radeon 880M (RDNA3.5, 12 CU)", ram: "LPDDR5X",
        cache: "16MB L3", tag: "common",
        notes: "Surprising mid-range chip. 880M GPU outperforms most Intel iGPUs. Good NPU for local AI. Efficient package.",
        best: "Mid-range thin laptops, AI features, light gaming",
        avoid: "Heavy sustained CPU loads",
      },
      {
        id: "ai7-hx360", name: "Ryzen AI 7 350", gen: "Strix Point", suffix: "HX",
        tdp: "15–28W", cores: "8", threads: "16",
        baseClock: "3.0 GHz", boostClock: "5.1 GHz",
        igpu: "AMD Radeon 890M (RDNA3.5, 16 CU)", ram: "LPDDR5X",
        cache: "16MB L3", tag: "best",
        notes: "Excellent chip. 890M approaches GTX 1650. 8 Zen 5 cores handle anything. NPU at 50 TOPS for AI. Best thin laptop AMD right now.",
        best: "Premium thin laptop, gaming without dGPU, AI tasks",
        avoid: "HX workstation tasks — still thin-laptop TDP",
      },
      {
        id: "ai9-hx370", name: "Ryzen AI 9 HX 370", gen: "Strix Point", suffix: "HX",
        tdp: "28–54W", cores: "12", threads: "24",
        baseClock: "2.0 GHz", boostClock: "5.1 GHz",
        igpu: "AMD Radeon 890M (RDNA3.5, 16 CU)", ram: "LPDDR5X",
        cache: "24MB L3", tag: "best",
        notes: "12 Zen 5 cores + best-in-class iGPU + best NPU (50 TOPS). Closest AMD gets to a MacBook M-class chip. Exceptional efficiency.",
        best: "Everything. Best AMD laptop chip overall.",
        avoid: "Nothing to avoid — slightly pricier is all",
      },
    ],
  },
];

/* ── NAMING DATA ─────────────────────────────────────── */
const NAMING_INTEL = [
  { code: "i3 / i5 / i7 / i9", meaning: "Tier. Old i7 can lose to new i5 — generation matters more." },
  { code: "13th / 14th Gen", meaning: "Generation. 14th = minor refresh of 13th. Not a significant upgrade." },
  { code: "U suffix", meaning: "Ultra-low power. 15–28W. Thin laptops. Slower but better battery." },
  { code: "H suffix", meaning: "High performance. 35–45W. Significantly faster. Heavier laptops." },
  { code: "HX suffix", meaning: "Extreme. 55–115W. Desktop-class chip. Only in 2kg+ machines." },
  { code: "P suffix", meaning: "Performance. 28W. Between U and H. Common in business laptops." },
  { code: "N suffix", meaning: "Budget Atom-class. Very slow. Sub-₹35k laptops only." },
  { code: "Core Ultra (Series 1)", meaning: "2024 rebrand. Ultra 5 = i5 tier. Ultra 7 = i7 tier. Has Arc iGPU + NPU." },
  { code: "V suffix (Series 2)", meaning: "Lunar Lake. Extremely efficient. RAM soldered onto chip — not upgradeable." },
  { code: "i7-1355U vs i5-13500H", meaning: "Despite higher tier, i7-U is slower than i5-H. Suffix beats tier number." },
];

const NAMING_AMD = [
  { code: "Ryzen 3 / 5 / 7 / 9", meaning: "Tier. Same caveat as Intel — generation and suffix matter more." },
  { code: "7xxx / 8xxx series", meaning: "7000 = 2022/23. 8000 = 2023/24. But not all 7000 chips are Zen 4 — see below." },
  { code: "U suffix", meaning: "Ultra-low power. 15–28W. Thin laptops." },
  { code: "HS suffix", meaning: "High performance slim. 35–45W. Best balance of power and size." },
  { code: "HX suffix", meaning: "Extreme. 55W+. Desktop-class. Large laptops only." },
  { code: "4th digit = GPU generation", meaning: "7640U → '4' = RDNA3. 7530U → '3' = RDNA2. Higher digit = better iGPU." },
  { code: "7320U / 7330U warning", meaning: "Despite '7000' name, these use older Zen 2/3 cores and RDNA2/Vega GPUs. Check the actual architecture." },
  { code: "Ryzen AI (Strix Point)", meaning: "2024 lineup. Zen 5 cores + RDNA3.5 GPU + 50 TOPS NPU. Not a minor update." },
  { code: "Ryzen 7 7735HS vs 7745HX", meaning: "7735HS is Zen 3 repackaged. 7745HX is true Zen 4. Different chips entirely." },
];

/* ── COMPONENTS ──────────────────────────────────────── */

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="spec-row">
      <span className="spec-label">{label}</span>
      <span className="spec-val">{value}</span>
    </div>
  );
}

function tagLabel(tag?: string) {
  if (tag === "best") return <span className="badge badge-green ml-2">Recommended</span>;
  if (tag === "warn") return <span className="badge badge-warn ml-2">Caution</span>;
  if (tag === "common") return <span className="badge badge-muted ml-2">Common</span>;
  return null;
}

function ChipNode({ chip, brand }: { chip: Chip; brand: "intel" | "amd" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tree-item mt-2">
      <button
        className={`chip-node ${open ? `open ${brand}` : ""}`}
        onClick={() => setOpen(v => !v)}
        style={{ gap: 10 }}
      >
        <span style={{
          fontSize: 11, color: open ? (brand === "intel" ? "var(--intel-light)" : "var(--amd-light)") : "var(--muted)",
          transition: "transform 0.15s", display: "inline-block",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          marginRight: 4,
        }}>▶</span>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>{chip.name}</span>
        {chip.gen && <span style={{ fontSize: 12, color: "var(--muted)" }}>{chip.gen}</span>}
        {tagLabel(chip.tag)}
        <span className="ml-auto" style={{ fontSize: 12, color: "var(--muted)" }}>{chip.tdp} · {chip.cores} cores</span>
      </button>

      {open && (
        <div className="detail-panel fade-in mt-1 ml-4">
          <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65 }}>{chip.notes}</p>
          </div>
          <SpecRow label="TDP" value={chip.tdp} />
          <SpecRow label="Cores / Threads" value={`${chip.cores} / ${chip.threads}`} />
          <SpecRow label="Base → Boost" value={`${chip.baseClock} → ${chip.boostClock}`} />
          <SpecRow label="Integrated GPU" value={chip.igpu} />
          <SpecRow label="RAM support" value={chip.ram} />
          <SpecRow label="Cache" value={chip.cache} />
          <SpecRow label="Best for" value={chip.best} />
          <SpecRow label="Avoid if" value={chip.avoid} />
        </div>
      )}
    </div>
  );
}

function FamilyNode({ fam, brand }: { fam: Family; brand: "intel" | "amd" }) {
  const [open, setOpen] = useState(false);
  const color = brand === "intel" ? "var(--intel-light)" : "var(--amd-light)";
  return (
    <div className="tree-item mt-3">
      <button
        className={`chip-node ${open ? `open ${brand}` : ""}`}
        onClick={() => setOpen(v => !v)}
        style={{ gap: 10 }}
      >
        <span style={{
          fontSize: 12, color: open ? color : "var(--muted)",
          transition: "transform 0.15s", display: "inline-block",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          marginRight: 4,
        }}>▶</span>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16 }}>{fam.label}</span>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{fam.desc}</span>
        <span className="ml-auto" style={{ fontSize: 12, color: "var(--muted)" }}>{fam.chips.length} chips</span>
      </button>

      {open && (
        <div className="tree-children fade-in">
          {fam.chips.map(c => (
            <ChipNode key={c.id} chip={c} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── PAGE ────────────────────────────────────────────── */

export default function Home() {
  const [tab, setTab] = useState<"intel" | "amd" | "naming">("intel");

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* Hero */}
      <header className="grid-bg border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-10">
          <h1 className="display" style={{ fontSize: "clamp(2.2rem,6vw,4rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Laptop CPU Guide
          </h1>
          <p style={{ marginTop: 10, fontSize: 15, color: "var(--muted)", maxWidth: 480, lineHeight: 1.7 }}>
            Every Intel & AMD laptop chip explained. Click any chip to see full specs.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(7,9,14,0.96)", backdropFilter: "blur(10px)", borderColor: "var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex gap-2">
          <button className={`tab-btn ${tab === "intel" ? "active intel" : ""}`} onClick={() => setTab("intel")}>Intel</button>
          <button className={`tab-btn ${tab === "amd" ? "active amd" : ""}`} onClick={() => setTab("amd")}>AMD</button>
          <button className={`tab-btn ${tab === "naming" ? "active both" : ""}`} onClick={() => setTab("naming")}>Naming Guide</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* ── INTEL ── */}
        {tab === "intel" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="badge badge-intel" style={{ fontSize: 13, padding: "4px 12px" }}>Intel</span>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>13th & 14th Gen · Core Ultra Series 1 & 2</span>
            </div>
            <div className="tree-root">
              {INTEL_FAMILIES.map(f => (
                <FamilyNode key={f.id} fam={f} brand="intel" />
              ))}
            </div>
          </div>
        )}

        {/* ── AMD ── */}
        {tab === "amd" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="badge badge-amd" style={{ fontSize: 13, padding: "4px 12px" }}>AMD</span>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>Ryzen 3 / 5 / 7 / 9 · Ryzen AI (Strix Point)</span>
            </div>
            <div className="tree-root">
              {AMD_FAMILIES.map(f => (
                <FamilyNode key={f.id} fam={f} brand="amd" />
              ))}
            </div>
          </div>
        )}

        {/* ── NAMING ── */}
        {tab === "naming" && (
          <div className="space-y-8">
            {[
              { brand: "intel" as const, title: "Intel Naming", rows: NAMING_INTEL },
              { brand: "amd" as const, title: "AMD Naming", rows: NAMING_AMD },
            ].map(({ brand, title, rows }) => (
              <div key={brand} className="rounded-2xl border overflow-hidden"
                style={{ borderColor: brand === "intel" ? "var(--intel)" : "var(--amd)", boxShadow: brand === "intel" ? "0 0 24px var(--intel-glow)" : "0 0 24px var(--amd-glow)" }}>
                <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
                  <span className={`badge badge-${brand}`}>{brand.toUpperCase()}</span>
                  <span className="display font-700 text-base">{title}</span>
                </div>
                <div>
                  {rows.map((r, i) => (
                    <div key={i} className="flex gap-4 items-start px-5 py-3 border-b last:border-b-0 hover:bg-white/[0.02] transition-colors"
                      style={{ borderColor: "var(--border)" }}>
                      <code style={{
                        fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 6, flexShrink: 0, minWidth: 160,
                        background: brand === "intel" ? "rgba(0,104,181,0.12)" : "rgba(237,28,36,0.12)",
                        color: brand === "intel" ? "var(--intel-light)" : "var(--amd-light)",
                        display: "inline-block",
                      }}>{r.code}</code>
                      <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65 }}>{r.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-xl border p-5" style={{ borderColor: "rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.04)" }}>
              <div className="flex gap-3">
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <p className="display font-700 mb-1" style={{ fontSize: 14 }}>Suffix beats tier number</p>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
                    Intel <strong style={{ color: "var(--text)" }}>i7-1355U</strong> (15W) loses to <strong style={{ color: "var(--text)" }}>i5-13500H</strong> (45W) in real tasks.
                    AMD <strong style={{ color: "var(--text)" }}>Ryzen 7 7735U</strong> loses to <strong style={{ color: "var(--text)" }}>Ryzen 5 7535HS</strong>.
                    Always check the suffix.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center" style={{ borderColor: "var(--border)", color: "var(--muted)", fontSize: 13 }}>
        Laptop CPU Guide · Click any chip to expand
      </footer>
    </div>
  );
}
