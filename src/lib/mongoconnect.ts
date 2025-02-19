import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Check Your ENV');
}

const uri = process.env.MONGODB_URI;

let mongooseConn: mongoose.Connection;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongooseClient?: mongoose.Connection;
  };

  if (!globalWithMongo._mongooseClient) {
    globalWithMongo._mongooseClient = mongoose.createConnection(uri, {
    });
  }
  mongooseConn = globalWithMongo._mongooseClient;
} else {
  mongooseConn = mongoose.createConnection(uri, {
  });
}

export default mongooseConn;
