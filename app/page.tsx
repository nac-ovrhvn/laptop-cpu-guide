"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════ */
type Chip = {
  id: string; name: string; brand: "intel" | "amd";
  family: string; gen: string; suffix: string;
  tdp: string; cores: string; threads: string;
  base: string; boost: string; igpu: string;
  ram: string; cache: string;
  best: string; avoid: string; notes: string;
  tag?: "best" | "warn";
};

const INTEL: Chip[] = [
  { id:"i3-1315u",    name:"i3-1315U",      brand:"intel", family:"Core i3",    gen:"13th Gen",          suffix:"U",  tdp:"15W",      cores:"2P+4E",     threads:"8",  base:"1.2 GHz", boost:"4.5 GHz", igpu:"UHD 64EU",           ram:"DDR4/5, LPDDR5",     cache:"10 MB",  best:"Web, Office, video calls",          avoid:"Heavy multitasking, editing",    notes:"Most common budget i3. Adequate for daily tasks in ₹35k–₹50k laptops." },
  { id:"i3-n305",     name:"i3-N305",        brand:"intel", family:"Core i3",    gen:"Alder Lake-N",      suffix:"N",  tdp:"9 W",      cores:"8E only",   threads:"8",  base:"1.8 GHz", boost:"3.8 GHz", igpu:"UHD 32EU",           ram:"LPDDR5 only",        cache:"6 MB",   best:"Basic web, typing",                 avoid:"Anything demanding",             notes:"Atom-class chip. Sluggish. Sub-₹35k only.", tag:"warn" },
  { id:"i5-1335u",    name:"i5-1335U",       brand:"intel", family:"Core i5",    gen:"13th Gen",          suffix:"U",  tdp:"15 W",     cores:"2P+8E",     threads:"12", base:"1.3 GHz", boost:"4.6 GHz", igpu:"Iris Xe 80EU",       ram:"DDR4/5, LPDDR5",     cache:"12 MB",  best:"Office, coding, photo editing",     avoid:"Gaming, heavy export",           notes:"Best-selling mid-range. Iris Xe handles 1080p video well." },
  { id:"i5-1345u",    name:"i5-1345U",       brand:"intel", family:"Core i5",    gen:"13th Gen",          suffix:"U",  tdp:"15–28 W",  cores:"2P+8E",     threads:"12", base:"1.6 GHz", boost:"4.7 GHz", igpu:"Iris Xe 80EU",       ram:"DDR4/5, LPDDR5",     cache:"12 MB",  best:"Business multitasking",             avoid:"Gaming",                         notes:"Higher base clock than 1335U. Common in business laptops." },
  { id:"i5-13500h",   name:"i5-13500H",      brand:"intel", family:"Core i5",    gen:"13th Gen",          suffix:"H",  tdp:"45 W",     cores:"4P+8E",     threads:"16", base:"2.6 GHz", boost:"4.7 GHz", igpu:"Iris Xe 80EU",       ram:"DDR4/5",             cache:"18 MB",  best:"Coding, creation, light gaming",    avoid:"Thin chassis",                   notes:"Major leap over U-series. Usually paired with dGPU.", tag:"best" },
  { id:"i5-13420h",   name:"i5-13420H",      brand:"intel", family:"Core i5",    gen:"13th Gen",          suffix:"H",  tdp:"45 W",     cores:"4P+4E",     threads:"12", base:"2.0 GHz", boost:"4.6 GHz", igpu:"UHD 64EU",           ram:"DDR4/5",             cache:"12 MB",  best:"Gaming laptops with dGPU",          avoid:"iGPU workloads",                 notes:"Budget H-series. Fewer E-cores and weaker iGPU than 13500H.", tag:"warn" },
  { id:"i7-1355u",    name:"i7-1355U",       brand:"intel", family:"Core i7",    gen:"13th Gen",          suffix:"U",  tdp:"15 W",     cores:"2P+8E",     threads:"12", base:"1.7 GHz", boost:"5.0 GHz", igpu:"Iris Xe 96EU",       ram:"DDR4/5, LPDDR5",     cache:"12 MB",  best:"Thin laptops, battery priority",    avoid:"Expecting H-class performance",  notes:"Barely faster than i5-1335U at same TDP. Overpriced tier.", tag:"warn" },
  { id:"i7-1365u",    name:"i7-1365U",       brand:"intel", family:"Core i7",    gen:"13th Gen",          suffix:"U",  tdp:"15–28 W",  cores:"2P+8E",     threads:"12", base:"1.8 GHz", boost:"5.2 GHz", igpu:"Iris Xe 96EU",       ram:"DDR4/5, LPDDR5",     cache:"12 MB",  best:"Premium ultrabooks",                avoid:"Sustained heavy loads",          notes:"Best U-series i7. 28W burst adds snappiness." },
  { id:"i7-13700h",   name:"i7-13700H",      brand:"intel", family:"Core i7",    gen:"13th Gen",          suffix:"H",  tdp:"45 W",     cores:"6P+8E",     threads:"20", base:"2.4 GHz", boost:"5.0 GHz", igpu:"Iris Xe 96EU",       ram:"DDR4/5",             cache:"24 MB",  best:"Video editing, 3D, development",    avoid:"Thin chassis",                   notes:"Real i7 — 20 threads + Quick Sync. Pairs with RTX 4060+.", tag:"best" },
  { id:"i7-13620h",   name:"i7-13620H",      brand:"intel", family:"Core i7",    gen:"13th Gen",          suffix:"H",  tdp:"45 W",     cores:"6P+4E",     threads:"16", base:"2.4 GHz", boost:"4.9 GHz", igpu:"UHD 64EU",           ram:"DDR4/5",             cache:"18 MB",  best:"Gaming laptops",                    avoid:"iGPU work",                      notes:"Budget H i7. Less E-cores and weaker iGPU than 13700H." },
  { id:"i9-13900h",   name:"i9-13900H",      brand:"intel", family:"Core i9",    gen:"13th Gen",          suffix:"H",  tdp:"45 W",     cores:"6P+8E",     threads:"20", base:"2.6 GHz", boost:"5.4 GHz", igpu:"Iris Xe 96EU",       ram:"DDR4/5",             cache:"24 MB",  best:"4K editing, game dev, 3D",          avoid:"Thin or budget chassis",         notes:"Top H-series. Pairs with RTX 4070/4080. Needs large chassis.", tag:"best" },
  { id:"i9-13980hx",  name:"i9-13980HX",     brand:"intel", family:"Core i9",    gen:"13th Gen",          suffix:"HX", tdp:"55–157 W", cores:"8P+16E",    threads:"32", base:"2.2 GHz", boost:"5.6 GHz", igpu:"UHD 32EU",           ram:"DDR5 (upgradeable)", cache:"36 MB",  best:"Workstations, VFX, simulation",     avoid:"Battery, thin laptops",          notes:"Desktop chip in a laptop. Upgradeable RAM. Only in 2 kg+ machines.", tag:"best" },
  { id:"ultra5-125h", name:"Ultra 5 125H",   brand:"intel", family:"Core Ultra", gen:"Meteor Lake",       suffix:"H",  tdp:"28–45 W",  cores:"4P+8E+2LPE",threads:"14", base:"1.2 GHz", boost:"4.5 GHz", igpu:"Arc 8 Xe-cores",     ram:"DDR5, LPDDR5",       cache:"18 MB",  best:"Light gaming, AI features",         avoid:"Heavy sustained workloads",      notes:"First Ultra with real Arc iGPU. NPU handles AI features." },
  { id:"ultra7-155h", name:"Ultra 7 155H",   brand:"intel", family:"Core Ultra", gen:"Meteor Lake",       suffix:"H",  tdp:"28–45 W",  cores:"6P+8E+2LPE",threads:"16", base:"1.4 GHz", boost:"4.8 GHz", igpu:"Arc 8 Xe-cores",     ram:"DDR5, LPDDR5",       cache:"24 MB",  best:"Premium thin laptops, light gaming",avoid:"Replacing H-series gaming chip",  notes:"Best mainstream Ultra. Arc plays older titles at 1080p low.", tag:"best" },
  { id:"ultra9-185h", name:"Ultra 9 185H",   brand:"intel", family:"Core Ultra", gen:"Meteor Lake",       suffix:"H",  tdp:"45 W",     cores:"6P+8E+2LPE",threads:"16", base:"2.3 GHz", boost:"5.1 GHz", igpu:"Arc 8 Xe-cores",     ram:"DDR5, LPDDR5",       cache:"24 MB",  best:"Top-tier thin, content creation",   avoid:"Marginal vs Ultra 7 in most tasks",notes:"Fastest Meteor Lake. Small gain over Ultra 7 155H.", tag:"best" },
  { id:"ultra5-226v", name:"Ultra 5 226V",   brand:"intel", family:"Core Ultra", gen:"Lunar Lake",        suffix:"V",  tdp:"17 W",     cores:"4P+4E",     threads:"8",  base:"2.1 GHz", boost:"4.5 GHz", igpu:"Arc 140V 8 Xe2",     ram:"LPDDR5X (soldered)", cache:"12 MB",  best:"Ultra-portable, all-day battery",   avoid:"If you need upgradeable RAM",    notes:"V-series = extreme efficiency. RAM soldered on chip." },
  { id:"ultra7-258v", name:"Ultra 7 258V",   brand:"intel", family:"Core Ultra", gen:"Lunar Lake",        suffix:"V",  tdp:"17 W",     cores:"4P+4E",     threads:"8",  base:"2.2 GHz", boost:"4.8 GHz", igpu:"Arc 140V 8 Xe2",     ram:"LPDDR5X (soldered)", cache:"12 MB",  best:"Premium ultrabook, battery rival to M3",avoid:"Power users needing >17W TDP",  notes:"Best thin Intel. Battery life rivals Apple M3.", tag:"best" },
];

