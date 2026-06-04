# Email Templates (owned by S04)

Scaffolding, not spray. **Personalise the first two lines** with something the
recipient actually published. Placeholders: `{{first_name}}`, `{{publication}}`,
`{{recent_piece}}`, `{{sender}}`, `{{sender_title}}`. Signature pulls NAP from
`app/data/nap.ts` once B6 lands. Keep it short; one ask; one link.

---

## T1 — Media / resource pitch (Angle 1: the reference asset)

**Subject:** A free reference map of SA operations software

> Hi {{first_name}},
>
> I read {{recent_piece}} in {{publication}} — {{one specific, genuine line}}.
>
> We've just published a reference we think your readers would find useful: a plain
> map of the operational-software categories South African businesses run, what each
> does, and where building custom actually beats buying. It's free, un-gated, and
> made to be cited:
> https://zabble.org/insights/south-african-operations-software-landscape
>
> If it's helpful as background — or you'd like the build-vs-buy framework as a short
> guest piece — happy to tailor it to {{publication}}.
>
> Best,
> {{sender}}, {{sender_title}}, Zabble

---

## T2 — Industry outcome story (Angle 3: vertical media / associations)

**Subject:** How a {{industry}} team cut {{metric}} with a custom system

> Hi {{first_name}},
>
> Quick one for {{publication}}'s {{industry}} audience. We build bespoke operational
> systems for South African businesses; one recent example took {{specific outcome,
> e.g. "document intake from forty minutes to under four seconds"}} for a {{industry}}
> operator.
>
> There's a non-promotional write-up of the pattern here: https://zabble.org/industries/{{industry-slug}}
> — happy to share specifics or put you in touch with the operator for a story.
>
> Best,
> {{sender}}, Zabble

---

## T3 — Directory / citation profile (Angle 4 / foundation)

Use the listing form, not email, where possible. Where a profile needs a blurb,
paste the boilerplate from `app/data/nap.ts` (`NAP.description`) **verbatim** so NAP
stays consistent.

---

## T4 — Partner / vendor cross-link (Angle 5)

**Subject:** Featuring {{partner}} on our build

> Hi {{first_name}},
>
> We reference {{partner}} as part of how we build {{system/Kairos}}. We'd love to
> mention you on the relevant page and would be glad if it works both ways — a "built
> with / partner" link where it fits your site.
>
> Page: {{zabble_url}}. Let me know if you'd like any wording changed.
>
> Best,
> {{sender}}, Zabble

---

## T5 — Client case-study link (Angle 3, with permission)

**Subject:** Quick permission — featuring our work together

> Hi {{first_name}},
>
> We'd like to write up the {{system}} we built for you (anonymised if you prefer).
> If you're open to it, a small "built by Zabble" credit/link on your site helps us a
> lot — entirely your call, and we'll share the draft first.
>
> Best,
> {{sender}}, Zabble

---

## Follow-up (once, after ~5 working days)

> Hi {{first_name}}, floating this back up in case it's useful — no worries if not.
> The reference is here if helpful: {{link}}. Best, {{sender}}.
