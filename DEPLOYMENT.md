# Production Deployment Guide

## Minimum Production Solution: Node.js + SQLite + Socket.io

This is the **minimum viable production solution** for your support ticket system.

### **What You Get**
- ✅ Persistent SQLite database
- ✅ Real-time updates via Socket.io
- ✅ REST API for all operations
- ✅ Production-ready for 50-100 users
- ✅ Single server deployment
- ✅ Zero external dependencies

### **Quick Start**

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development**
```bash
# Terminal 1: Start backend server
npm run server:dev

# Terminal 2: Start frontend dev server
npm run dev
```

3. **Build for Production**
```bash
npm run build
```

4. **Start Production Server**
```bash
NODE_ENV=production npm run server
```

### **Production Deployment Options**

#### **Option 1: Simple VPS/Cloud Server**
1. Upload project to server
2. Install Node.js (v18+)
3. Run: `npm install --production`
4. Run: `npm run build`
5. Start: `NODE_ENV=production PORT=80 npm run server`

#### **Option 2: Corporate Server**
1. Copy built files to corporate web server
2. Configure proxy to Node.js backend
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   ```

#### **Option 3: Docker Deployment**
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "server"]
```

### **Environment Variables**

Create `.env` file:
```
NODE_ENV=production
PORT=3001
```

For frontend, create `.env`:
```
VITE_API_URL=http://your-server:3001
```

### **Database**
- SQLite database file: `support_tickets.db`
- Automatically created on first run
- Backup: Simply copy the `.db` file

### **Features**
- **Users**: Submit tickets via web form
- **Admins**: Manage tickets, add comments, update status
- **Real-time**: Live updates when tickets change
- **Knowledge Base**: Built-in help articles
- **Responsive**: Works on mobile/desktop

### **Scaling**
This solution handles:
- 50-100 concurrent users
- 10,000+ tickets
- Real-time updates
- File storage up to 1GB

### **Security**
- CORS configured for production
- SQL injection protected
- Input validation
- XSS protection

### **Cost**
- **Server**: $5-20/month (VPS)
- **Domain**: $10/year (optional)
- **Total**: ~$60-240/year

### **Maintenance**
- **Backup**: Copy `.db` file daily
- **Updates**: `npm update` monthly
- **Monitoring**: Built-in health check at `/api/health`

### **Troubleshooting**

**Server won't start:**
```bash
# Check Node.js version
node --version  # Should be 18+

# Check port availability
netstat -tlnp | grep 3001
```

**Database issues:**
```bash
# Check database file permissions
ls -la support_tickets.db

# Reset database (WARNING: deletes all data)
rm support_tickets.db
```

**Frontend can't connect:**
- Check API URL in browser console
- Verify CORS settings
- Ensure backend is running

### **Support**
- Health check: `http://your-server:3001/api/health`
- API docs: See server code for all endpoints
- Database: Standard SQLite tools

This is a **production-ready** solution requiring minimal setup and maintenance. 