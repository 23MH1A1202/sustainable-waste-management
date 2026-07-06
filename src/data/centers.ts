import { CollectionCenter } from "../types";

export const SAMPLE_CENTERS: CollectionCenter[] = [
  {
    id: "center-1",
    name: "Rajahmundry Municipal Recycling Depot",
    type: "recycling",
    address: "Morampudi Junction, Rajahmundry, AP 533103",
    lat: 17.0050,
    lng: 81.7950,
    hours: "Mon - Sat: 8:00 AM - 5:00 PM | Sun: Closed",
    acceptedTypes: ["Plastic Bottles & Containers (#1-7)", "Cardboard & Mixed Paper", "Aluminum & Steel Cans", "Glass Bottles & Jars"],
    phone: "(0883) 244-0120"
  },
  {
    id: "center-2",
    name: "AP E-Waste Management Hub",
    type: "e-waste",
    address: "Danavaipeta, Rajahmundry, AP 533103",
    lat: 17.0120,
    lng: 81.7820,
    hours: "Mon - Fri: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM",
    acceptedTypes: ["Laptops & Computers", "Mobile Phones & Tablets", "Cables, Chargers & Adaptors", "LED/LCD Monitors & TVs", "Household Batteries"],
    phone: "(0883) 244-0145"
  },
  {
    id: "center-3",
    name: "Godavari Green Organic Composting",
    type: "organic",
    address: "Godavari Bund Road, Rajahmundry, AP 533101",
    lat: 16.9980,
    lng: 81.7750,
    hours: "Every Day: 7:00 AM - 7:00 PM",
    acceptedTypes: ["Food Scraps & Raw Vegetables", "Coffee Grounds & Paper Filters", "Yard Waste & Trimmings", "BPI-Certified Compostable Packaging"],
    phone: "(0883) 244-0178"
  },
  {
    id: "center-4",
    name: "APPCB Hazardous Waste Dropoff",
    type: "hazardous",
    address: "Innespeta, Rajahmundry, AP 533101",
    lat: 16.9950,
    lng: 81.7800,
    hours: "Tue, Thu, Sat: 8:30 AM - 4:30 PM",
    acceptedTypes: ["Latex & Oil-Based Paint", "Chemical Solvents & Cleaners", "Aerosol Spray Cans", "Fluorescent Tubes & CFL Bulbs", "Motor Oil & Car Batteries"],
    phone: "(0883) 244-0199"
  },
  {
    id: "center-5",
    name: "RTC Complex Bottle Recycling Kiosk",
    type: "recycling",
    address: "APSRTC Bus Station, Rajahmundry, AP 533103",
    lat: 17.0035,
    lng: 81.7875,
    hours: "Mon - Fri: 8:00 AM - 6:00 PM",
    acceptedTypes: ["CRV Glass Beverage Bottles", "Aluminum Seltzer Cans", "PET Plastic Water Bottles"],
    phone: "(0883) 244-0210"
  },
  {
    id: "center-6",
    name: "JN Road Tech Reclamation Point",
    type: "e-waste",
    address: "JN Road, Rajahmundry, AP 533103",
    lat: 17.0100,
    lng: 81.7850,
    hours: "Wednesday & Saturday: 10:00 AM - 5:00 PM",
    acceptedTypes: ["Computer Servers", "Keyboards & Mice", "Networking Switches & Routers", "Rechargeable Batteries", "Small Appliances"],
    phone: "(0883) 244-0233"
  }
];

export const MAP_CENTER_DEFAULT = {
  lat: 17.0005,
  lng: 81.7900,
  zoom: 13
};
