# 🏴‍☠️ Nakama Treasure Chest - Content Manager

> A modern and intimate web platform designed to organize, track, and enjoy our multimedia collections (Anime, Manga, TV Series, Movies, and Books), sharing stories and special moments together as a couple.

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Pinia](https://img.shields.io/badge/Pinia-4.0+-FFE564?style=for-the-badge&logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Live%20Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nakama-gestor-personal.vercel.app)

🌐 **Live Demo:** [https://nakama-gestor-personal.vercel.app](https://nakama-gestor-personal.vercel.app)

---

## 📖 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Usage & Available Scripts](#-usage--available-scripts)
- [Project Structure](#-project-structure)
- [Dedication](#️-dedication)

---

## ✨ Key Features

- 🎬 **Multi-Category Media Tracking:** Detailed tracking for Anime, Manga, TV Series, Movies, and Books. Manage statuses (*Watching*, *Plan to Watch*, *Completed*, *On Hold*, *Dropped*), episode/chapter progress, personal ratings, notes, and cover art.
- 👥 **Shared Space (Crew):** Synchronized list management and joint recommendations to enjoy content together as a couple.
- 📅 **Weekly Release Calendar:** Organize ongoing series and anime by day of the week (Monday through Sunday) so you never miss a premiere or marathon together.
- 🔍 **Integrated Media Search:** Quickly find titles with autocomplete and metadata preloading, paired with optimized client-side cover image compression.
- 📊 **Dashboard & Metrics:** Interactive dashboard featuring progress statistics, recent activity, and a visual overview of your collection.
- 🛡️ **Security & Persistence:** User authentication powered by Supabase Auth and row-level data protection via PostgreSQL Row Level Security (RLS).
- ⚡ **Mock Mode / Local Isolation:** Ability to run and test the application locally with simulated data without relying on an active database (`VITE_USE_MOCK=true`).

---

## 🛠️ Tech Stack

- **Frontend:** [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`) and [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Routing:** [Vue Router](https://router.vuejs.org/)
- **Styling & Icons:** [Tailwind CSS v4](https://tailwindcss.com/) and [Lucide Icons](https://lucide.dev/) (`@lucide/vue`)
- **Backend as a Service (BaaS):** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth, and Storage)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Testing & Code Quality:** [Vitest](https://vitest.dev/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), and [vue-tsc](https://github.com/vuejs/language-tools)
- **Deployment & Hosting:** [Vercel](https://vercel.com/)
- **Package Manager:** [pnpm](https://pnpm.io/) (or `npm` / `yarn`)

---

## 📋 Prerequisites

Before getting started, make sure you have the following tools installed:

- **Node.js:** Version 18.0 or higher (Node.js 20+ LTS recommended).
- **Package Manager:** [pnpm](https://pnpm.io/) (recommended), `npm`, or `yarn`.
- **Supabase Account:** A project on [Supabase](https://supabase.com/) (optional if using mock mode).

---

## 🚀 Installation & Setup

Follow these steps to clone and run the project in your local environment:

### 1. Clone the repository

```bash
git clone https://github.com/Entropy-v0/nakama-treasure-chest.git
cd nakama-treasure-chest
```

### 2. Install dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install
```

### 3. Configure environment variables

Copy the environment template to a local file:

```bash
cp .env.example .env.local
```

Configure your variables in `.env.local` according to your environment:

```env
# Supabase Configuration (Production / Live Backend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Mock Mode / Local Isolation (true = uses mock data without connecting to Supabase)
VITE_USE_MOCK=false
```

### 4. Initialize the database (for live Supabase only)

If you are using a live Supabase backend, run the script located at `supabase/schema.sql` in the **SQL Editor** of your Supabase dashboard to generate the required tables, relationships, and RLS policies.

---

## 💻 Usage & Available Scripts

The project includes preconfigured scripts for daily development and maintenance:

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the local development server with Hot Module Replacement (HMR). |
| `pnpm build` | Compiles and optimizes the application for production into the `dist/` folder. |
| `pnpm preview` | Locally previews the production build. |
| `pnpm test` | Runs the unit test suite with Vitest. |
| `pnpm test:watch` | Runs unit tests in interactive watch mode. |
| `pnpm type-check` | Runs static type checking with `vue-tsc`. |
| `pnpm lint` | Analyzes source code with ESLint. |
| `pnpm format` | Formats source code with Prettier. |

### Start the development environment

```bash
pnpm dev
```

The application will be accessible by default at `http://localhost:5173`.

---

## 📂 Project Structure

The codebase is structured under a clean and modular architecture:

```text
nakama-treasure-chest/
├── docs/                   # Technical documentation, architecture, and notes
├── public/                 # Public static assets
├── src/
│   ├── assets/             # Media resources and images
│   ├── components/         # Domain-organized components
│   │   ├── auth/           # Authentication and profile forms and modals
│   │   ├── calendar/       # Weekly release calendar filters and views
│   │   ├── collection/     # Catalog cards, grids, and search bars
│   │   ├── dashboard/      # Metric cards and summary widgets
│   │   ├── items/          # Type, status, and day selectors, and detail modals
│   │   ├── layout/         # Sidebar, navigation, and base layout containers
│   │   └── ui/             # Reusable UI primitives (Buttons, Inputs, Modals)
│   ├── composables/        # Reusable reactive hooks (useItemForm, useCollectionData, etc.)
│   ├── constants/          # Item constants and metadata
│   ├── data/               # Mock data for local development
│   ├── router/             # Route definitions and navigation guards with Vue Router
│   ├── services/           # HTTP clients, Supabase integration, and external APIs
│   ├── stores/             # Global state management with Pinia (auth, items, crew)
│   ├── types/              # TypeScript contracts and type definitions
│   ├── utils/              # Validators, image compressor, and helper utilities
│   ├── views/              # Top-level page views
│   ├── App.vue             # Root component
│   └── main.ts             # Application entry point
├── supabase/               # SQL schemas, migrations, and Supabase configuration
├── tests/                  # Unit tests with Vitest
├── .env.example            # Environment variables template
└── package.json            # Project dependencies and scripts
```

---

## ❤️ Dedication

<div align="center">

> *"Among so many stories, worlds to discover, and adventures to live...  
> **my greatest treasure is you.**"*  


</div>
