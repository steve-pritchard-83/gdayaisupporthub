# Quick Start Guide - G'day AI Support Hub

**🌐 Live Demo**: [https://steve-pritchard-83.github.io/gdayaisupporthub/](https://steve-pritchard-83.github.io/gdayaisupporthub/)

## 🚀 Immediate Setup (2 minutes)

### Prerequisites Check
- [ ] Node.js installed
- [ ] Terminal access to project directory
- [ ] Code editor available
- [ ] Optional: `apple-touch-icon.png` file for favicon (place in `public/` directory)

### Start Development Server
```bash
cd supporthubv2
npm install
npm run dev
```

### Verify Everything Works
1. **Visit**: http://localhost:3000
2. **Test Public Features**: Create a ticket, view tickets, browse knowledge base
3. **Test Admin Access**: 
   - Go to `/admin/login`
   - Use: steve.pritchard@discoveryparks.com.au / 123456
   - Verify dashboard and bulk operations

### Quick Status Check
- [ ] Home page loads with G'day logo (yellow shape, theme-aware text)
- [ ] Theme toggle works (sun/moon icon in header)
- [ ] Can create tickets with email validation
- [ ] Can view tickets with search/filter
- [ ] Knowledge base shows 5 FAQ articles
- [ ] Admin login works
- [ ] Admin dashboard shows analytics and email addresses
- [ ] Only admin can edit/delete tickets (public users view-only)

## 🔧 Current Project State
- **Status**: ✅ Complete and functional with light/dark theme system
- **Company**: G'day Group
- **Tech Stack**: Next.js 14, TypeScript, Tailwind, localStorage
- **Font**: Segoe UI (system font)
- **Design**: 8-point grid system, strict yellow branding
- **Themes**: Light/dark mode toggle with persistence
- **Admin Access**: Hardcoded credentials (POC)
- **Email Integration**: User emails captured for Teams outreach

**If any issues**: Check PROJECT_MEMORY.md for full context and troubleshooting. 