import { useState } from "react";
import { ScanHistoryItem, WasteAnalysis } from "../types";
import { Trash2, Trash, Calendar, Tag, ChevronRight, BarChart2, ShieldAlert, CheckCircle2 } from "lucide-react";

interface HistorySectionProps {
  history: ScanHistoryItem[];
  onSelectItem: (item: ScanHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

export default function HistorySection({ history, onSelectItem, onDeleteItem, onClearHistory }: HistorySectionProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  // Get unique categories for filtering
  const categories = ["all", ...Array.from(new Set(history.map((h) => h.category)))];

  // Filter and sort items
  const processedItems = history
    .filter((item) => filterCategory === "all" || item.category === filterCategory)
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortOrder === "oldest") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return a.itemName.localeCompare(b.itemName);
    });

  const getBadgeStyles = (cat: string) => {
    const norm = cat.toLowerCase();
    if (norm === "hazardous" || norm === "toxic") return "bg-rose-50 text-rose-700 border-rose-100";
    if (norm === "compostable" || norm === "organic") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (norm === "e-waste") return "bg-amber-50 text-amber-700 border-amber-100";
    if (norm === "landfill") return "bg-slate-50 text-slate-700 border-slate-200";
    return "bg-blue-50 text-blue-700 border-blue-100";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-5">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg mb-1 tracking-tight">
            Personal Scanning Logs
          </h3>
          <p className="text-slate-500 text-sm">
            A secure offline log of your household scrap evaluations and circular metrics.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all text-xs font-semibold self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear Logs
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
            <Trash className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-900 text-base mb-1 tracking-tight">No scanned items logged</h4>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed mx-auto">
            Your scanned item history is empty. Go to the Waste Scanner and input items to begin logging.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 text-xs justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Filter Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium px-2 py-1.5 focus:outline-none focus:border-emerald-500/50"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat === "all" ? "All Streams" : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sort Order:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium px-2 py-1.5 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="newest">Newest Scans First</option>
                <option value="oldest">Oldest Scans First</option>
                <option value="alpha">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* List of Scans */}
          <div className="divide-y divide-slate-50 max-h-[450px] overflow-y-auto pr-1">
            {processedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 group hover:bg-slate-50/50 px-2 rounded-xl transition-all"
              >
                <button
                  onClick={() => onSelectItem(item)}
                  className="flex-1 text-left flex items-center gap-3.5 min-w-0 pr-4"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs flex-shrink-0 font-bold ${
                    item.category.toLowerCase() === "hazardous"
                      ? "bg-rose-50 text-rose-500"
                      : item.category.toLowerCase() === "organic" || item.category.toLowerCase() === "compostable"
                      ? "bg-emerald-50 text-emerald-500"
                      : "bg-blue-50 text-blue-500"
                  }`}>
                    {item.itemName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-slate-800 group-hover:text-slate-900 truncate">
                      {item.itemName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border ${getBadgeStyles(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.recyclable ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-[11px]" title="Recyclable">
                      ✔
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-[11px]" title="Non-Recyclable">
                      ✖
                    </span>
                  )}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg border border-slate-100 hover:border-rose-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-40 group-hover:opacity-100"
                    title="Delete Scan Log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}

            {processedItems.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No scans found matching the active category filter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
