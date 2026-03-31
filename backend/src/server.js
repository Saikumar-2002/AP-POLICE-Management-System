import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import db from './config/database.js';

const PORT = process.env.PORT || 3001;

// Initialize database
db.init();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
