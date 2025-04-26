import app from "./app.js";
import express from 'express';
import connectDB from "./db.js";
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log environment for debugging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);

if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '..', 'FrontEnd', 'dist');
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'));
  });
}

const startServer = async () => {
  try {
    // Try to connect to MongoDB
    await connectDB();
    
    // Only start the server if MongoDB connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('==> Your service is live 🎉');
    });
  } catch (error) {
    console.error('Failed to start the server:');
    console.error(error);
    process.exit(1); // Exit with failure
  }
};

startServer();

