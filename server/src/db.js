import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import config from './config.js';

let memoryServer;

export async function connectDb() {
  let uri = config.mongo.uri;
  if (config.mongo.useMemoryDb) {
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('[db] Using in-memory MongoDB');
  }
  await mongoose.connect(uri);
  console.log('[db] Connected to MongoDB');
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
