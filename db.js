'use strict';

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
let client = null;
let db     = null;

/**
 * Connects to MongoDB and returns the portfolioDB database instance.
 * @returns {Promise<Db>}
 */
async function connectDB() {
  if (db) return db;
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('portfolioDB');
    console.log('🔌 Connected successfully to MongoDB server');
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
}

/**
 * Returns the active database instance.
 * Throws if connectDB() hasn't been called.
 * @returns {Db}
 */
function getDB() {
  if (!db) throw new Error('Database not initialized. Call connectDB first.');
  return db;
}

/**
 * Gracefully closes the MongoDB connection.
 */
async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db     = null;
    console.log('🔌 MongoDB connection closed gracefully.');
  }
}

module.exports = { connectDB, getDB, closeDB };
