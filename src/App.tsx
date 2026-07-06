import { useState, useEffect } from "react";
import { WasteAnalysis, ScanHistoryItem } from "./types";
import { SAMPLE_CENTERS } from "./data/centers";

import ScannerSection from "./components/ScannerSection";
import MapContainer from "./components/MapContainer";
import DashboardCharts from "./components/DashboardCharts";
import HistorySection from "./components/HistorySection";
import { Recycle, Navigation, BarChart3, History, Globe, Leaf, Compass, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "scanner" | "map" | "logs">("dashboard");
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wasteguide_scan_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing scan history", e);
      }
    } else {
      // Seed initial history if empty so charts are immediately populated and visual!
      const defaultHistory = getSeedHistory();
      setHistory(defaultHistory);
      localStorage.setItem("wasteguide_scan_history", JSON.stringify(defaultHistory));
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: ScanHistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("wasteguide_scan_history", JSON.stringify(newHistory));
  };

  // Add scan to history on success
  const handleScanSuccess = (analysis: WasteAnalysis) => {
    const newItem: ScanHistoryItem = {
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      itemName: analysis.itemName,
      category: analysis.category,
      recyclable: analysis.recyclable,
      analysis: analysis,
    };
    const updated = [newItem, ...history];
    saveHistory(updated);
  };

  // Delete individual item
  const handleDeleteItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  // Clear entire history
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete all scanned logs? This action is irreversible.")) {
      saveHistory([]);
    }
  };

  // Switch to Map tab and filter appropriately
  const handleViewOnMap = (category: string) => {
    // Find a facility of matching category type
    let targetType = "recycling";
    const norm = category.toLowerCase();
    if (norm === "hazardous") targetType = "hazardous";
    if (norm === "organic" || norm === "compostable") targetType = "organic";
    if (norm === "e-waste") targetType = "e-waste";

    const matchedCenter = SAMPLE_CENTERS.find((c) => c.type === targetType);
    if (matchedCenter) {
      setSelectedCenterId(matchedCenter.id);
    }
    setActiveTab("map");
  };

  // Historical item detail preview trigger
  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    // Switch to Scanner tab and re-render this item's results card!
    // Since scanner has its own result state, we can simulate a scan by temporarily running onScanSuccess or setting local state
    // Let's redirect to scan results, we can pop a modal or pass down states.
    // For simplicity, we can alert or let the user see it, or pass it to scanner.
    // Let's scroll the user up or focus. Actually, we can just switch tabs and let them know, or display the modal.
    // But even better, we can show details right here or re-inject into the scanner!
    // Let's re-inject the item's scan into scanner by temporarily making a helper in ScannerSection or pass state.
    // Let's implement an elegant scroll-to-view of past logs or details.
    alert(`Standardized Name: ${item.analysis.itemName}\nCategory: ${item.analysis.category}\nAccepted Facility: ${item.analysis.acceptedFacility}\n\nDisposal steps:\n${item.analysis.disposalSteps.join("\n")}`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Leaf className="w-5.5 h-5.5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 italic">
            WasteGuide <span className="text-emerald-600">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors shadow-md">
            Deploy v1.2
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-56 border-r border-slate-200 bg-white flex flex-col p-4 shrink-0 hidden md:flex">
          <nav className="space-y-1 mb-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("scanner")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "scanner"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Recycle className="w-5 h-5" />
              Waste Scanner
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "map"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Navigation className="w-5 h-5" />
              Recycle Map
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "logs"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <History className="w-5 h-5" />
              Scan History
            </button>
          </nav>
          

        </aside>

        {/* Main Body Area */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 space-y-6 overflow-y-auto bg-slate-50">


        {/* Tab Content Display with Animates */}
        <div className="mt-2 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Intro Card */}
                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h2 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
                      <Compass className="w-5 h-5 text-emerald-500" />
                      Smart City Sustainability Overview
                    </h2>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-2xl">
                      Welcome to the AI Urban Waste Management & Recycling Guide System. Track local municipal recycling habits, calculate environmental scores, and locate municipal collection networks cleanly.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("scanner")}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
                  >
                    Launch Waste Scanner
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <DashboardCharts history={history} />
              </motion.div>
            )}

            {activeTab === "scanner" && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <ScannerSection
                  onAnalysisSuccess={handleScanSuccess}
                  onViewOnMap={handleViewOnMap}
                />
              </motion.div>
            )}

            {activeTab === "map" && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <MapContainer
                  selectedCenterId={selectedCenterId}
                  onSelectCenter={setSelectedCenterId}
                />
              </motion.div>
            )}

            {activeTab === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <HistorySection
                  history={history}
                  onSelectItem={handleSelectHistoryItem}
                  onDeleteItem={handleDeleteItem}
                  onClearHistory={handleClearHistory}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>

    {/* Bottom Bar Info */}
    <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] font-medium text-slate-400 shrink-0">
      <div className="flex gap-4">
        <span className="hidden sm:inline">Project: Smart City Sustainability Platform</span>
        <span className="hidden sm:inline text-slate-300">|</span>
        <span>Status: <span className="text-emerald-500">System Operational</span></span>
      </div>
      <div className="flex gap-4">
        <span>Github:23MH1A1202/sustainable-waste-management</span>
        <span className="hidden sm:inline">Documentation v2.1</span>
      </div>
    </footer>
  </div>
);
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
        disposalSteps: [
          "Empty any remaining liquid down the drain.",
          "Rinse out with tap water.",
          "Crush the plastic bottle to save volume in the collection cart.",
          "Screw the plastic cap back on tightly before placing in the recycling bin."
        ],
        hazardWarning: "Plastic bottles decay slowly, breaking down into microplastics that poison marine biomes.",
        recyclingInstructions: [
          "Throw into standard curbside Blue Recycling bins.",
          "Accepted in virtually all municipal recycling programs (PET #1 resin)."
        ],
        ecoSuggestions: [
          "Switch to a reusable double-walled stainless-steel bottle.",
          "Utilize local water filters instead of buying single-use plastic."
        ],
        acceptedFacility: "Curbside Recycling Bin"
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
        disposalSteps: [
          "Remove battery from device immediately once dead.",
          "Tape terminal ends (positive/negative) with clear tape to prevent short circuits.",
          "Drop off at a local municipal hazardous waste collection center or retail collection kiosk."
        ],
        hazardWarning: "Contains toxic heavy metals that can leach into soil or ignite if crushed in regular compactors.",
        recyclingInstructions: [
          "Never put batteries in standard household recycling bins.",
          "Bring to dedicated battery tubes or hazardous drop-off sites."
        ],
        ecoSuggestions: [
          "Switch to high-quality NiMH rechargeable batteries."
        ],
        acceptedFacility: "Hazardous Materials Disposal Hub"
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
        disposalSteps: [
          "Remove packing materials (Styrofoam peanuts, plastic wraps).",
          "Flatten the cardboard box completely to save container volume.",
          "Place inside the paper recycling bin."
        ],
        hazardWarning: "None.",
        recyclingInstructions: [
          "Must be kept dry. Wet cardboard is not recyclable.",
          "Peel off heavy plastic shipping tape if possible."
        ],
        ecoSuggestions: [
          "Reuse boxes for storage or shipping.",
          "Support manufacturers that package items in post-consumer recycled paper."
        ],
        acceptedFacility: "Paper Recycling Bin"
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
        disposalSteps: [
          "Separate food scraps from packaging or stickers.",
          "Toss scraps into the kitchen organic caddy.",
          "Transfer to the municipal green waste organic cart."
        ],
        hazardWarning: "Decomposing organics in oxygen-deprived landfills produce heavy methane emissions.",
        recyclingInstructions: [
          "Composting transforms waste into nutrient-rich humus.",
          "No plastic compost bags unless certified biodegradable (BPI logo)."
        ],
        ecoSuggestions: [
          "Set up a backyard compost bin.",
          "Plan portion sizes to reduce grocery organic waste."
        ],
        acceptedFacility: "Organic Compost Bin"
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
        disposalSteps: [
          "Handle with extreme care to avoid breaking the delicate glass.",
          "Place in a safe container or wrap in newspaper.",
          "Transport directly to your county hazardous drop-off facility."
        ],
        hazardWarning: "Fluorescent tubes contain trace amounts of mercury vapor, a potent neurotoxin.",
        recyclingInstructions: [
          "Never put lamps or fluorescent tubes in standard curbside glass bins.",
          "County collection centers extract heavy metals safely."
        ],
        ecoSuggestions: [
          "Replace spent fixtures with high-efficiency LED lights which last up to 25,000 hours and contain zero mercury."
        ],
        acceptedFacility: "Hazardous Materials Disposal Hub"
      }
    }
  ];
}
