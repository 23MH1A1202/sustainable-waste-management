export interface WasteAnalysis {
  itemName: string;
  category: string; // 'Recyclable' | 'Hazardous' | 'Compostable' | 'Landfill' | 'E-waste' | 'Glass' | 'Metal' | 'Paper' | 'Plastic'
  recyclable: boolean;
  disposalSteps: string[];
  hazardWarning: string;
  recyclingInstructions: string[];
  ecoSuggestions: string[];
  acceptedFacility: string;
}

export interface CollectionCenter {
  id: string;
  name: string;
  type: 'recycling' | 'e-waste' | 'organic' | 'hazardous';
  address: string;
  lat: number;
  lng: number;
  hours: string;
  acceptedTypes: string[];
  phone: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string; // ISO string
  itemName: string;
  category: string;
  recyclable: boolean;
  analysis: WasteAnalysis;
}

export interface ProjectLinks {
  demoUrl: string;
  githubUrl: string;
  notes?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  color: string;
}
