import { useEffect, useRef, useState } from "react";
import { CollectionCenter } from "../types";
import { SAMPLE_CENTERS as CENTERS_DATA, MAP_CENTER_DEFAULT } from "../data/centers";
import { MapPin, Phone, Clock, Filter, CheckCircle2, ChevronRight, Navigation } from "lucide-react";

interface MapContainerProps {
  selectedCenterId: string | null;
  onSelectCenter: (id: string | null) => void;
}

export default function MapContainer({ selectedCenterId, onSelectCenter }: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedCenter, setSelectedCenter] = useState<CollectionCenter | null>(null);

  // Sync state with prop
  useEffect(() => {
    if (selectedCenterId) {
      const center = CENTERS_DATA.find((c) => c.id === selectedCenterId);
      if (center) {
        setSelectedCenter(center);
        // Pan map to center
        if (mapRef.current) {
          mapRef.current.setView([center.lat, center.lng], 14, { animate: true });
          // Open popup
          const marker = markersRef.current[center.id];
          if (marker) {
            marker.openPopup();
          }
        }
      }
    } else {
      setSelectedCenter(null);
    }
  }, [selectedCenterId]);

  // Load Leaflet Map
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      [MAP_CENTER_DEFAULT.lat, MAP_CENTER_DEFAULT.lng],
      MAP_CENTER_DEFAULT.zoom
    );
    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Create markers for centers based on filter
    recreateMarkers(activeFilter);

    // Clean up
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  }, []);

  // Update markers when filter changes
  useEffect(() => {
    recreateMarkers(activeFilter);
  }, [activeFilter]);

  const recreateMarkers = (filter: string) => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = {};

    // Filter centers
    const filteredCenters = CENTERS_DATA.filter(
      (c) => filter === "all" || c.type === filter
    );

    filteredCenters.forEach((center) => {
      let markerColor = "#3b82f6"; // Blue (recycling)
      if (center.type === "organic") markerColor = "#22c55e"; // Green
      if (center.type === "e-waste") markerColor = "#f59e0b"; // Orange
      if (center.type === "hazardous") markerColor = "#ef4444"; // Red

      // Create beautiful custom SVG pin icon
      const svgIcon = `<div style="display: flex; justify-content: center; align-items: center; width: 36px; height: 36px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${markerColor}" width="34" height="34" stroke="white" stroke-width="1.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>`;

      const customIcon = L.divIcon({
        html: svgIcon,
        className: "custom-leaflet-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -32],
      });

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px;">
          <h4 style="font-weight: 600; color: #1e293b; margin: 0 0 4px 0; font-size: 13px;">${center.name}</h4>
          <p style="color: #64748b; margin: 0 0 6px 0; font-size: 11px;">${center.address}</p>
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; text-transform: uppercase; 
            background-color: ${markerColor}20; color: ${markerColor}">
            ${center.type}
          </span>
        </div>
      `;

      const marker = L.marker([center.lat, center.lng], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(popupContent);

      marker.on("click", () => {
        onSelectCenter(center.id);
      });

      markersRef.current[center.id] = marker;
    });

    // Adjust map bounds if multiple markers exist
    if (filteredCenters.length > 0) {
      const group = L.featureGroup(Object.values(markersRef.current));
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const handleCenterSelect = (center: CollectionCenter) => {
    onSelectCenter(center.id);
  };

  return (
    <div id="leaflet-map-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-[650px]">
      {/* Sidebar - Center list & Filters */}
      <div className="p-6 border-r border-slate-200 flex flex-col h-full overflow-y-auto">
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2 mb-2 tracking-tight">
            <Navigation className="w-5 h-5 text-emerald-500" />
            Collection Centers
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Discover verified drop-off centers across the metropolitan area for certified recycling.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
            <Filter className="w-3 h-3" />
            Filter By Waste Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                activeFilter === "all"
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Facilities
            </button>
            <button
              onClick={() => setActiveFilter("recycling")}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                activeFilter === "recycling"
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Recycling Bin
            </button>
            <button
              onClick={() => setActiveFilter("e-waste")}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                activeFilter === "e-waste"
                  ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              E-Waste
            </button>
            <button
              onClick={() => setActiveFilter("organic")}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                activeFilter === "organic"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Organic/Compost
            </button>
            <button
              onClick={() => setActiveFilter("hazardous")}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                activeFilter === "hazardous"
                  ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Hazardous
            </button>
          </div>
        </div>

        {/* List of centers */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {CENTERS_DATA.filter((c) => activeFilter === "all" || c.type === activeFilter).map((center) => {
            const isSelected = selectedCenterId === center.id;
            let themeColor = "border-l-blue-500";
            let bgLight = "hover:bg-blue-50/40";
            if (center.type === "organic") {
              themeColor = "border-l-emerald-500";
              bgLight = "hover:bg-emerald-50/40";
            }
            if (center.type === "e-waste") {
              themeColor = "border-l-amber-500";
              bgLight = "hover:bg-amber-50/40";
            }
            if (center.type === "hazardous") {
              themeColor = "border-l-rose-500";
              bgLight = "hover:bg-rose-50/40";
            }

            return (
              <button
                key={center.id}
                onClick={() => handleCenterSelect(center)}
                className={`w-full text-left p-3.5 rounded-xl border border-slate-100 border-l-4 transition-all flex items-center justify-between ${themeColor} ${
                  isSelected ? "bg-slate-50 shadow-sm border-slate-200" : `bg-white ${bgLight}`
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-medium text-xs text-slate-800 truncate">{center.name}</h4>
                  <p className="text-slate-400 text-[10px] truncate flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {center.address}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${isSelected ? "translate-x-1 text-slate-500" : ""}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Map display & Selected Detail Card */}
      <div className="lg:col-span-2 relative h-full flex flex-col">
        {/* The leaflet map container */}
        <div ref={mapContainerRef} className="w-full flex-1 min-h-[400px] z-10" />

        {/* Selected Center Info Sheet Overlay */}
        {selectedCenter && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedCenter.type === "recycling"
                      ? "bg-blue-100 text-blue-800"
                      : selectedCenter.type === "organic"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedCenter.type === "e-waste"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {selectedCenter.type === "recycling" ? "Recyclables Center" : selectedCenter.type}
                </span>
                <span className="text-xs text-slate-500 font-mono">{selectedCenter.phone}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-lg tracking-tight">{selectedCenter.name}</h3>
              <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {selectedCenter.address}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{selectedCenter.hours}</span>
              </div>
            </div>

            <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Accepted Waste Streams
              </span>
              <div className="space-y-1.5">
                {selectedCenter.acceptedTypes.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700 text-xs leading-tight">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
