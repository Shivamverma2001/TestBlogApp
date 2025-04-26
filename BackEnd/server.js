import app from "./app.js";
import express from 'express';
import connectDB from "./db.js";
const PORT = process.env.PORT || 5000;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '..', 'FrontEnd', 'dist');
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

