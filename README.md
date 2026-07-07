<div align="center">

# ♻️ Sustainable Waste Management

**An AI-powered smart city assistant that empowers residents to build sustainable habits.**

[🌐 Live Demo](https://sustainable-waste-management-5tfl.onrender.com/) • [📂 GitHub Repository](https://github.com/23MH1A1202/sustainable-waste-management)

</div>

---

An intelligent, AI-driven web application designed to help smart cities and residents manage waste more sustainably. By leveraging artificial intelligence, the platform helps users identify waste, locate nearby recycling facilities, and track their sustainability progress.

## ✨ Key Features

- 📸 **AI Waste Scanner**
  - Upload or capture a photo of an item.
  - Instantly identify its waste category.
  - Receive step-by-step disposal instructions.

- 🗺️ **Interactive Recycling Map**
  - Locate nearby recycling centers.
  - Find e-waste collection points.
  - Discover specialized disposal facilities.

- 📊 **Analytics Dashboard**
  - Track sustainability metrics.
  - View interactive waste distribution charts.

- 📜 **History Logging**
  - Save previously scanned items.
  - Review disposal history anytime.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS, CSS |
| AI | Google Gemini API (Google AI Studio) |
| Backend | Node.js, Express |
| Deployment | Render |

---

# 🚀 Getting Started

## Prerequisites

Install the following:

- Node.js (v16 or later)
- npm or Yarn

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/23MH1A1202/sustainable-waste-management.git
cd sustainable-waste-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Rename:

```
.env.example
```

to

```
.env
```

or

```
.env.local
```

Then add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

You can obtain an API key from **Google AI Studio**.

---

### 4. Start the development server

```bash
npm run dev
```

---

### 5. Open the application

Navigate to:

```
http://localhost:5173
```

(or the port displayed by Vite)

---

# 📁 Project Structure

```
src/
├── components/
│   ├── ScannerSection
│   ├── MapContainer
│   ├── DashboardCharts
│   └── HistorySection
│
├── data/
│   └── centers.ts
│
├── assets/

server.ts
```

### Description

- **src/components** → Reusable UI components.
- **src/data** → Static data and map configurations.
- **assets** → Images and static resources.
- **server.ts** → Local backend server.

---

# 🤝 Contributing

Contributions are always welcome!

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes.

```bash
git commit -m "Add some AmazingFeature"
```

4. Push to your branch.

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request.