const AMD: Chip[] = [
  { id:"r3-7320u",    name:"Ryzen 3 7320U",  brand:"amd", family:"Ryzen 3",  gen:"7000 (Zen 2 rebadged)",    suffix:"U",  tdp:"15 W",    cores:"4",    threads:"8",  base:"2.4 GHz", boost:"4.1 GHz", igpu:"Radeon 610M RDNA2 2CU",  ram:"LPDDR5X (soldered)", cache:"6 MB",  best:"Basic office only",                  avoid:"GPU tasks, gaming, RAM upgrades",  notes:"Misleading. RDNA2 GPU + soldered RAM despite '7000' branding.", tag:"warn" },
  { id:"r3-7330u",    name:"Ryzen 3 7330U",  brand:"amd", family:"Ryzen 3",  gen:"7000 (Zen 3 rebadged)",    suffix:"U",  tdp:"15 W",    cores:"4",    threads:"8",  base:"2.3 GHz", boost:"4.3 GHz", igpu:"Radeon Vega 6",          ram:"DDR4/LPDDR4",        cache:"8 MB",  best:"Budget office tasks",                avoid:"Modern GPU workloads",             notes:"Zen 3 rebadged as 7000. Older architecture than it appears.", tag:"warn" },
  { id:"r5-7530u",    name:"Ryzen 5 7530U",  brand:"amd", family:"Ryzen 5",  gen:"7000 (Zen 3 refresh)",     suffix:"U",  tdp:"15 W",    cores:"6",    threads:"12", base:"2.0 GHz", boost:"4.5 GHz", igpu:"Radeon Vega 7",          ram:"DDR4/LPDDR4",        cache:"16 MB", best:"Office, coding, light multitasking", avoid:"Expecting RDNA3 — it's Vega",     notes:"Good value if priced right. Zen 3 despite '7000' name." },
  { id:"r5-7535hs",   name:"Ryzen 5 7535HS", brand:"amd", family:"Ryzen 5",  gen:"7000 (Zen 4)",             suffix:"HS", tdp:"35 W",    cores:"6",    threads:"12", base:"3.3 GHz", boost:"4.55 GHz",igpu:"Radeon 660M RDNA2 6CU",  ram:"DDR5/LPDDR5",        cache:"16 MB", best:"Coding, gaming laptops with dGPU",   avoid:"iGPU gaming — RDNA2 not RDNA3",  notes:"Real Zen 4 at 35W sweet spot. Common in mid-range gaming laptops." },
  { id:"r5-7640u",    name:"Ryzen 5 7640U",  brand:"amd", family:"Ryzen 5",  gen:"7000 (Zen 4)",             suffix:"U",  tdp:"15–28 W", cores:"6",    threads:"12", base:"3.5 GHz", boost:"4.9 GHz", igpu:"Radeon 760M RDNA3 8CU",  ram:"DDR5/LPDDR5",        cache:"16 MB", best:"All-rounder, light gaming no dGPU",  avoid:"Heavy sustained workloads",       notes:"Mid-range king. RDNA3 GPU runs CS2/Fortnite at 1080p low.", tag:"best" },
  { id:"r7-7735hs",   name:"Ryzen 7 7735HS", brand:"amd", family:"Ryzen 7",  gen:"7000 (Zen 3 rebadged)",    suffix:"HS", tdp:"35 W",    cores:"8",    threads:"16", base:"3.2 GHz", boost:"4.75 GHz",igpu:"Radeon 680M RDNA2 12CU", ram:"DDR5/LPDDR5",        cache:"16 MB", best:"Multitasking, gaming with dGPU",     avoid:"Expecting Zen 4 — it's Zen 3",    notes:"Often overpriced. 680M is RDNA2 despite 7000 branding.", tag:"warn" },
  { id:"r7-7745hx",   name:"Ryzen 7 7745HX", brand:"amd", family:"Ryzen 7",  gen:"7000 Dragon Range (Zen 4)",suffix:"HX", tdp:"55 W",    cores:"8",    threads:"16", base:"3.6 GHz", boost:"5.1 GHz", igpu:"Radeon 610M RDNA2 2CU",  ram:"DDR5",               cache:"32 MB", best:"Gaming + heavy workloads",            avoid:"Without dGPU — stripped iGPU",    notes:"Desktop-class Zen 4. Massive cache. Always paired with dGPU." },
  { id:"r7-8845hs",   name:"Ryzen 7 8845HS", brand:"amd", family:"Ryzen 7",  gen:"8000 Hawk Point",          suffix:"HS", tdp:"35–54 W", cores:"8",    threads:"16", base:"3.8 GHz", boost:"5.1 GHz", igpu:"Radeon 780M RDNA3 12CU", ram:"DDR5/LPDDR5",        cache:"16 MB", best:"Best iGPU gaming, creation, AI",     avoid:"Nothing — excellent all-round",   notes:"Best laptop iGPU. Handles GTA V, Cyberpunk low at 1080p.", tag:"best" },
  { id:"r9-7940hs",   name:"Ryzen 9 7940HS", brand:"amd", family:"Ryzen 9",  gen:"7000 (Zen 4)",             suffix:"HS", tdp:"35–54 W", cores:"8",    threads:"16", base:"4.0 GHz", boost:"5.2 GHz", igpu:"Radeon 780M RDNA3 12CU", ram:"DDR5/LPDDR5",        cache:"16 MB", best:"Premium thin-and-light, high clocks",avoid:"Paying over 8845HS for most tasks",notes:"Zen 4 at high clocks. Same 780M GPU as 8845HS.", tag:"best" },
  { id:"r9-7945hx",   name:"Ryzen 9 7945HX", brand:"amd", family:"Ryzen 9",  gen:"7000 Dragon Range (Zen 4)",suffix:"HX", tdp:"55–75 W", cores:"16",   threads:"32", base:"2.5 GHz", boost:"5.4 GHz", igpu:"Radeon 610M RDNA2 2CU",  ram:"DDR5",               cache:"64 MB", best:"Compiling, Blender, simulation",     avoid:"Without dGPU. Needs large chassis",notes:"16 cores on a laptop. 64 MB cache. Dominates multi-core.", tag:"best" },
  { id:"r9-8945hs",   name:"Ryzen 9 8945HS", brand:"amd", family:"Ryzen 9",  gen:"8000 Hawk Point",          suffix:"HS", tdp:"35–54 W", cores:"8",    threads:"16", base:"4.0 GHz", boost:"5.2 GHz", igpu:"Radeon 890M RDNA3.5 16CU",ram:"DDR5/LPDDR5",        cache:"16 MB", best:"Best slim iGPU + performance",       avoid:"HX-level workstation tasks",      notes:"890M approaches GTX 1650. Top slim AMD chip.", tag:"best" },
  { id:"ai5-360",     name:"Ryzen AI 5 360", brand:"amd", family:"Ryzen AI", gen:"Strix Point (Zen 5)",      suffix:"HX", tdp:"15–28 W", cores:"6",    threads:"12", base:"3.0 GHz", boost:"5.0 GHz", igpu:"Radeon 880M RDNA3.5 12CU",ram:"LPDDR5X",            cache:"16 MB", best:"Mid-range thin, AI, light gaming",   avoid:"Heavy sustained CPU loads",       notes:"Surprisingly capable. 880M outperforms most Intel iGPUs." },
  { id:"ai7-350",     name:"Ryzen AI 7 350", brand:"amd", family:"Ryzen AI", gen:"Strix Point (Zen 5)",      suffix:"HX", tdp:"15–28 W", cores:"8",    threads:"16", base:"3.0 GHz", boost:"5.1 GHz", igpu:"Radeon 890M RDNA3.5 16CU",ram:"LPDDR5X",            cache:"16 MB", best:"Premium thin, gaming without dGPU",  avoid:"HX workstation tasks",            notes:"890M approaches GTX 1650. 8 Zen 5 cores + 50 TOPS NPU.", tag:"best" },
  { id:"ai9-hx370",   name:"Ryzen AI 9 HX 370",brand:"amd",family:"Ryzen AI",gen:"Strix Point (Zen 5)",      suffix:"HX", tdp:"28–54 W", cores:"12",   threads:"24", base:"2.0 GHz", boost:"5.1 GHz", igpu:"Radeon 890M RDNA3.5 16CU",ram:"LPDDR5X",            cache:"24 MB", best:"Everything — best AMD laptop chip",  avoid:"Nothing",                         notes:"12 Zen 5 + best iGPU + 50 TOPS NPU. AMD's answer to M-series.", tag:"best" },
];

