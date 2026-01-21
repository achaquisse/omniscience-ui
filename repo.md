# my-app Repository

## Overview
**my-app** is a React-based web application built with Vite, featuring modern development tooling and a component-based architecture. The project uses Tailwind CSS for styling and includes Supabase integration for backend services.

**Version**: 0.0.0  
**Package Manager**: pnpm 10.24.0

---

## Project Structure
```
my-app/
├── src/
│   ├── assets/           # Static assets
│   ├── components/       # Reusable React components
│   │   └── ui/          # UI component library (cards, inputs, etc.)
│   ├── lib/             # Utility functions and helpers
│   ├── pages/           # Page components
│   │   └── oauth/       # OAuth-related pages
│   ├── App.jsx          # Main App component with routing
│   ├── index.css        # Global styles
│   └── main.jsx         # Application entry point
├── public/              # Static files
├── .zencoder/           # Zencoder configuration
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint configuration
├── jsconfig.json        # JavaScript configuration
├── components.json      # Component library config
├── tailwind.config.js   # Tailwind CSS configuration
├── package.json         # Dependencies and scripts
└── README.md            # Template documentation
```

---

## Technology Stack

### Core Framework
- **React** 19.2.0 - UI library
- **React DOM** 19.2.0 - DOM rendering
- **React Router DOM** 7.12.0 - Client-side routing
- **Vite** 7.2.4 - Build tool and dev server

### Styling
- **Tailwind CSS** 4.1.18 - Utility-first CSS framework
- **@tailwindcss/postcss** 4.1.18 - PostCSS plugin for Tailwind
- **@tailwindcss/vite** 4.1.18 - Vite integration for Tailwind
- **PostCSS** 8.5.6 - CSS transformation
- **Autoprefixer** 10.4.23 - Vendor prefixes
- **tailwind-merge** 3.4.0 - Merge Tailwind class utilities
- **class-variance-authority** 0.7.1 - Component variant management
- **clsx** 2.1.1 - Conditional class names
- **tw-animate-css** 1.4.0 - Animation utilities

### UI Components & Icons
- **@radix-ui/react-slot** 1.2.4 - Radix UI slot component
- **lucide-react** 0.562.0 - Icon library

### Backend & Data
- **@supabase/supabase-js** 2.90.1 - Supabase SDK for backend services

### Development Tools
- **ESLint** 9.39.1 - Code linting
- **@eslint/js** 9.39.1 - ESLint JavaScript rules
- **eslint-plugin-react-hooks** 7.0.1 - React hooks linting
- **eslint-plugin-react-refresh** 0.4.24 - React Fast Refresh plugin
- **@vitejs/plugin-react** 5.1.1 - Vite React plugin
- **@tailwindcss/language-server** 0.14.29 - Tailwind CSS language support
- **@types/react** 19.2.5 - React type definitions
- **@types/react-dom** 19.2.3 - React DOM type definitions
- **@types/node** 25.0.8 - Node.js type definitions
- **globals** 16.5.0 - Global variable definitions

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with Vite HMR |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint to check code quality |
| `pnpm preview` | Preview production build locally |

---

## Key Features

### Routing
- Multi-page application with React Router
- Pages included:
  - **Home** - Main landing page
  - **About** - About page
  - **Login** (OAuth) - OAuth login page
  - **Consent** (OAuth) - OAuth consent page

### Components
- Modular UI components in `src/components/ui/`
- Card component for content layout
- Input component for form fields
- Component variant system using CVA (class-variance-authority)

### Styling
- Tailwind CSS for responsive design
- Custom CSS in `src/index.css`
- Animation utilities included

### Backend Integration
- Supabase SDK for authentication and data management
- Environment configuration via `.env.local`

---

## Environment Configuration
The project uses environment variables stored in `.env.local` for sensitive configuration (such as Supabase API keys).

---

## Development Workflow

1. **Install dependencies**: `pnpm install`
2. **Start development server**: `pnpm dev`
3. **Make code changes** in `src/` directory
4. **Lint your code**: `pnpm lint` before committing
5. **Build for production**: `pnpm build`

---

## Build Output
- **Development**: Hot Module Replacement (HMR) enabled via Vite
- **Production**: Optimized bundle in `dist/` directory

---

## ESLint Configuration
The project uses ESLint with React and React Router plugin support. Configuration located in `eslint.config.js`.

---

## Notes
- Uses JSX syntax for React components
- ES modules (`"type": "module"` in package.json)
- TypeScript type definitions available but not actively using TypeScript
- OAuth integration for authentication flows
