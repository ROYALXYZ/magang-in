import 'dotenv/config'; // Load env vars first
import app from './app.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Try to connect to Database
    await prisma.$connect();
    console.log('Successfully connected to the database.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