const INTEL_FAMILIES = ["Core i3","Core i5","Core i7","Core i9","Core Ultra"];
const AMD_FAMILIES   = ["Ryzen 3","Ryzen 5","Ryzen 7","Ryzen 9","Ryzen AI"];

const NAMING_INTEL = [
  { code:"i3 / i5 / i7 / i9",       meaning:"Tier — but old i7 can lose to new i5. Generation matters more." },
  { code:"13th / 14th Gen",          meaning:"14th is a minor refresh of 13th. Not a significant jump." },
  { code:"U suffix",                 meaning:"Ultra-low power 15–28W. Thin laptops. Better battery, slower." },
  { code:"H suffix",                 meaning:"High performance 35–45W. Significantly faster. Heavier laptops." },
  { code:"HX suffix",                meaning:"Extreme 55–115W. Desktop-class. Only in 2 kg+ machines." },
  { code:"P suffix",                 meaning:"Performance 28W. Between U and H. Common in business laptops." },
  { code:"N suffix",                 meaning:"Budget Atom-class. Very slow. Sub-₹35k laptops only." },
  { code:"Core Ultra Series 1",      meaning:"2024 rebrand. Ultra 5/7/9 = i5/i7/i9 tier. Adds Arc iGPU + NPU." },
  { code:"V suffix (Series 2)",      meaning:"Lunar Lake. Very efficient. RAM soldered onto chip — not upgradeable." },
  { code:"i7-1355U vs i5-13500H",    meaning:"i7-U loses to i5-H in real tasks. Suffix beats tier number." },
];
const NAMING_AMD = [
  { code:"Ryzen 3 / 5 / 7 / 9",     meaning:"Tier. Same caveat — generation and suffix matter more." },
  { code:"7xxx / 8xxx series",       meaning:"7000 = 2022/23. 8000 = 2023/24. But not all 7000 chips are Zen 4." },
  { code:"U suffix",                 meaning:"Ultra-low power 15–28W. Thin laptops." },
  { code:"HS suffix",                meaning:"High performance slim 35–45W. Best balance." },
  { code:"HX suffix",                meaning:"Extreme 55W+. Desktop-class. Large laptops only." },
  { code:"4th digit = GPU gen",      meaning:"7640U → '4' = RDNA3. 7530U → '3' = RDNA2. Higher = better iGPU." },
  { code:"7320U / 7330U warning",    meaning:"Despite '7000' branding, use Zen 2/3 and old GPU. Check architecture." },
  { code:"Ryzen AI (Strix Point)",   meaning:"2024. Zen 5 cores + RDNA3.5 GPU + 50 TOPS NPU. Major step up." },
  { code:"7735HS vs 7745HX",         meaning:"7735HS is Zen 3 repackaged. 7745HX is true Zen 4. Different chips." },
];

