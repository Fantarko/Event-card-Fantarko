import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Event, { type IEvent } from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{ slug?: string }>;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * GET /api/events/[slug]
 * Fetch a single event by slug.
 */
export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { slug } = await context.params;

    // Guard against missing or non-string route params before hitting the DB.
    if (typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { message: "Missing required event slug." },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();

    if (!SLUG_PATTERN.test(normalizedSlug)) {
      return NextResponse.json(
        {
          message:
            "Invalid slug format. Use lowercase letters, numbers, and hyphens only.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.findOne({ slug: normalizedSlug })
      .lean<IEvent>()
      .exec();

    if (!event) {
      return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          message: "Validation error while fetching event.",
          errors: Object.values(error.errors).map(
            (validationError) => validationError.message
          ),
        },
        { status: 400 }
      );
    }

    console.error("Failed to fetch event by slug:", error);
    return NextResponse.json(
      { message: "Unexpected server error while fetching event." },
      { status: 500 }
    );
  }
}
