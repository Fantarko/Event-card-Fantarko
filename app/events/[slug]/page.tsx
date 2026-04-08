import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import BookEvent from "@/components/BookEvent";
import { getSimilarEventsBySlug } from "@/lib/actions/event.action";
import { IEvent } from "@/database";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ✅ แก้ Image Aspect Ratio โดยใส่ style height: auto
const EventDetailItem = ({ icon, alt, label }: { icon: string, alt: string, label: string }) => (
  <div className="flex-row-gap-2 items-center">
    <Image 
      src={icon} 
      alt={alt} 
      width={17} 
      height={17} 
      style={{ height: 'auto' }} 
    />
    <p>{label}</p>
  </div>
);

const EventAgeda = ({ agendaItem }: { agendaItem: string[] }) => {
  const items = Array.isArray(agendaItem) ? agendaItem : [];
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>{tag}</div>
    ))}
  </div>
);

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  // ✅ 1. Await params ให้เรียบร้อย
  const { slug } = await params;

  // ✅ 2. Fetch ข้อมูล (แนะนำว่าในอนาคตควรใช้ Action แทน fetch API ตัวเองจะเร็วกว่า)
  const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
    cache: 'no-store' // ป้องกันข้อมูลเก่าค้าง
  });

  if (!response.ok) return notFound();
  
  const data = await response.json();
  const event = data.event;

  if (!event || !event.description) return notFound();

  // ✅ 3. ดึง Similar Events และทำการ Serialize (แปลง ObjectId/Date เป็น String)
  const rawSimilarEvents: IEvent[] = await getSimilarEventsBySlug(slug);
  const similarEvents = JSON.parse(JSON.stringify(rawSimilarEvents));

  const bookings = 10;

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{event.description}</p>
      </div>

      <div className="details">
        {/* ด้านซ้าย */}
        <div className="content">
          <Image 
            src={event.image} 
            alt="Event Banner" 
            width={800} 
            height={800} 
            className="banner"
            priority // เพิ่ม priority ให้รูปหลักโหลดเร็วขึ้น
            style={{ height: 'auto' }}
          />
          
          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{event.overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={event.date} />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={event.time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={event.location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={event.mode} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={event.audience} />
          </section>

          <EventAgeda agendaItem={event.agenda} />

          <section className="flex-col-gap-2">
            <h2>About The Organizer</h2>
            <p>{event.organizer}</p>
          </section>

          <EventTags tags={event.tags} />
        </div>

        {/* ด้านขวา */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}
            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 ? (
            similarEvents.map((ev: IEvent) => (
              <EventCard key={ev.slug} {...ev} />
            ))
          ) : (
            <p>No similar events found.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;
