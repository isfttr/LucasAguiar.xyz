# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Node.js utility scripts of this Hugo static site. The client-side PostHog snippet was already present in `layouts/_default/baseof.html`. This integration adds **server-side event tracking** to the two Node.js CLI scripts (`scripts/translate.js` and `scripts/fix-links.js`) using the `posthog-node` SDK.

**Changes made:**

- Installed `posthog-node` as a dependency
- Added `POSTHOG_API_KEY` and `POSTHOG_HOST` to `.env`
- Added PostHog initialization to both scripts with `flushAt: 1` and `flushInterval: 0` (appropriate for short-lived CLI processes) and `enableExceptionAutocapture: true`
- Added `posthog.capture()` calls for meaningful script actions
- Added `posthog.captureException()` calls for error tracking
- Added `await posthog.shutdown()` at the end of each script to ensure all events are flushed before process exit

| Event | Description | File |
|-------|-------------|------|
| `translation_file_translated` | Fired when a content file is successfully translated | `scripts/translate.js` |
| `translation_rate_limit_hit` | Fired when the Gemini API returns a 429 rate limit error | `scripts/translate.js` |
| `translation_failed` | Fired when a file translation fails after all retries are exhausted | `scripts/translate.js` |
| `translation_sync_completed` | Fired when the full translation sync run finishes | `scripts/translate.js` |
| `links_fixed` | Fired when markdown links are fixed in a content file | `scripts/fix-links.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/404499/dashboard/1531243)
- [Translation runs over time](https://us.posthog.com/project/404499/insights/RbzEoOvI)
- [Translation sync completions](https://us.posthog.com/project/404499/insights/N2nStwQF)
- [Translation failures and rate limits](https://us.posthog.com/project/404499/insights/b45qMGeA)
- [Translation success vs failure funnel](https://us.posthog.com/project/404499/insights/V8WZS9F0)
- [Files with links fixed over time](https://us.posthog.com/project/404499/insights/jcHrF2xv)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
