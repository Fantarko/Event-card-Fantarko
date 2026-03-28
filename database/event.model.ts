import mongoose, { Model, Schema } from "mongoose";

// Using a plain interface (not extending Document) is the Mongoose 9+ recommended
// pattern. HydratedDocument<IEvent> (returned by model queries) adds all Mongoose
// document methods on top of this shape automatically.
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  // Literal union provides compile-time exhaustiveness checking for mode values.
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Converts a title to a URL-friendly slug: "Next.js Summit 2024!" → "nextjs-summit-2024" */
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // strip non-alphanumeric characters
    .replace(/\s+/g, "-")          // collapse whitespace to a single hyphen
    .replace(/-+/g, "-")           // collapse consecutive hyphens
    .replace(/^-|-$/g, "");        // strip leading / trailing hyphens
}

/**
 * Normalizes a date string to ISO format (YYYY-MM-DD).
 * Multi-day ranges like "June 14–16, 2024" cannot be parsed to a single Date,
 * so they are stored as-is rather than throwing a validation error.
 */
function normalizeDate(raw: string): string {
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? raw : parsed.toISOString().split("T")[0];
}

/** Standardizes spacing around the range separator: "9:00AM-6:00PM" → "9:00AM - 6:00PM" */
function normalizeTime(raw: string): string {
  return raw.trim().replace(/\s*-\s*/g, " - ");
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    // Auto-populated by the pre-save hook; callers should not set this field.
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: 'Mode must be "online", "offline", or "hybrid"',
      },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (items: string[]) => items.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (items: string[]) => items.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Pre-save hook
// ---------------------------------------------------------------------------

eventSchema.pre("save", function (next) {
  // Regenerate slug only when the title changes to preserve any existing
  // inbound links. isNew covers the first-save case (all fields are "modified").
  if (this.isNew || this.isModified("title")) {
    this.slug = toSlug(this.title);
  }

  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }

  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }

  next();
});

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

// Guard against "Cannot overwrite model once compiled" errors thrown when
// Next.js hot-reloads re-execute this module while the Mongoose connection
// (and its model registry) persists across reloads.
const Event =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>("Event", eventSchema);

export default Event;
