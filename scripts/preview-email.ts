// Render the lead confirmation email with sample data → docs/email-preview.html
// Run: node scripts/preview-email.ts   (Node ≥23 strips the TS types natively)
import { writeFileSync } from 'node:fs'
import { renderLeadConfirmationEmail } from '../server/utils/emails.ts'

const mail = renderLeadConfirmationEmail({
  name: 'Thomas Strever',
  dateLabel: 'Wednesday, June 10',
  timeLabel: '2:30 PM',
  timeZoneLabel: 'Johannesburg · UTC+2',
  meetLink: 'https://meet.google.com/qvx-agah-bye',
  profileTitle: "The strain isn't in one place — it's in how the whole operation runs.",
  durationMin: 30,
})

writeFileSync('docs/email-preview.html', mail.html)
console.log('Subject:', mail.subject)
console.log('Wrote docs/email-preview.html')
