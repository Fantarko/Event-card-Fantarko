import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const bookingSchema = new Schema<IBooking>(
  {
    // Indexed for efficient queries like "fetch all bookings for event X".
    // ref: "Event" enables Mongoose .populate() calls on this field.
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Pre-save hook
// ---------------------------------------------------------------------------

// Verify the referenced event exists before persisting a booking.
// mongoose.models is used instead of a direct import of the Event model to
// avoid a circular dependency (booking → event → index → booking).
bookingSchema.pre("save", async function () {
  // Skip the DB round-trip on updates that do not change the event reference.
  if (!this.isNew && !this.isModified("eventId")) return;

  // The Event model must be registered before any Booking can be saved.
  // This is guaranteed when models are imported through database/index.ts,
  // which exports Event before Booking.
  const EventModel = mongoose.models.Event as
    | Model<Document>
    | undefined;

  if (!EventModel) {
    throw new Error(
      'Event model is not registered. Import from "database/index.ts" to ensure correct load order.'
    );
  }

  const exists = await EventModel.exists({ _id: this.eventId });

  if (!exists) {
    throw new Error(`No event found with ID "${this.eventId}".`);
  }
});

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

// Guard against "Cannot overwrite model once compiled" errors caused by
// Next.js hot-reloads re-executing this module.
const Booking =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
