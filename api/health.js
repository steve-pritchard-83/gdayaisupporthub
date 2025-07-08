// Ultra-simple health check
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    status: 'healthy',
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    turso_configured: !!process.env.TURSO_DATABASE_URL
  });
} 