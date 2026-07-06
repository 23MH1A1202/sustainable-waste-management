import { ScanHistoryItem } from "../types";
import { Check, ShieldAlert, Award, Recycle, Trash2, HelpCircle } from "lucide-react";

interface DashboardChartsProps {
  history: ScanHistoryItem[];
}

export default function DashboardCharts({ history }: DashboardChartsProps) {
  // Aggregate stats based on history
  // If history is empty, seed it with mock baseline data so the dashboard is interactive and filled instantly
  const activeHistory = history.length > 0 ? history : getSeedHistory();

  const totalScans = activeHistory.length;
  const recyclableCount = activeHistory.filter((item) => item.recyclable).length;
  const recyclingRate = totalScans > 0 ? Math.round((recyclableCount / totalScans) * 100) : 0;
  const hazardousCount = activeHistory.filter((item) => item.category.toLowerCase() === "hazardous" || item.category.toLowerCase() === "e-waste").length;
  const carbonDiverted = totalScans * 0.45; // 0.45 kg of CO2 saved per recycled/properly composted item on average

  // 1. Category Breakdown
  const categoriesMap: Record<string, number> = {
    Plastic: 0,
    Paper: 0,
    Glass: 0,
    Metal: 0,
    Organic: 0,
    "E-waste": 0,
    Hazardous: 0,
    Landfill: 0,
  };

  activeHistory.forEach((item) => {
    let cat = item.category;
    if (cat.toLowerCase() === "compostable") cat = "Organic";
    if (categoriesMap[cat] !== undefined) {
      categoriesMap[cat]++;
    } else {
      categoriesMap["Landfill"]++;
    }
  });

  const categoryData = Object.entries(categoriesMap).map(([name, count]) => ({
    name,
    count,
    color: getCategoryColor(name),
  }));

  const maxCategoryCount = Math.max(...categoryData.map((d) => d.count), 1);

  // 2. 7-day Scan Frequency
  // Group scans by date
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const frequencyData = last7Days.map((date) => {
    const count = activeHistory.filter((item) => item.timestamp.startsWith(date)).length;
    const label = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
    return { date, label, count };
  });

  const maxFrequencyCount = Math.max(...frequencyData.map((d) => d.count), 1);

  // 3. Recyclable vs Non-recyclable (Doughnut parameters)
  const nonRecyclableCount = totalScans - recyclableCount;
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const recyclableDash = (recyclableCount / totalScans) * circumference;
  const nonRecyclableDash = circumference - recyclableDash;

  return (
    <div className="space-y-6">
      {/* 4 Cards Summary Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Scans</span>
            <span className="font-bold text-slate-900 text-2xl md:text-3xl tracking-tight">{totalScans}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recycling Rate</span>
            <span className="font-bold text-slate-900 text-2xl md:text-3xl tracking-tight">{recyclingRate}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hazard Items</span>
            <span className="font-bold text-slate-900 text-2xl md:text-3xl tracking-tight">{hazardousCount}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm transition-all hover:border-slate-300">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO₂ Diverted</span>
            <span className="font-bold text-slate-900 text-2xl md:text-3xl tracking-tight">{carbonDiverted.toFixed(2)} kg</span>
          </div>
        </div>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Doughnut recyclability */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-slate-900 text-base mb-1 tracking-tight">Recycling Ratio</h4>
            <p className="text-slate-500 text-xs mb-4">Breakdown of recyclable vs non-recyclable materials scanned.</p>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-40 h-40">
              {/* SVG Doughnut */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                {/* Non-Recyclable portion */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#94a3b8" // Slate
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={0}
                />
                {/* Recyclable portion */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#22c55e" // Green
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={nonRecyclableDash}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{recyclingRate}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Recyclable</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-8 w-full text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-700 font-medium">Recyclable ({recyclableCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-400" />
                <span className="text-slate-700 font-medium">Non-Recyclable ({nonRecyclableCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Category Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-900 text-base mb-1 tracking-tight">Waste Streams Profile</h4>
          <p className="text-slate-500 text-xs mb-6">Volume distribution across standardized categories.</p>

          <div className="space-y-4 py-2">
            {categoryData.map((data, idx) => {
              const pct = (data.count / maxCategoryCount) * 100;
              return (
                <div key={idx} className="flex items-center text-xs">
                  <div className="w-20 text-slate-700 font-medium truncate">{data.name}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-3 relative">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: data.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <div className="w-6 text-right font-semibold text-slate-900">{data.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Weekly scan frequency Area Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-slate-900 text-base mb-1 tracking-tight">7-Day Scan Activity</h4>
            <p className="text-slate-500 text-xs mb-6">Frequency and velocity tracking of daily item scanning.</p>
          </div>

          <div className="py-2">
            {/* SVG Area Chart */}
            <div className="w-full h-36">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* X-axis helper grids */}
                <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />

                {/* Draw Smooth Path */}
                {(() => {
                  const points = frequencyData.map((data, idx) => {
                    const x = (idx / 6) * 300;
                    const y = 100 - (data.count / maxFrequencyCount) * 80;
                    return { x, y };
                  });

                  const pathD = points.reduce((acc, p, i) => {
                    return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
                  }, "");

                  const areaD = pathD + ` L 300 100 L 0 100 Z`;

                  return (
                    <>
                      {/* Filled Gradient Area */}
                      <path d={areaD} fill="url(#areaGrad)" />
                      {/* Line Path */}
                      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" />
                      {/* Dots */}
                      {points.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="white"
                          stroke="#10b981"
                          strokeWidth="2"
                          className="hover:scale-125 transition-transform cursor-pointer"
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-3">
              {frequencyData.map((d, idx) => (
                <span key={idx}>{d.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility to get nice specific colors matching waste streams
function getCategoryColor(cat: string): string {
  switch (cat.toLowerCase()) {
    case "plastic":
      return "#3b82f6"; // Blue
    case "paper":
      return "#60a5fa"; // Sky Blue
    case "glass":
      return "#06b6d4"; // Cyan
    case "metal":
      return "#64748b"; // Slate Gray
    case "organic":
    case "compostable":
      return "#10b981"; // Emerald Green
    case "e-waste":
      return "#f59e0b"; // Amber Yellow
    case "hazardous":
      return "#ef4444"; // Rose Red
    default:
      return "#cbd5e1"; // Light Slate for landfill
  }
}

// Generates high quality pre-populated seed history for immediate, stunning college dashboard visual renders!
function getSeedHistory(): ScanHistoryItem[] {
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });

  return [
    {
      id: "seed-1",
      timestamp: `${dates[0]}T10:15:00Z`,
      itemName: "Plastic Water Bottle",
      category: "Plastic",
      recyclable: true,
      analysis: {
        itemName: "Plastic Water Bottle",
        category: "Plastic",
        recyclable: true,
        disposalSteps: [],
        hazardWarning: "",
        recyclingInstructions: [],
        ecoSuggestions: [],
        acceptedFacility: ""
      }
    },
    {
      id: "seed-2",
      timestamp: `${dates[0]}T14:22:00Z`,
      itemName: "Alkaline AA Battery",
      category: "Hazardous",
      recyclable: false,
      analysis: {
        itemName: "Alkaline AA Battery",
        category: "Hazardous",
        recyclable: false,
        disposalSteps: [],
        hazardWarning: "Heavy Metals",
        recyclingInstructions: [],
        ecoSuggestions: [],
        acceptedFacility: ""
      }
    },
    {
      id: "seed-3",
      timestamp: `${dates[1]}T09:05:00Z`,
      itemName: "Corrugated Cardboard Box",
      category: "Paper",
      recyclable: true,
      analysis: {
        itemName: "Corrugated Cardboard Box",
        category: "Paper",
        recyclable: true,
        disposalSteps: [],
        hazardWarning: "",
        recyclingInstructions: [],
        ecoSuggestions: [],
        acceptedFacility: ""
      }
    },
    {
      id: "seed-4",
      timestamp: `${dates[2]}T11:40:00Z`,
      itemName: "Apple Core & Coffee Grounds",
      category: "Organic",
      recyclable: true,
      analysis: {
        itemName: "Apple Core & Coffee Grounds",
        category: "Organic",
        recyclable: true,
        disposalSteps: [],
        hazardWarning: "",
        recyclingInstructions: [],
        ecoSuggestions: [],
        acceptedFacility: ""
      }
    },
    {
      id: "seed-5",
      timestamp: `${dates[3]}T16:50:00Z`,
      itemName: "Fluorescent Tube Lamp",
      category: "Hazardous",
      recyclable: false,
      analysis: {
        itemName: "Fluorescent Tube Lamp",
        category: "Hazardous",
        recyclable: false,
        disposalSteps: [],
        hazardWarning: "Mercury Vapor",
        recyclingInstructions: [],
        ecoSuggestions: [],
        acceptedFacility: ""
      }
    },
    {
      id: "seed-6",
      timestamp: `${dates[4]}T08:30:00Z`,
      itemName: "Broken Glass Coffee Pot",
      category: "Glass",
      recyclable: true,
      analysis: {
        itemName: "Broken Glass Coffee Pot",
        category: "Glass",
        recyclable: true,
        disposalSteps: [],
        hazardWarning: "",
        recyclingInstructions: [],
        ecoSuggestions: [],
        acceptedFacility: ""
      }
    },
    {
      id: "seed-7",
      timestamp: `${dates[5]}T13:10:00Z`,
      itemName: "Old Broken Computer Keyboard",
      category: "E-waste",
      recyclable: true,
      analysis: {
        itemName: "Old Broken Computer Keyboard",
        category: "E-waste",
        recyclable: true,
        disposalSteps: [],
        hazardWarning: "Flame retardants",
        recyclingInstructions: [],
        ecoSuggestions: [],
        acceptedFacility: ""
      }
    },
    {
      id: "seed-8",
      timestamp: `${dates[6]}T15:45:00Z`,
      itemName: "Empty Aluminum Cola Can",
      category: "Metal",
      recyclable: true,
      analysis: {
        itemName: "Empty Aluminum Cola Can",
        category: "Metal",
        recyclable: true,
        disposalSteps: [],
        hazardWarning: "",
        recyclingInstructions: [],
        ecoSuggestions: [],
        acceptedFacility: ""
      }
    }
  ];
}
