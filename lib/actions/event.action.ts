'use server';

import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectToDatabase();
    const event = await Event.findOne({ slug }).lean();
    if (!event) return [];

    const results = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags }
    }).lean();

    // ✅ ใช้เทคนิคนี้เพื่อเปลี่ยน ObjectId และ Date ให้เป็น String ทั้งหมด
    return JSON.parse(JSON.stringify(results)); 
  } catch (e) {
    console.error(e);
    return [];
  }
};