# Discovery-call booking — setup guide

The `/diagnose` lead form books a 30-minute discovery call automatically. On
submit, the server endpoint `server/api/book.post.ts`:

1. Creates an event on **sales@zabble.org**'s Google Calendar.
2. Generates a **Google Meet** link for it.
3. Invites the prospect **and** sales@ — Google emails both the invite and the
   Meet link (`sendUpdates: 'all'`).
4. Sends sales@ a separate **lead-notification email** with the full pain profile.

Until the Google credentials below are set, the form still works end-to-end and
shows the prospect their Operational Pain Profile — it just falls back to a
"email us to book" link instead of auto-booking. Once the env vars are present,
the confirmation flips to **"Your 30-minute call is booked"** with the Meet link.

---

## What you need to do (one-time, ~15 minutes)

This is the only part I can't do for you — it requires your Google account.

### 1. Create a Google Cloud project + enable APIs
1. Go to <https://console.cloud.google.com/> and create a project (e.g. `zabble-booking`).
2. **APIs & Services → Library** → enable both:
   - **Google Calendar API**
   - **Gmail API**

### 2. Create a service account + key
1. **APIs & Services → Credentials → Create credentials → Service account**.
2. Name it (e.g. `zabble-booking-bot`), create, skip the optional role grants.
3. Open the service account → **Keys → Add key → Create new key → JSON**.
4. A JSON file downloads. You'll use two fields from it: `client_email` and
   `private_key`. **Keep this file secret — never commit it.**
5. On the service account's **Details** page, copy the **Unique ID** (a long
   number, the "Client ID"). You need it in the next step.

### 3. Authorise domain-wide delegation (Workspace admin)
The service account needs permission to act as `sales@zabble.org`.

1. Go to the **Google Workspace Admin console** → **Security → Access and data
   control → API controls → Domain-wide delegation → Add new**.
2. **Client ID** = the service account's Unique ID from step 2.5.
3. **OAuth scopes** (comma-separated):
   ```
   https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/gmail.send
   ```
4. Authorise.

> Requires Workspace admin access for zabble.org. You manage the domain, so you
> should have this. If `sales@zabble.org` doesn't exist yet, create it first
> (Admin console → Directory → Users), or point `NUXT_GOOGLE_IMPERSONATED_USER`
> at a mailbox that does.

### 4. Set the environment variables
Copy the values into your env. Locally, create `.env` (git-ignored) from
`.env.example`. In production, add them in **Vercel → Project → Settings →
Environment Variables**.

| Variable | Value |
|----------|-------|
| `NUXT_GOOGLE_CLIENT_EMAIL` | the JSON `client_email` |
| `NUXT_GOOGLE_PRIVATE_KEY` | the JSON `private_key` (see note below) |
| `NUXT_GOOGLE_IMPERSONATED_USER` | `sales@zabble.org` |
| `NUXT_SALES_NOTIFY_EMAIL` | `sales@zabble.org` |
| `NUXT_BOOKING_TIMEZONE` | `Africa/Johannesburg` |
| `NUXT_BOOKING_DURATION_MINUTES` | `30` |

**Private key formatting:** the JSON `private_key` contains real newlines. For a
`.env` file, put it on one line with the newlines written as literal `\n` and
wrap the whole thing in double quotes. In the Vercel dashboard you can paste the
multi-line value directly — both forms are handled (the code converts `\n`).

---

## Verifying it works
1. With the env vars set, run `npm run dev`, open `/diagnose`, complete the form
   with a **real email you can check**, pick a date/time, and submit.
2. You should see the **"Your 30-minute call is booked"** confirmation with a
   **Join with Google Meet** button.
3. Check: the event appears on sales@zabble.org's calendar, both inboxes get the
   invite, and sales@ gets the lead-notification email.

If submitting shows the fallback ("We couldn't lock the time in automatically"),
the credentials aren't being read — check the dev-server console for a
`[book]` warning and confirm the env vars are present.

---

## Notes & possible follow-ups
- **Availability isn't checked against the live calendar yet.** The time-slots
  are a fixed 9:00–4:30 grid in `Africa/Johannesburg`; a prospect could book a
  slot that's already busy. Adding a Calendar free/busy check before showing
  slots is the natural next step if double-booking becomes an issue.
- **Timezone** is fixed to the business's zone (SAST, no DST) and labelled in the
  UI. If you start booking across very different timezones, consider detecting
  the visitor's zone and converting.
- The service account's JSON key is a long-lived secret. Rotate it from the
  Cloud console if it's ever exposed.
