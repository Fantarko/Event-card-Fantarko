'use server';

import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    // ✅ หา event หลัก
    const event = await Event.findOne({ slug }).lean();
    if (!event) return [];

    // ✅ กันกรณีไม่มี tags
    if (!event.tags || event.tags.length === 0) return [];

    // ✅ หา event ที่คล้ายกัน
    const results = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .sort({ createdAt: -1 }) // 🔥 ใหม่ก่อน
      .limit(4) // 🔥 จำกัดจำนวน
      .lean();

    return results;
  } catch (e) {
    console.error("Similar Events Error:", e);
    return [];
  }
};