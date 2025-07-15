# G'day AI Support Hub

> **Modern ticketing system for managing staff support requests related to AI tool access**

[![Deploy to GitHub Pages](https://github.com/steve-pritchard-83/gdayaisupporthub/actions/workflows/deploy.yml/badge.svg)](https://github.com/steve-pritchard-83/gdayaisupporthub/actions/workflows/deploy.yml)

**Live Demo**: [https://steve-pritchard-83.github.io/gdayaisupporthub/](https://steve-pritchard-83.github.io/gdayaisupporthub/)

## 🎯 Overview

A comprehensive support ticketing system built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. Features a complete admin dashboard, knowledge base, and modern responsive design with strict **yellow branding** compliance.

### ✨ Key Features

- 🎫 **Public Ticketing System** - Create, view, search, and filter support tickets
- 🛡️ **Admin Dashboard** - Complete analytics, bulk operations, and data export
- 📚 **Knowledge Base** - Searchable FAQ system with 5 pre-loaded articles
- 🔐 **Authentication** - Admin login with 24-hour sessions
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- 💾 **Data Persistence** - localStorage with comprehensive error handling
- 🎨 **Design System** - 8-point grid system with strict yellow branding

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git for version control

### Development Setup
```bash
# Clone the repository
git clone https://github.com/steve-pritchard-83/gdayaisupporthub.git
cd gdayaisupporthub

# Install dependencies
npm install

# Start development server
npm run dev
```

### Verify Installation
1. **Visit**: http://localhost:3000
2. **Test Public Features**: Create tickets, view tickets, browse knowledge base
3. **Test Admin Access**: 
   - Navigate to `/admin/login`
   - Email: `steve.pritchard@discoveryparks.com.au`
   - Password: `123456`
   - Verify dashboard and bulk operations work

## 🛡️ Admin Features

### Authentication
- **Hardcoded Credentials** (POC): `steve.pritchard@discoveryparks.com.au` / `123456`
- **Session Duration**: 24 hours with automatic expiration
- **Security**: Session validation on all admin routes

### Dashboard Capabilities
- **Analytics**: Real-time ticket statistics and trends
- **Bulk Operations**: Multi-select ticket management
- **Data Export**: Download ticket data for external analysis
- **Status Management**: Update ticket statuses in bulk

## 🎨 Design System

### Branding Guidelines
- **Company**: G'day Group
- **Color**: Strict yellow branding (#ffdd00)
- **Logo**: G'day Holiday Parks (yellow shape, grey text)
- **Typography**: Segoe UI system font

### Design Principles
- **8-Point Grid**: Mathematical spacing system (8px, 16px, 24px, etc.)
- **Consistent Icons**: White icons on yellow backgrounds
- **Readable Text**: Black text on yellow backgrounds
- **Professional Layout**: Clean, modern interface design

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **Storage**: localStorage with error handling
- **Icons**: Lucide React icon library

### Project Structure
```
supporthubv2/
├── app/                     # Next.js App Router pages
│   ├── page.tsx            # Home dashboard
│   ├── create/page.tsx     # Create ticket form
│   ├── tickets/page.tsx    # View/manage tickets
│   ├── knowledge/page.tsx  # FAQ knowledge base
│   └── admin/              # Admin-only pages
├── components/             # Reusable UI components
├── types/                  # TypeScript interfaces
├── utils/                  # Utility functions
└── public/                 # Static assets
```

## 🚀 Deployment

### GitHub Pages (Automatic)
This repository is configured for automatic deployment to GitHub Pages:

1. **Push to main branch** triggers automatic deployment
2. **GitHub Actions** builds and deploys the static site
3. **Live URL**: [https://steve-pritchard-83.github.io/gdayaisupporthub/](https://steve-pritchard-83.github.io/gdayaisupporthub/)

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy to GitHub Pages (if configured)
npm run deploy
```

## 📋 Project Status

### Current State: ✅ Complete and Functional
- All core features implemented and tested
- Responsive design across all device sizes
- Admin dashboard with full functionality
- Knowledge base with search and filtering
- Comprehensive error handling and data persistence

### Design System: ✅ Refined and Consistent
- 8-point grid system implemented
- Strict yellow branding throughout
- Segoe UI typography for Windows consistency
- Apple Touch Icon favicon support

## 🔧 Development Guidelines

### Code Standards
- **TypeScript**: All components use TypeScript interfaces
- **Error Handling**: Try-catch blocks with graceful fallbacks
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Pattern**: Functional components with React hooks

### Contributing
1. Check established patterns in existing components
2. Follow 8-point grid spacing system
3. Use yellow branding (`bg-accent`, `text-white` on yellow, `text-black` on yellow)
4. Test on mobile, tablet, and desktop viewports
5. Update documentation when making architectural changes

## 📚 Documentation

- **CHANGELOG.md** - Complete project history and changes
- **PROJECT_MEMORY.md** - Technical decisions and architecture context
- **QUICK_START.md** - Rapid setup and verification guide

## 🏢 Business Context

**Company**: G'day Group  
**Purpose**: AI tool access request management  
**Target Users**: Staff members requesting AI tool access  
**Admin Users**: IT support team managing requests  

## 📄 License

This project is developed for G'day Group internal use.

---

**Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS** 