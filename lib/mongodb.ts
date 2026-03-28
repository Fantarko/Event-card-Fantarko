import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseCache {
  conn: typeof mongoose | null;
  /** Pending connection promise, reused if a connection attempt is already in flight. */
  promise: Promise<typeof mongoose> | null;
}

/**
 * In development, Next.js hot-reloads clear the module cache on every change,
 * which would create a new Mongoose connection on each reload and quickly
 * exhaust the MongoDB connection pool. Storing the cache on `globalThis`
 * keeps it alive across hot reloads because the global scope is not cleared.
 * In production modules are only loaded once, so this has no effect there.
 */
declare global {
  // `var` is required here — `let`/`const` cannot be used to augment globalThis.
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = (globalThis.mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URL) {
    throw new Error(
      "MONGODB_URL is not defined. Add it to your .env.local file."
    );
  }

  // Return the existing connection immediately if one is already established.
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection attempt is in progress, start one.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      // Disable Mongoose's internal command buffering. Without this, Mongoose
      // silently queues operations while disconnected. Disabling it causes
      // operations to fail fast and loudly if the DB is unreachable.
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the failed promise so the next call to connectToDatabase() can
    // attempt a fresh connection rather than awaiting a rejected promise.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
