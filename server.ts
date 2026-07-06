import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Pre-packaged local knowledge base for resilient offline/no-key usage
const WASTE_KNOWLEDGE_BASE: Record<string, any> = {
  "battery": {
    itemName: "Battery (Alkaline/Lithium)",
    category: "Hazardous",
    recyclable: false,
    disposalSteps: [
      "Remove battery from device immediately once dead.",
      "Store safely in a cool, dry place inside a non-conductive plastic container.",
      "Tape terminal ends (positive/negative) with clear tape to prevent short circuits.",
      "Drop off at a local municipal hazardous waste collection center or certified electronic retail collection kiosk."
    ],
    hazardWarning: "Contains toxic heavy metals (lithium, lead, mercury, acid) that can leach into soil/water or ignite if crushed in regular landfill compactors.",
    recyclingInstructions: [
      "Never put batteries in standard household recycling bins.",
      "Bring to dedicated battery recycle tubes or retail drop-off stations.",
      "Lead-acid and rechargeable batteries are legally mandated to be recycled separate from normal waste."
    ],
    ecoSuggestions: [
      "Switch to high-quality NiMH rechargeable batteries to save money and prevent waste.",
      "Select rechargeable electronics and USB-chargeable devices.",
      "Buy low-mercury/heavy-metal-free batteries."
    ],
    acceptedFacility: "Certified E-waste & Hazardous Collection Depot"
  },
  "plastic bottle": {
    itemName: "Plastic Water/Soda Bottle",
    category: "Recyclable",
    recyclable: true,
    disposalSteps: [
      "Empty any remaining liquids fully down the drain.",
      "Rinse out with water to remove residue and sugars.",
      "Crush the bottle flat to save space in the bin.",
      "Screw the plastic cap back on tightly (caps are now recyclable when attached)."
    ],
    hazardWarning: "Plastic bottles degrade slowly, breaking down into harmful microplastics that poison marine lifecycles and accumulate in human tissues.",
    recyclingInstructions: [
      "Throw in the standard curbside Blue Recycling Bin.",
      "Accepted by virtually all single-stream municipal recycling facilities (PET #1 or HDPE #2 plastics).",
      "Ensure the bottle is clean of organic food contaminants."
    ],
    ecoSuggestions: [
      "Transition to a durable stainless-steel or glass reusable water bottle.",
      "Utilize a water filter pitcher or faucet attachment instead of bottled water.",
      "Choose aluminum cans or glass bottles if single-use is unavoidable, as they recycle infinitely."
    ],
    acceptedFacility: "Curbside Recycling Bin"
  },
  "pizza box": {
    itemName: "Greasy Pizza Box",
    category: "Compostable",
    recyclable: false,
    disposalSteps: [
      "Open the box and inspect for food waste or crusts.",
      "Tear off any clean, grease-free cardboard sections (usually the top lid).",
      "Toss the greasy bottom section into the Organic/Compost bin.",
      "Drop the dry, clean lid into the Paper Recycling bin."
    ],
    hazardWarning: "Oil and grease from cheese contaminate paper pulping water systems, ruining entire batches of recycled cardboard.",
    recyclingInstructions: [
      "Only clean, dry cardboard can go in standard recycling.",
      "Greasy sections belong in municipal green organic composting carts, where they break down cleanly.",
      "If composting is unavailable, dispose of greasy sections in general trash."
    ],
    ecoSuggestions: [
      "When ordering, ask to place pizza on parchment paper to keep the box clean for recycling.",
      "Compost at home if your neighborhood supports organic scraps.",
      "Support local pizzerias that use unbleached, biodegradable packaging."
    ],
    acceptedFacility: "Organic Compost Cart / Landfill"
  },
  "light bulb": {
    itemName: "CFL/LED Light Bulb",
    category: "Hazardous",
    recyclable: false,
    disposalSteps: [
      "Handle carefully to prevent breakage.",
      "If a bulb breaks, open windows to ventilate, and pick up debris using tape, never vacuum (to prevent vaporizing mercury).",
      "Wrap spent bulb in a small plastic bag.",
      "Deliver to home improvement retailers (IKEA, Home Depot, Lowe's) or county toxic dropoff depots."
    ],
    hazardWarning: "Fluorescent and CFL bulbs contain trace mercury vapor, a neurotoxin. LED bulbs contain copper, nickel, and arsenic, which should not go to landfills.",
    recyclingInstructions: [
      "Regular glass recycling bins DO NOT accept light bulbs due to specialized metal attachments and chemicals.",
      "CFLs must go to specific retail or county dropoffs where heavy metals can be safely recovered."
    ],
    ecoSuggestions: [
      "Buy energy-efficient LED bulbs which last up to 25,000 hours and contain no mercury.",
      "Turn off lights when leaving rooms to extend bulb lifespans.",
      "Properly configure outdoor motion sensors so lights only operate when needed."
    ],
    acceptedFacility: "E-Waste / Retail Kiosk / Hazardous Dropoff"
  },
  "paint can": {
    itemName: "Liquid Paint Can",
    category: "Hazardous",
    recyclable: false,
    disposalSteps: [
      "Determine if the paint is latex (water-based) or oil-based.",
      "For latex paint: mix with cat litter or commercial paint hardener, let dry until solid, then toss can with lid off in regular garbage.",
      "For oil-based paint: Keep tightly sealed and bring to a hazardous waste recycling day.",
      "Do not pour any liquid paint down household drains, sinks, or storm sewers."
    ],
    hazardWarning: "Liquid paints contain Volatile Organic Compounds (VOCs), solvents, and pigments that contaminate groundwater and release toxic fumes into municipal sewer channels.",
    recyclingInstructions: [
      "Steel paint cans are recyclable ONLY when completely dry, hard, and free of excess sludge.",
      "Bring liquid paint leftovers to dedicated 'PaintCare' collection points if active in your area."
    ],
    ecoSuggestions: [
      "Calculate square footage carefully before purchasing paint to minimize leftovers.",
      "Donate usable excess paint to community theater projects, Habitat for Humanity, or local schools.",
      "Choose Zero-VOC and organic eco-friendly paints for healthier indoor air quality."
    ],
    acceptedFacility: "Household Hazardous Waste Site / PaintCare Dropoff"
  }
};

