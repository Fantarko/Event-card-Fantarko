// Event must be exported (and therefore registered in mongoose.models) before
// Booking, because Booking's pre-save hook looks up mongoose.models.Event to
// validate the foreign-key reference. Importing this file guarantees the
// correct registration order regardless of where in the app it is used.
export { default as Event } from "./event.model";
export { default as Booking } from "./booking.model";

// Re-export interfaces so consumers can type their variables without importing
// from the individual model files.
export type { IEvent } from "./event.model";
export type { IBooking } from "./booking.model";
