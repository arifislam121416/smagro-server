const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is missing from .env"
  );
}

const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();

    db = client.db(
      process.env.DB_NAME
    );

    console.log(
      "MongoDB connected successfully"
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error
    );

    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error(
      "Database is not connected"
    );
  }

  return db;
}

module.exports = {
  connectDB,
  getDB,
};