/* ═══════════════════════════════════════════════════
   FLOW LAYOUT BUILDER
═══════════════════════════════════════════════════ */
type NodeDef = { id:string; cx:number; cy:number; kind:"root"|"family"|"chip"; label:string; sub:string; chip?:Chip; tag?:string };
type EdgeDef = { x1:number; y1:number; x2:number; y2:number };

const R = { root:45, family:38, chip:31 };

function buildGraph(chips: Chip[], families: string[], brand: "intel"|"amd") {
  const nodes: NodeDef[] = [];
  const edges: EdgeDef[] = [];

  const RX = 120, RY = 500;
  nodes.push({ id:"root", cx:RX, cy:RY, kind:"root", label:brand==="intel"?"Intel":"AMD", sub:"" });

  const FAM_X = 300;
  const famChips = families.map(f => chips.filter(c=>c.family===f));
  const chipH = 92;
  const heights = famChips.map(g => Math.max(1,g.length)*chipH);
  const totalH = heights.reduce((a,b)=>a+b,0) + (families.length-1)*28;
  let curY = RY - totalH/2;

  families.forEach((fam, fi) => {
    const group = famChips[fi];
    const blockH = heights[fi];
    const fy = curY + blockH/2 - R.family;
    nodes.push({ id:`fam-${fi}`, cx:FAM_X, cy:fy, kind:"family", label:fam, sub:`${group.length}` });
    edges.push({ x1:RX+R.root, y1:RY, x2:FAM_X-R.family, y2:fy });

    const CHIP_X = 490;
    group.forEach((ch, ci) => {
      const cy = curY + ci*chipH + 40;
      nodes.push({ id:ch.id, cx:CHIP_X, cy, kind:"chip", label:ch.name, sub:ch.suffix, chip:ch, tag:ch.tag });
      edges.push({ x1:FAM_X+R.family, y1:fy, x2:CHIP_X-R.chip, y2:cy });
    });
    curY += blockH + 28;
  });

  const xs = nodes.map(n=>n.cx+R.root+60);
  const ys = nodes.map(n=>n.cy+R.root+60);
  return { nodes, edges, w: Math.max(...xs), h: Math.max(...ys) };
}

