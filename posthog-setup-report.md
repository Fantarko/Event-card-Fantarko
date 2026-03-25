<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of your project. PostHog analytics have been added to the DevEvents Next.js App Router application. The `posthog-js` package was installed and initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+). A reverse proxy was configured in `next.config.ts` to route PostHog requests through `/ingest`, improving ad-blocker resilience. Event tracking was added to two key user interaction points: the "Explore Events" CTA button and the event listing cards.

| Event Name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the 'Explore Events' button on the homepage hero section to scroll down to the events listing | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on an event card to navigate to the event detail page, with event title, slug, location, and date as properties | `components/EventCard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/356207/dashboard/1397144)
- [Explore Events Button Clicks](https://us.posthog.com/project/356207/insights/PfHFhfs8)
- [Event Card Clicks](https://us.posthog.com/project/356207/insights/Omnr1lPt)
- [All Events Overview](https://us.posthog.com/project/356207/insights/ZEC20ajr)
- [Explore to Event Click Funnel](https://us.posthog.com/project/356207/insights/9xmm0I2q)
- [Most Clicked Events by Title](https://us.posthog.com/project/356207/insights/94WauwH7)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
