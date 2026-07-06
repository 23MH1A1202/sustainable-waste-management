import React, { useState } from "react";
import { WasteAnalysis, ScanHistoryItem } from "../types";
import { Search, Loader2, AlertTriangle, ArrowRight, Lightbulb, CheckCircle2, ShieldCheck, MapPin, RefreshCw, UploadCloud, FileText } from "lucide-react";

interface ScannerSectionProps {
  onAnalysisSuccess: (analysis: WasteAnalysis) => void;
  onViewOnMap: (facilityType: string) => void;
}

export default function ScannerSection({ onAnalysisSuccess, onViewOnMap }: ScannerSectionProps) {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WasteAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    let name = file.name.split(".")[0];
    name = name.replace(/[-_]/g, " ");
    setUploadedFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const mimeType = file.type;
      setQuery(name);
      handleAnalyze(name, { data: base64, mimeType });
    };
    reader.readAsDataURL(file);
  };

  // Common items grid for rapid evaluation
  const commonItems = [
    { name: "Alkaline Battery", search: "battery", icon: "🔋" },
    { name: "Plastic Bottle", search: "plastic bottle", icon: "🥤" },
    { name: "Greasy Pizza Box", search: "pizza box", icon: "🍕" },
    { name: "Fluorescent Bulb", search: "light bulb", icon: "💡" },
    { name: "Liquid Paint", search: "paint can", icon: "🎨" },
    { name: "Soda Can", search: "aluminum can", icon: "🥫" },
    { name: "Cardboard Box", search: "cardboard box", icon: "📦" },
    { name: "Banana Peel", search: "banana peel", icon: "🍌" }
  ];

  const handleAnalyze = async (searchItem: string, imageData?: { data: string, mimeType: string }) => {
    if (!searchItem.trim() && !imageData) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/waste/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: searchItem, image: imageData }),
      });

      if (!response.ok) {
        let errMsg = "Failed to classify waste item. Please check backend connection.";
        try {
          const errorData = await response.json();
          if (errorData.error) errMsg = errorData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data: WasteAnalysis = await response.json();
      setResult(data);
      onAnalysisSuccess(data);
    } catch (err: any) {
      setError(err.message || "An unexpected communication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickClick = (search: string) => {
    setQuery(search);
    handleAnalyze(search);
  };

  const getCategoryStyles = (cat: string) => {
    const norm = cat.toLowerCase();
    if (norm === "hazardous" || norm === "toxic") {
      return {
        bg: "bg-rose-50 border-rose-100 text-rose-700",
        badge: "bg-rose-100 text-rose-800",
        indicator: "bg-rose-500",
        label: "Hazardous Materials"
      };
    }
    if (norm === "compostable" || norm === "organic") {
      return {
        bg: "bg-emerald-50 border-emerald-100 text-emerald-700",
        badge: "bg-emerald-100 text-emerald-800",
        indicator: "bg-emerald-500",
        label: "Organic/Compost"
      };
    }
    if (norm === "e-waste" || norm === "electronic") {
      return {
        bg: "bg-amber-50 border-amber-100 text-amber-700",
        badge: "bg-amber-100 text-amber-800",
        indicator: "bg-amber-500",
        label: "Electronic Waste"
      };
    }
    if (norm === "landfill" || norm === "trash") {
      return {
        bg: "bg-slate-50 border-slate-200 text-slate-700",
        badge: "bg-slate-200 text-slate-800",
        indicator: "bg-slate-500",
        label: "Landfill Waste"
      };
    }
    // Standard Recyclable (Paper, Plastic, Metal, Glass, Recyclable)
    return {
      bg: "bg-blue-50 border-blue-100 text-blue-700",
      badge: "bg-blue-100 text-blue-800",
      indicator: "bg-blue-500",
      label: cat
    };
  };

  return (
    <div className="space-y-6">
      {/* Scanner Control Box */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-900 text-lg tracking-tight mb-1.5">
          Dynamic AI Waste Scanner
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Input any domestic waste item to get instant AI-powered disposal procedures, compliance categories, and hazardous alerts.
        </p>

        {/* Input Field */}
        <div className="flex gap-3 max-w-2xl">
          <div className="flex-1 relative rounded-lg bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze(query)}
              placeholder="Enter waste item (e.g. spray can, yogurt cup, cell phone)..."
              className="w-full h-full bg-transparent border-none text-slate-700 placeholder-slate-400 text-sm py-3 pl-10 pr-4 focus:outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={() => handleAnalyze(query)}
            disabled={loading || !query.trim()}
            className="px-6 py-3 rounded-lg bg-slate-900 text-white font-medium text-sm flex items-center gap-2 hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Classify Item"
            )}
          </button>
        </div>

        {/* Drag-and-Drop Dropzone Container */}
        <div className="mt-4 max-w-2xl">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              isDragging
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
            onClick={() => document.getElementById("file-upload-input")?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploadedFileName ? (
              <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium animate-fade-in">
                <FileText className="w-5 h-5 text-emerald-500" />
                <span>Uploaded: <strong>{uploadedFileName}</strong> (Identified: "{query}")</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-slate-400" />
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">Drag & drop photo of item</span> or click to browse files
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Curated Grid */}
        <div className="mt-8">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Suggested Test Materials
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {commonItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickClick(item.search)}
                className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-3 text-left text-slate-700 shadow-sm"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading overlay skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
          <h4 className="font-display font-semibold text-slate-800 text-sm mb-1">Environmental AI Running</h4>
          <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
            Standardizing item nomenclature, generating chemical and hazard warnings, and fetching regulatory municipal routing...
          </p>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Classification</span>
                  <h3 className="font-bold text-slate-900 text-xl md:text-2xl mt-1 tracking-tight">{result.itemName}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-md text-xs font-semibold ${getCategoryStyles(result.category).badge}`}>
                    {getCategoryStyles(result.category).label}
                  </span>
                  {result.recyclable ? (
                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Recyclable
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                      Non-Recyclable
                    </span>
                  )}
                </div>
              </div>

              {/* Hazard Warning box (if applicable) */}
              {result.hazardWarning && result.hazardWarning.toLowerCase() !== "none" && (
                <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex gap-3 leading-relaxed">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs uppercase tracking-wider text-amber-700 mb-1">Ecological & Safety Warning</h5>
                    <p>{result.hazardWarning}</p>
                  </div>
                </div>
              )}

              {/* Disposal steps */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Disposal Directions</h4>
                  <div className="space-y-3">
                    {result.disposalSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 text-sm text-slate-700 leading-relaxed">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 flex-shrink-0 text-xs">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preparation requirements */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Recycling & Recovery Prep</h4>
                  <div className="space-y-3">
                    {result.recyclingInstructions.map((inst, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Integration routing footer */}
            <div className="border-t border-slate-200 pt-5 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                Accepted facility: <strong className="text-slate-900">{result.acceptedFacility}</strong>
              </span>

              <button
                onClick={() => onViewOnMap(result.category)}
                className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5 hover:translate-x-0.5 transition-all text-right self-end sm:self-auto"
              >
                Find nearest center
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Eco suggestions & upcycling */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                <Lightbulb className="w-5 h-5" />
              </div>

              <h3 className="font-semibold text-emerald-950 text-lg mb-2">
                Circular Eco-Alternatives
              </h3>
              <p className="text-emerald-800 text-sm mb-6 leading-relaxed">
                Reduce your footprint. Consider these circular economy options and sustainable swap ideas for this item.
              </p>

              <div className="space-y-3">
                {result.ecoSuggestions.map((sug, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm flex gap-3 text-sm text-emerald-950 leading-relaxed">
                    <span className="text-emerald-500 font-bold text-lg leading-none">💡</span>
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-emerald-200/50 text-xs font-medium text-emerald-700 leading-normal flex items-start gap-2">
              <span className="mt-0.5">🌱</span>
              <span>Every correct disposal saves valuable materials and prevents ecosystem heavy metal toxicity.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
