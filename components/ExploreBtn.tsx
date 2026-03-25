'use client'
import React from 'react'
import posthog from 'posthog-js'

const ExploreBtn = () => {
  return (
    <button type='button' id='explore-btn' className='mt-7 mx-auto' onClick={()=> { console.log("i am bathman"); posthog.capture('explore_events_clicked'); }}>ExploreBtn
        <a href="#events">Explore Events
        <img src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24}/>
        </a>
    </button>
  )
}

export default ExploreBtn