/* ═══════════════════════════════════════════════════
   FLOW VIEW
═══════════════════════════════════════════════════ */
function FlowView({ chips, families, brand, compareList, onChipClick }: {
  chips: Chip[]; families: string[]; brand: "intel"|"amd";
  compareList: string[]; onChipClick: (c: Chip) => void;
}) {
  const { nodes, edges, w, h } = buildGraph(chips, families, brand);
  const [pan, setPan] = useState({ x: 40, y: 0 });
  const [scale, setScale] = useState(1);
  const drag = useRef({ active:false, sx:0, sy:0, ox:0, oy:0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  const onDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".node")) return;
    drag.current = { active:true, sx:e.clientX, sy:e.clientY, ox:pan.x, oy:pan.y };
  };
  const onMove = useCallback((e: MouseEvent) => {
    if (!drag.current.active) return;
    setPan({ x: drag.current.ox+(e.clientX-drag.current.sx), y: drag.current.oy+(e.clientY-drag.current.sy) });
  },[]);
  const onUp = useCallback(()=>{ drag.current.active=false; },[]);
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(1.8, Math.max(0.4, s - e.deltaY*0.001)));
  },[]);

  useEffect(()=>{
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    const el = wrapRef.current;
    if (el) el.addEventListener("wheel", onWheel, { passive:false });
    return ()=>{
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (el) el.removeEventListener("wheel", onWheel);
    };
  },[onMove, onUp, onWheel]);

  const color = brand==="intel" ? "var(--intel)" : "var(--amd)";
  const edgeColor = brand==="intel" ? "rgba(74,158,255,0.2)" : "rgba(255,90,90,0.2)";

  return (
    <div ref={wrapRef} className="canvas-wrap" onMouseDown={onDown} style={{ overflow:"hidden", position:"relative", flex:1 }}>
      <div className="dot-grid" />
      <div className="canvas-drag" style={{ transform:`translate(${pan.x}px,${pan.y}px) scale(${scale})`, width:w, height:h, position:"absolute" }}>
        {/* SVG edges */}
        <svg style={{ position:"absolute", inset:0, overflow:"visible", pointerEvents:"none" }} width={w} height={h}>
          {edges.map((e,i) => (
            <path key={i}
              d={`M${e.x1},${e.y1} C${(e.x1*0.4+e.x2*0.6)},${e.y1} ${(e.x1*0.2+e.x2*0.8)},${e.y2} ${e.x2},${e.y2}`}
              stroke={edgeColor} strokeWidth="1.5" fill="none"
            />
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map(n => {
          const r = R[n.kind];
          const isSelected = n.chip && compareList.includes(n.chip.id);
          const isRoot = n.kind==="root";
          const isFamily = n.kind==="family";
          const isChip = n.kind==="chip";

          return (
            <div key={n.id} className="node"
              style={{
                left: n.cx-r, top: n.cy-r,
                width: r*2, height: r*2,
                borderRadius:"50%",
                background: isRoot ? color :
                             isFamily ? (brand==="intel"?"rgba(74,158,255,0.1)":"rgba(255,90,90,0.1)") :
                             isSelected ? (brand==="intel"?"rgba(74,158,255,0.18)":"rgba(255,90,90,0.18)") :
                             "var(--surface2)",
                border: `${isRoot?2.5:1.5}px solid ${
                  isRoot ? color :
                  isFamily ? (brand==="intel"?"rgba(74,158,255,0.35)":"rgba(255,90,90,0.35)") :
                  isSelected ? color :
                  "rgba(255,255,255,0.1)"
                }`,
                boxShadow: isRoot ? `0 0 28px ${brand==="intel"?"rgba(74,158,255,0.35)":"rgba(255,90,90,0.35)"}` :
                           isSelected ? `0 0 0 3px ${brand==="intel"?"rgba(74,158,255,0.3)":"rgba(255,90,90,0.3)"}` : "none",
                cursor: isChip ? "pointer" : "default",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                textAlign:"center", gap:2,
                transition:"transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s",
                position:"absolute",
              }}
              onClick={() => { if(n.chip) onChipClick(n.chip); }}
            >
              {isRoot && <span style={{ fontSize:13, fontWeight:800, color:"#fff" }}>{n.label}</span>}
              {isFamily && <><span style={{ fontSize:10.5, fontWeight:700, color, lineHeight:1.2, padding:"0 4px" }}>{n.label}</span><span style={{ fontSize:8, color:"var(--muted)" }}>{n.sub} chips</span></>}
              {isChip && (
                <>
                  <span style={{ fontSize:8.5, fontWeight:700, color: isSelected ? color : "var(--text)", lineHeight:1.15, padding:"0 5px" }}>{n.label}</span>
                  <span style={{ fontSize:7.5, color:"var(--text2)" }}>{n.chip?.suffix}</span>
                  {n.tag && <span style={{ width:5, height:5, borderRadius:"50%", background: n.tag==="best"?"#4ade80":"#f59e0b", marginTop:1 }}/>}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ position:"absolute", bottom:20, left:20, display:"flex", flexDirection:"column", gap:6, pointerEvents:"none" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"var(--muted)" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", display:"inline-block" }}/>Recommended
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:"var(--muted)" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b", display:"inline-block" }}/>Check before buying
        </div>
        <div style={{ fontSize:10, color:"var(--muted)", marginTop:4 }}>Scroll to zoom · Drag to pan</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DETAIL PANEL
═══════════════════════════════════════════════════ */
function Panel({ chip, compareList, onToggleCompare, onClose }: {
  chip: Chip|null; compareList: string[];
  onToggleCompare: (c:Chip)=>void; onClose: ()=>void;
}) {
  const brand = chip?.brand ?? "intel";
  const inCompare = chip ? compareList.includes(chip.id) : false;
  const c = brand==="intel" ? "var(--intel)" : "var(--amd)";

  return (
    <div className="panel-overlay">
      <div className={`panel ${chip?"open":""}`}>
        {chip && (
          <>
            <div className="panel-head">
              <button className="panel-close" onClick={onClose}>✕</button>
              <div className="panel-brand" style={{ color:c }}>{brand.toUpperCase()} · {chip.family}</div>
              <div className="panel-chipname">{chip.name}</div>
              <div className="panel-gen">{chip.gen} · {chip.suffix}-series · {chip.tdp}</div>
            </div>
            <div className="panel-body fade-up">
              <div className={`notes-box ${brand}`}>{chip.notes}</div>

              <div className="section-label" style={{ marginBottom:8 }}>Specs</div>
              <div className="spec-grid" style={{ marginBottom:16 }}>
                {[
                  ["Cores",       chip.cores],
                  ["Threads",     chip.threads],
                  ["Base Clock",  chip.base],
                  ["Boost Clock", chip.boost],
                  ["Cache",       chip.cache],
                  ["TDP",         chip.tdp],
                ].map(([k,v])=>(
                  <div key={k} className="spec-row">
                    <span className="spec-key">{k}</span>
                    <span className="spec-val" style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="section-label" style={{ marginBottom:8 }}>Platform</div>
              <div className="spec-grid" style={{ marginBottom:16 }}>
                {[
                  ["iGPU",       chip.igpu],
                  ["RAM",        chip.ram],
                ].map(([k,v])=>(
                  <div key={k} className="spec-row">
                    <span className="spec-key">{k}</span>
                    <span className="spec-val">{v}</span>
                  </div>
                ))}
              </div>

              <div className="verdict-row" style={{ marginBottom:16 }}>
                <div className="verdict-item">
                  <div className="verdict-item-label">Best for</div>
                  <div className="verdict-item-val">{chip.best}</div>
                </div>
                <div className="verdict-item">
                  <div className="verdict-item-label">Avoid if</div>
                  <div className="verdict-item-val">{chip.avoid}</div>
                </div>
              </div>

              <button className={`add-compare-btn ${inCompare?"in":""}`} onClick={()=>onToggleCompare(chip)}>
                {inCompare ? "✓  In comparison" : "+ Add to Compare"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BOTTOM BAR
═══════════════════════════════════════════════════ */
function BottomBar({ list, all, onRemove, onCompare }: {
  list:string[]; all:Chip[]; onRemove:(id:string)=>void; onCompare:()=>void;
}) {
  const chips = list.map(id=>all.find(c=>c.id===id)).filter(Boolean) as Chip[];
  return (
    <div className={`bottom-bar ${chips.length>0?"show":""}`}>
      <span className="bar-label">Compare</span>
      <div className="bar-chips">
        {chips.map(c=>(
          <div key={c.id} className="bar-chip">
            <span className="bar-chip-dot" style={{ background:c.brand==="intel"?"var(--intel)":"var(--amd)" }}/>
            {c.name}
            <span className="bar-chip-x" onClick={()=>onRemove(c.id)}>×</span>
          </div>
        ))}
      </div>
      <button className="bar-go" disabled={chips.length<2} onClick={onCompare}>
        Compare →
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPARE TABLE
═══════════════════════════════════════════════════ */
const ROWS: {key:keyof Chip; label:string; mono?:boolean}[] = [
  { key:"gen",     label:"Generation"    },
  { key:"suffix",  label:"Suffix"        },
  { key:"tdp",     label:"TDP",  mono:true },
  { key:"cores",   label:"Cores", mono:true},
  { key:"threads", label:"Threads",mono:true},
  { key:"base",    label:"Base Clock",mono:true},
  { key:"boost",   label:"Boost Clock",mono:true},
  { key:"igpu",    label:"iGPU"          },
  { key:"ram",     label:"RAM Support"   },
  { key:"cache",   label:"Cache", mono:true},
  { key:"best",    label:"Best For"      },
  { key:"avoid",   label:"Avoid If"      },
];

function CompareTable({ ids, all, onBack }: { ids:string[]; all:Chip[]; onBack:()=>void }) {
  const chips = ids.map(id=>all.find(c=>c.id===id)).filter(Boolean) as Chip[];
  return (
    <div style={{ flex:1, overflow:"auto" }}>
      <div style={{ padding:"36px 48px 100px", maxWidth:960, margin:"0 auto" }}>
        <div className="compare-back">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <span className="compare-title">Comparison</span>
          <span style={{ fontSize:12, color:"var(--muted)", marginLeft:8 }}>{chips.length} chips</span>
        </div>
        <table className="ctable">
          <thead>
            <tr>
              <th style={{ width:130 }}></th>
              {chips.map(c=>(
                <th key={c.id} className="chip-head">
                  <div style={{ color: c.brand==="intel"?"var(--intel)":"var(--amd)" }}>{c.name}</div>
                  <div style={{ fontSize:11, color:"var(--muted)", fontWeight:400, marginTop:3 }}>{c.gen}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row=>(
              <tr key={row.key}>
                <td className="row-key">{row.label}</td>
                {chips.map(c=>(
                  <td key={c.id} className={row.mono?"mono-val":""}>
                    {String(c[row.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NAMING PAGE
═══════════════════════════════════════════════════ */
function NamingPage() {
  return (
    <div className="naming-page">
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        {[
          { brand:"intel" as const, title:"Intel Naming", rows:NAMING_INTEL },
          { brand:"amd"   as const, title:"AMD Naming",   rows:NAMING_AMD   },
        ].map(({ brand, title, rows }) => (
          <div key={brand} className="naming-card">
            <div className="naming-card-head">
              <span className={`brand-pill ${brand}`}>{brand.toUpperCase()}</span>
              <span>{title}</span>
            </div>
            {rows.map((r,i)=>(
              <div key={i} className="naming-row">
                <span className="naming-code">{r.code}</span>
                <span className="naming-meaning">{r.meaning}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="warn-box">
          <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
          <span className="warn-box-text">
            <strong>Suffix beats tier.</strong> An <strong>i7-1355U</strong> (15W) loses to <strong>i5-13500H</strong> (45W) in real tasks. An <strong>Ryzen 7 7735U</strong> loses to <strong>Ryzen 5 7535HS</strong>. Always check the suffix.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════ */
type Tab = "intel"|"amd"|"naming"|"compare";
const ALL = [...INTEL, ...AMD];

export default function App() {
  const [tab, setTab] = useState<Tab>("intel");
  const [panel, setPanel] = useState<Chip|null>(null);
  const [compare, setCompare] = useState<string[]>([]);

  const toggleCompare = (c: Chip) =>
    setCompare(p => p.includes(c.id) ? p.filter(x=>x!==c.id) : p.length<4 ? [...p, c.id] : p);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>

      {/* Header */}
      <header className="header">
        <div className="header-logo">CPU Guide <span>/ Laptops</span></div>
        <button className={`tab ${tab==="intel"?"active-intel":""}`} onClick={()=>setTab("intel")}>Intel</button>
        <button className={`tab ${tab==="amd"?"active-amd":""}`}     onClick={()=>setTab("amd")}>AMD</button>
        <button className={`tab ${tab==="naming"?"active":""}`}       onClick={()=>setTab("naming")}>Naming Guide</button>
        {compare.length>0 && (
          <button className="compare-badge" onClick={()=>setTab("compare")}>
            Compare · {compare.length}
          </button>
        )}
      </header>

      {/* Body */}
      <div style={{ flex:1, overflow:"hidden", display:"flex", position:"relative" }}>
        {tab==="intel"  && <FlowView chips={INTEL} families={INTEL_FAMILIES} brand="intel" compareList={compare} onChipClick={setPanel} />}
        {tab==="amd"    && <FlowView chips={AMD}   families={AMD_FAMILIES}   brand="amd"   compareList={compare} onChipClick={setPanel} />}
        {tab==="naming" && <NamingPage />}
        {tab==="compare"&& <CompareTable ids={compare} all={ALL} onBack={()=>setTab("intel")} />}

        <Panel chip={panel} compareList={compare} onToggleCompare={toggleCompare} onClose={()=>setPanel(null)} />
      </div>

      <BottomBar list={compare} all={ALL} onRemove={id=>setCompare(p=>p.filter(x=>x!==id))} onCompare={()=>setTab("compare")} />
    </div>
  );
}
