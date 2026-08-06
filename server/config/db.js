import mongoose from 'mongoose';

let mongoMemoryServer = null;

const connectDB = async () => {
  // Disable query buffering so Mongoose fails fast or succeeds cleanly instead of hanging 10s
  mongoose.set('bufferCommands', false);

  const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todoapp';

  try {
    // Attempt connection to primary MongoDB
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (primaryError) {
    console.error("Primary MongoDB connection failed:");
    console.error(primaryError);
    console.error(primaryError.stack);
    console.log('[Database] Initializing resilient In-Memory MongoDB Server fallback...');

    try {
      // Dynamic import of MongoMemoryServer
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database Success] In-Memory MongoDB fallback Connected: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error('[Database Error] Could not start In-Memory MongoDB fallback:', fallbackError.message);
    }
  }
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;
