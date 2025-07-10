# G'day AI Support Hub

A simple, elegant support ticketing system with knowledge base - built for **vibe coding** and rapid prototyping.

## 🚀 Live Demo

Visit the live demo at: **https://steve-pritchard-83.github.io/gdayaisupporthub/**

## ✨ Features

- **Support Tickets**: Create, manage, and track support tickets
- **Knowledge Base**: Browse helpful articles and documentation
- **Admin Panel**: Manage tickets and articles (admin authentication)
- **Local Storage**: All data persists in your browser's local storage
- **Responsive Design**: Works great on desktop and mobile
- **Real-time Updates**: Local state management with instant updates

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: CSS with modern design
- **Icons**: Lucide React
- **Storage**: Browser localStorage (perfect for demos and prototypes)
- **Deployment**: GitHub Pages

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/steve-pritchard-83/gdayaisupporthub.git
cd gdayaisupporthub
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## 🚀 Deployment

The project is configured for automatic deployment to GitHub Pages:

1. **Automatic**: Push to main branch triggers GitHub Actions workflow
2. **Manual**: Run `npm run deploy` to deploy manually

## 🎯 Usage

### For Users
- **Submit Tickets**: Fill out the ticket form with your issue details
- **Browse Knowledge Base**: Search for helpful articles and guides
- **Track Progress**: View ticket status and comments

### For Admins
- **Access Admin Panel**: Use the admin selector to switch to admin mode
- **Manage Tickets**: Update status, add comments, archive tickets
- **Manage Articles**: Create, edit, and delete knowledge base articles

## 📦 Data Storage

This project uses **localStorage** for data persistence:
- Perfect for prototypes and demos
- Data persists between browser sessions
- No server or database required
- Easy to reset by clearing browser data

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── context/       # React Context providers
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets
```

## 🎨 Customization

This project is designed for **vibe coding** - easy customization and rapid iteration:

- **Colors**: Update CSS variables in `src/index.css`
- **Components**: All components are in `src/components/`
- **Data**: Modify default data in `src/utils/localStorage.ts`
- **Styling**: Simple CSS files next to components

## 🤝 Contributing

This is a prototyping project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React and TypeScript
- Icons by Lucide
- Deployed on GitHub Pages
- Perfect for vibe coding and rapid prototyping!

---

**Happy coding!** 🎉