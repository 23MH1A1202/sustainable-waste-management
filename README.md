<div align="center">
<h1>♻️ Sustainable Waste Management</h1>
<p><strong>An AI-powered smart city assistant that empowers residents to build sustainable habits.</strong></p>
Live Demo

GitHub Repository
</div>
<br />
An intelligent, AI-driven web application designed to help smart cities and their residents manage waste more sustainably. By leveraging artificial intelligence, this platform takes the guesswork out of recycling and waste disposal, providing users with actionable insights, nearby recycling locations, and personalized analytics.
## ✨ Key Features
 * 📸 **AI Waste Scanner:** Upload or snap a picture of an item to instantly identify its waste category and receive step-by-step disposal instructions.
 * 🗺️ **Interactive Recycling Map:** Easily locate the nearest recycling centers, electronic waste drop-offs, and specialized disposal facilities.
 * 📊 **Analytics Dashboard:** Track your personal sustainability metrics and view interactive charts detailing waste distribution.
 * 📜 **History Logging:** Keep a convenient record of your previously scanned items and disposal history.
## 🛠️ Tech Stack
 * **Frontend:** React, TypeScript, Vite
 * **Styling:** Tailwind CSS / CSS
 * **AI Integration:** Google Gemini API (via Google AI Studio)
 * **Backend/Server:** Node.js, Express
 * **Deployment:** Render
## 🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing.
### Prerequisites
Ensure you have the following installed:
 * Node.js (v16 or higher recommended)
 * npm or yarn package manager
### Installation
 1. **Clone the repository:**
   ```bash
   git clone [https://github.com/23MH1A1202/sustainable-waste-management.git](https://github.com/23MH1A1202/sustainable-waste-management.git)
   cd sustainable-waste-management
   
   ```
 2. **Install dependencies:**
   ```bash
   npm install
   
   ```
 3. **Set up Environment Variables:**
   Rename the provided .env.example file to .env (or .env.local) and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   
   ```
   *(You can obtain an API key from Google AI Studio)*
 4. **Run the development server:**
   ```bash
   npm run dev
   
   ```
 5. **Open the app:**
   Open your browser and navigate to http://localhost:5173 (or the port specified in your Vite terminal output).
## 📁 Project Structure
 * /src/components - Contains reusable UI components (ScannerSection, MapContainer, DashboardCharts, HistorySection).
 * /src/data - Static data and configurations (e.g., centers.ts for map locations).
 * /assets - Images and static assets.
 * server.ts - Local backend server configuration.
## 🤝 Contributing
Contributions make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
 1. Fork the Project
 2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
 3. Commit your Changes (git commit -m 'Add some AmazingFeature')
 4. Push to the Branch (git push origin feature/AmazingFeature)
 5. Open a Pull Request
