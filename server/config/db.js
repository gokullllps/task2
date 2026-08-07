import mongoose from 'mongoose';

let mongoMemoryServer = null;

const sanitizeUri = (uri) => {
  if (!uri) return 'NONE';
  return uri.replace(/:([^@]+)@/, ':***@');
};

const connectDB = async () => {
  // Determine which environment variable provides the connection string
  let uriSource = 'LOCAL_DEFAULT';
  let primaryUri = 'mongodb://127.0.0.1:27017/todoapp';

  if (process.env.MONGODB_URI) {
    uriSource = 'process.env.MONGODB_URI';
    primaryUri = process.env.MONGODB_URI;
  } else if (process.env.MONGO_URI) {
    uriSource = 'process.env.MONGO_URI';
    primaryUri = process.env.MONGO_URI;
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

  console.log(`[Database Audit] Connection URI Source: ${uriSource}`);
  console.log(`[Database Audit] Connection Target: ${sanitizeUri(primaryUri)}`);
  console.log(`[Database Audit] Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 15000, // 15s for cloud Atlas DNS & SSL handshake
      maxPoolSize: 50,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });

    console.log(`[Database Success] MongoDB Connected to host: ${conn.connection.host}`);
    return conn;
  } catch (primaryError) {
    console.error('====================================================');
    console.error('DATABASE CONNECTION ERROR DIAGNOSTICS');
    console.error('====================================================');
    console.error(`URI Source : ${uriSource}`);
    console.error(`Target Host: ${sanitizeUri(primaryUri)}`);
    console.error(`Error Name : ${primaryError.name}`);
    console.error(`Error Code : ${primaryError.code || 'N/A'}`);
    console.error(`Error Msg  : ${primaryError.message}`);
    console.error(`Error Stack:\n${primaryError.stack}`);
    console.error('====================================================');

    // IN PRODUCTION: Production MUST ONLY use MongoDB Atlas / Real Database.
    // Do NOT attempt mongodb-memory-server fallback in production.
    if (isProduction) {
      console.error('[Database Error] Production environment detected. In-Memory fallback disabled.');
      console.error('[Database Error] Please set a valid MONGODB_URI in Render dashboard matching your MongoDB Atlas connection string.');
      throw primaryError;
    }

    // IN DEVELOPMENT: Fallback to MongoMemoryServer for offline local development
    console.log('[Database] Initializing Local Development In-Memory MongoDB Server fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database Success] Local In-Memory Fallback Connected: ${conn.connection.host}`);
      return conn;
    } catch (fallbackError) {
      console.error('[Database Error] Local In-Memory fallback failed:', fallbackError.message);
      throw primaryError;
    }
  }
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;
