import React from 'react'
import ExploreBtn from '@/components/ExploreBtn'
import EventCard from '@/components/EventCard'
import { events } from '@/lib/constants'
import { IEvent } from '@/database'
import { cacheLife } from 'next/cache'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async() => {
'use cache';
cacheLife('hours'); // กำหนดอายุของแคชเป็น 1 ชั่วโมง (สามารถปรับได้ตามต้องการ)
// page.tsx
const response = await fetch(`${BASE_URL}/api/events`, { cache: 'no-store' });
const data = await response.json();
const events = data.events; // ดึงเฉพาะอาเรย์ออกมา

  return (
  <section>
    <h1 className='text-center'>The Hub for Every Dev<br /> Event You can't Miss</h1>
    <p className='text-center mt-5'>Hackthons, Meetups, and Conferences, All in One Place</p>

    <ExploreBtn />
    <div className="mt-20 space-y-7">
      <h3>Featured Events</h3>

      <ul className='events list-none'>
          {events && events.length > 0 && events.map((event:IEvent)=>(
             <li key={event.title}>
              <EventCard {...event} />
             </li>

          ))}
      </ul>
    </div>
  </section>
  )
}

export default Page