// Lazy-initialize Gemini client
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: key || "DUMMY_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiConfigured: !!process.env.GEMINI_API_KEY });
});

// Waste classification endpoint
app.post("/api/waste/analyze", async (req, res) => {
  const { item, image } = req.body;
  if ((!item || typeof item !== "string" || item.trim().length === 0) && !image) {
    return res.status(400).json({ error: "Item name or image is required" });
  }

  const query = item ? item.trim().toLowerCase() : "Image Analysis";

  // Try to use Gemini if the API key is configured
  if (!process.env.GEMINI_API_KEY && image) {
    return res.status(503).json({ error: "Gemini API Key is required for image analysis. Please configure it in the platform settings." });
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = getGemini();
      
      let prompt = `Analyze this waste item: "${query}". Respond with precise municipal sustainability guidelines according to standard environmental criteria.`;
      let contents: any = prompt;
      
      if (image) {
        prompt = `Analyze the waste item in the provided image. Ignore the suggested name if it doesn't match the image. Respond with precise municipal sustainability guidelines according to standard environmental criteria.`;
        contents = [
          prompt,
          {
            inlineData: {
              data: image.data,
              mimeType: image.mimeType
            }
          }
        ];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: "You are an expert civic sustainability officer. Classify the waste item into one of the following exact categories: 'Recyclable', 'Hazardous', 'Compostable', 'Landfill', 'E-waste', 'Glass', 'Metal', 'Paper', 'Plastic'. Return a complete, structured sustainability profile for disposal and recycling.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              itemName: { 
                type: Type.STRING, 
                description: "Clean, standardized name of the item (e.g. 'Lithium-Ion Battery' instead of 'battery')." 
              },
              category: {
                type: Type.STRING,
                description: "Primary category. Must be exactly one of: 'Recyclable', 'Hazardous', 'Compostable', 'Landfill', 'E-waste', 'Glass', 'Metal', 'Paper', 'Plastic'."
              },
              recyclable: { 
                type: Type.BOOLEAN, 
                description: "Whether the item is generally recyclable in standardized municipal environments." 
              },
              disposalSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-5 clear, numbered, actionable chronological steps to safely dispose of or containerize this item."
              },
              hazardWarning: {
                type: Type.STRING,
                description: "Explicit environmental hazard warning if this item has toxic, flammable, corrosive, or chemical hazards. If safe/benign, output 'None'."
              },
              recyclingInstructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Detailed preparation guidelines for recycling (e.g., rinse, crush, peel label, separate lids). If not recyclable, explain alternative reclamation."
              },
              ecoSuggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 highly creative, actionable recommendations for upcycling, reusing, or purchasing eco-friendly biodegradable alternatives."
              },
              acceptedFacility: {
                type: Type.STRING,
                description: "Type of facility (e.g., Household Hazardous Waste Depot, E-Waste Dropoff, Green waste composting yard, standard curbside bin)."
              }
            },
            required: [
              "itemName", 
              "category", 
              "recyclable", 
              "disposalSteps", 
              "hazardWarning", 
              "recyclingInstructions", 
              "ecoSuggestions", 
              "acceptedFacility"
            ]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json(parsed);
      }
    } catch (error: any) {
      console.error("Gemini API call failed, backing up to local matching:", error);
    }
  }

  // Fallback Matching Mode (resilient design)
  // Check if we have exact match in our pre-defined sustainable database
  for (const key of Object.keys(WASTE_KNOWLEDGE_BASE)) {
    if (query.includes(key) || key.includes(query)) {
      return res.json(WASTE_KNOWLEDGE_BASE[key]);
    }
  }

  // Default dynamic response generator if item is unknown and API is offline/not configured
  const words = query.split(" ");
  const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  // Basic heuristic category selector
  let detectedCategory = "Landfill";
  let isRecyclable = false;
  let facility = "Standard Waste Can";
  let warning = "None";
  let steps = ["Dispose of securely inside household trash bins."];
  let recycleSteps = ["This item is not easily recycled via standard curbside programs."];
  let suggestions = ["Refuse single-use products of this nature", "Explore durable reusable items."];

  if (query.includes("plastic") || query.includes("bottle") || query.includes("jug") || query.includes("container")) {
    detectedCategory = "Plastic";
    isRecyclable = true;
    facility = "Curbside Plastics Bin";
    steps = ["Empty residue completely.", "Rinse cleanly.", "Crush container.", "Throw in Blue recycle container."];
    recycleSteps = ["Check local municipality codes for plastic resin numbers (#1 to #7).", "Rinse fully; grease or food contaminates the batch."];
    suggestions = ["Switch to reusable containers", "Avoid purchasing products packaged in single-use plastic."];
  } else if (query.includes("paper") || query.includes("cardboard") || query.includes("box") || query.includes("mail")) {
    detectedCategory = "Paper";
    isRecyclable = true;
    facility = "Blue Curbside Recycling Bin";
    steps = ["Flatten boxes fully.", "Ensure paper is dry and clean.", "Remove any plastic wrappers or tape.", "Place in recycling container."];
    recycleSteps = ["Dry paper is required; water weakens cellulose fibers and ruins recycling loops.", "Remove non-paper inserts or tape labels."];
    suggestions = ["Opt for paperless electronic billing", "Reuse clean shipping boxes for storage or mailing."];
  } else if (query.includes("glass") || query.includes("jar") || query.includes("bottle")) {
    detectedCategory = "Glass";
    isRecyclable = true;
    facility = "Glass Recycling Collector";
    steps = ["Rinse out remaining contents.", "Separate metal lids.", "Place jar and lids in appropriate recycling bins."];
    recycleSteps = ["Sort colors (clear, green, brown) if requested by local dropoff stations.", "Rinse off food particles."];
    suggestions = ["Upcycle jars for bulk spice storage", "Use glass jars for home food storage or drinking glasses."];
  } else if (query.includes("metal") || query.includes("can") || query.includes("foil") || query.includes("aluminum")) {
    detectedCategory = "Metal";
    isRecyclable = true;
    facility = "Curbside Metal/Can Recycling Bin";
    steps = ["Rinse out food remains.", "Keep can lids inside if attached.", "Place in standard metal recycling container."];
    recycleSteps = ["Aluminum and steel cans are infinitely recyclable without loss of quality.", "Clean completely."];
    suggestions = ["Purchase beverage cans rather than bottles", "Choose metal items with high post-consumer recycled content."];
  } else if (query.includes("food") || query.includes("apple") || query.includes("banana") || query.includes("vegetable") || query.includes("scraps") || query.includes("coffee") || query.includes("tea")) {
    detectedCategory = "Compostable";
    isRecyclable = true;
    facility = "Green Organic/Compost Bin";
    steps = ["Collect food scraps in a container.", "Do not include any plastic tags, rubber bands, or stickers.", "Toss scraps directly in organic cart."];
    warning = "Decomposing organic wastes in landfills produce methane gas, a greenhouse gas 25x more potent than CO2.";
    recycleSteps = ["Composting transforms waste into nutrient-rich soil.", "Incorporate carbon-rich 'browns' (leaves, paper) with nitrogen-rich 'greens' (scraps)."];
    suggestions = ["Establish a backyard composting pile", "Plan meals to avoid food spoilage", "Use food leftovers for delicious broths."];
  } else if (query.includes("phone") || query.includes("computer") || query.includes("electronic") || query.includes("wire") || query.includes("charger") || query.includes("tv") || query.includes("cable")) {
    detectedCategory = "E-waste";
    isRecyclable = true;
    facility = "Certified E-Waste Recycling Hub";
    warning = "Electronics contain lead, mercury, and flame-retardants that poison waterways and do not break down in traditional landfills.";
    steps = ["Backup and delete personal data.", "Remove rechargeable lithium-ion battery.", "Wrap cords neatly.", "Take to certified electronics recycling collection center."];
    recycleSteps = ["Specialized e-waste facilities extract rare earth metals like gold, copper, and palladium safely."];
    suggestions = ["Donate working devices to charity", "Repair hardware to prolong gadget lifetime.", "Buy refurbished certified devices."];
  }

  res.json({
    itemName: capitalized || "Unclassified Item",
    category: detectedCategory,
    recyclable: isRecyclable,
    disposalSteps: steps,
    hazardWarning: warning,
    recyclingInstructions: recycleSteps,
    ecoSuggestions: suggestions,
    acceptedFacility: facility
  });
});

async function startServer() {
  // Integrate Vite for dev, serve static build for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Waste Management Assistant running on http://localhost:${PORT}`);
  });
}

startServer();
