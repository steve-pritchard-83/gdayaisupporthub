# G'day AI Support Hub

A simple, elegant support ticketing system with knowledge base - built for **vibe coding** and rapid prototyping.

## 🚀 **Features**

- **Support Tickets**: Create, manage, and track support requests
- **Knowledge Base**: Searchable articles and documentation
- **Admin Panel**: Manage tickets and view archived items
- **Real-time Updates**: Live ticket status updates
- **Responsive Design**: Works on mobile and desktop
- **Zero Database Setup**: Uses JSON files for storage

## 🛠️ **Technology Stack**

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Storage**: JSON files (perfect for prototyping)
- **Styling**: CSS modules
- **Icons**: Lucide React
- **Deployment**: Vercel (or any platform)

## 📦 **Quick Start**

### Development
```bash
# Install dependencies
npm install

# Start development servers
npm run dev          # Frontend (localhost:5173)
npm run server:dev   # Backend (localhost:3001)
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm run server
```

## 🗂️ **JSON File Storage**

The system uses simple JSON files for data storage:

- `data/tickets.json` - Support tickets
- `data/articles.json` - Knowledge base articles  
- `data/comments.json` - Ticket comments

Perfect for:
- ✅ Rapid prototyping
- ✅ Zero setup complexity
- ✅ Version control friendly
- ✅ Easy to backup/restore
- ✅ No database dependencies

## 🌐 **API Endpoints**

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket with comments
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/comments` - Add comment
- `PATCH /api/tickets/:id/archive` - Archive ticket
- `PATCH /api/tickets/:id/restore` - Restore ticket
- `DELETE /api/tickets/:id/permanent` - Delete permanently

### Knowledge Base
- `GET /api/articles` - Get all articles
- `POST /api/articles/:id/view` - Increment view count

### System
- `GET /api/health` - Health check

## 🎨 **Default Content**

The system comes with sample content:

**Sample Tickets:**
- Welcome message
- Feature requests
- Bug reports

**Knowledge Articles:**
- Getting Started Guide
- Advanced Tips
- Troubleshooting
- Security & Privacy

## 🚀 **Deployment**

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm install -g vercel
vercel
```

### Manual Server
```bash
# Any Node.js hosting
npm run build
npm run server
```

## 🔧 **Configuration**

### Environment Variables
```env
NODE_ENV=production
PORT=3001
VITE_API_URL=https://your-domain.com
```

### CORS Configuration
Update `server/index.js` for your domain:
```javascript
const corsOptions = {
  origin: ['https://your-domain.com'],
  // ... other options
};
```

## 📁 **Project Structure**

```
gdayai-support-hub/
├── api/                    # Vercel serverless functions
│   ├── tickets.js
│   ├── articles.js
│   └── health.js
├── data/                   # JSON storage files
│   ├── tickets.json
│   ├── articles.json
│   └── comments.json
├── server/                 # Express server
│   ├── index.js
│   └── json-storage.js
├── src/                    # React frontend
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── App.tsx
└── public/                 # Static assets
```

## 🎯 **Use Cases**

Perfect for:
- **Startups**: Quick support system setup
- **Prototyping**: Validate ideas fast
- **Small Teams**: Under 100 users
- **MVPs**: Minimum viable product
- **Learning**: Study full-stack development

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test locally
5. Submit pull request

## 📄 **License**

MIT License - feel free to use for any purpose!

## 🆘 **Support**

- **Issues**: GitHub Issues
- **Docs**: This README
- **Health Check**: `/api/health`

---

**Built with 💙 for rapid prototyping and vibe coding**
