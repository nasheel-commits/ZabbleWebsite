<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type Component } from 'vue'
import {
  Building2,
  CalendarCheck,
  Crown,
  Hourglass,
  RotateCcw,
  Scale,
  Send,
  ServerCog,
  ShieldOff,
  Sparkles,
  Tag,
  Target,
  Trash2,
  UserCheck,
} from '@lucide/vue'

// ============================================================================
// Types
// ============================================================================

type BusinessType = 'hotel' | 'law' | 'saas'
type Persona = 'serious' | 'shopper' | 'enterprise' | 'junk'

type Outcome = 'consultation' | 'rep' | 'waitlist' | 'declined'

interface Brief {
  name?: string
  intent?: string
  scope?: string
  timing?: string
  budget?: string
  urgency?: 'High' | 'Medium' | 'Low' | 'None'
  approach?: string
}

interface Turn {
  /** Possible user phrasings, first is used when free-text input is empty. */
  userOptions: [string, string, string]
  /** What the bot replies after the user speaks. */
  botReply: string
  /** Brief fields revealed after this turn lands. */
  extracts?: Partial<Brief>
}

interface Routing {
  outcome: Outcome
  title: string
  detail: string
  rep?: { name: string; title: string; sla: string }
}

interface Script {
  greeting: string
  turns: Turn[]
  routing: Routing
}

interface BusinessConfig {
  label: string
  short: string
  brandName: string
  brandInitial: string
  assistantName: string
  icon: Component
}

interface PersonaConfig {
  label: string
  short: string
  blurb: string
  icon: Component
}

// ============================================================================
// Business + persona metadata
// ============================================================================

const BUSINESSES: Record<BusinessType, BusinessConfig> = {
  hotel: {
    label: 'Boutique hotel',
    short: 'Hotel',
    brandName: 'The Marlow',
    brandInitial: 'M',
    assistantName: 'Iris',
    icon: Building2,
  },
  law: {
    label: 'Law firm',
    short: 'Law',
    brandName: 'Reeves & Hart',
    brandInitial: 'R',
    assistantName: 'Reeves Intake',
    icon: Scale,
  },
  saas: {
    label: 'B2B SaaS',
    short: 'SaaS',
    brandName: 'Atlas Workflow',
    brandInitial: 'A',
    assistantName: 'Atlas',
    icon: ServerCog,
  },
}

const PERSONAS: Record<Persona, PersonaConfig> = {
  serious: {
    label: 'Serious buyer',
    short: 'Serious',
    blurb: 'Real need, real budget, clear timeline.',
    icon: Target,
  },
  shopper: {
    label: 'Price-shopper',
    short: 'Shopper',
    blurb: 'Fishing for the lowest number, no commitment.',
    icon: Tag,
  },
  enterprise: {
    label: 'High-value lead',
    short: 'High-value',
    blurb: 'Big-ticket: wedding planner, GC, enterprise procurement.',
    icon: Crown,
  },
  junk: {
    label: 'Junk lead',
    short: 'Junk',
    blurb: 'Off-topic or spam, should never reach a rep.',
    icon: Trash2,
  },
}

// ============================================================================
// Scripts (business × persona), 4 turns each
// ============================================================================

const SCRIPTS: Record<BusinessType, Record<Persona, Script>> = {
  // ---------------------------------------------------------------- HOTEL ---
  hotel: {
    serious: {
      greeting:
        "Hi, I'm Iris, the front desk's AI assistant at The Marlow. What brings you to us today?",
      turns: [
        {
          userOptions: [
            "Looking for a 6-night anniversary stay in October, my wife's 50th.",
            'Planning an anniversary stay, late October, 6 nights.',
            'Anniversary trip, 2 of us, week of the 10th.',
          ],
          botReply:
            'Lovely, a milestone deserves the Lake Suite. We have it open the week of the 10th. Shall I pencil it in?',
          extracts: { intent: 'Anniversary stay', scope: '2 guests · 6 nights' },
        },
        {
          userOptions: [
            'Yes please, 10th to the 16th.',
            'Perfect, lock in the 10th to 16th.',
            'Book it. The 10th works.',
          ],
          botReply:
            'Done. Would you like us to arrange anything for the stay, a private dinner, flowers in the room?',
          extracts: { timing: '10–16 October', urgency: 'High' },
        },
        {
          userOptions: [
            'Yes, a private dinner on the Saturday.',
            'A dinner on the Saturday night would be wonderful.',
            'Definitely. Dinner on Saturday.',
          ],
          botReply:
            "Of course. I'll have our events lead Sasha call you within the hour to walk through the detail. Whose name should I put on the booking?",
          extracts: { budget: 'Premium · open to upgrades' },
        },
        {
          userOptions: [
            "James Hartley. You can reach me on the number I used.",
            "It's James Hartley.",
            'James Hartley, number on file.',
          ],
          botReply:
            'Thank you, James. Sasha will be in touch shortly. The Lake Suite is held in your name.',
          extracts: { name: 'James Hartley', approach: 'Confirm Lake Suite + private Sat dinner. Anniversary stay, soft-touch upsell on spa package.' },
        },
      ],
      routing: {
        outcome: 'consultation',
        title: 'Booked consultation slot',
        detail:
          'Sasha (Events) is calling James within the hour. The Lake Suite (Oct 10–16) is held. Saturday dinner pencilled in.',
        rep: { name: 'Sasha Lin', title: 'Events Lead', sla: 'Within 1 hour' },
      },
    },
    shopper: {
      greeting:
        "Hi, I'm Iris, the front desk's AI assistant at The Marlow. What brings you to us today?",
      turns: [
        {
          userOptions: [
            "What's your cheapest room?",
            "How low do your rates go?",
            "Just looking for something cheap.",
          ],
          botReply:
            'Our rates start at £180 a night in shoulder season. When were you thinking of coming?',
          extracts: { intent: 'Bargain stay', budget: 'Low signal' },
        },
        {
          userOptions: [
            "I'm not fussy, whenever it's cheapest.",
            "Anytime, really. Whatever's cheapest.",
            "Dunno, sometime this year, just cheap.",
          ],
          botReply:
            "Got it. Shoulder months are March and November, our best rates land then. Want me to send you a rate sheet?",
          extracts: { timing: 'Flexible · whenever cheapest', urgency: 'Low' },
        },
        {
          userOptions: [
            'Sure, send it.',
            'Yeah ok.',
            'Fine.',
          ],
          botReply:
            "Sent. I've also tagged you for our flash-sale list, that's where the deepest rates go first.",
          extracts: { scope: '1 room · unspecified', approach: 'Self-serve rate sheet sent. Tagged for flash-sale list. No rep time spent.' },
        },
        {
          userOptions: [
            'Cool, thanks.',
            'Got it.',
            'OK.',
          ],
          botReply: 'Pleasure. Drop us a line when you spot a date that works.',
        },
      ],
      routing: {
        outcome: 'waitlist',
        title: 'Added to nurture list',
        detail:
          'Rate sheet auto-sent. Tagged for flash-sale list. No rep involved, price-only enquiry, low conversion signal.',
      },
    },
    enterprise: {
      greeting:
        "Hi, I'm Iris, the front desk's AI assistant at The Marlow. What brings you to us today?",
      turns: [
        {
          userOptions: [
            "I'm a wedding planner, client wants the venue for 90 guests, October 2026, budget around £45k.",
            "Wedding for a client. 90 guests, Oct 2026, £45k budget.",
            "Booking on behalf of a client. 90-guest wedding, October '26.",
          ],
          botReply:
            'Wonderful, we host weddings up to 110 guests. Is the client open to a midweek date, or Saturday only?',
          extracts: {
            intent: 'Wedding (planner booking on behalf of client)',
            scope: '90 guests',
            budget: '£45k',
          },
        },
        {
          userOptions: [
            "Saturday, ideally the second weekend.",
            "Saturday 10th October if it's open.",
            "Has to be a Saturday.",
          ],
          botReply:
            'Saturday 10th October 2026 is available. Will guests stay overnight on the estate?',
          extracts: { timing: 'Sat 10 Oct 2026', urgency: 'High' },
        },
        {
          userOptions: [
            'Yes, about 40 rooms.',
            "Roughly 40 rooms needed, yes.",
            "40 rooms, plus suites for the couple.",
          ],
          botReply:
            'Perfect, that puts you in our Estate Hire package. I will connect you with Mira, our Head of Events, today.',
          extracts: { scope: '90 guests · 40 rooms · Estate Hire' },
        },
        {
          userOptions: [
            "Priya Shah, planner. Number on the form.",
            "I'm Priya Shah, happy to take the call.",
            'Priya Shah, contact details with you.',
          ],
          botReply:
            "Thank you, Priya. Mira will be in touch within the next two hours with the package brief.",
          extracts: { name: 'Priya Shah', approach: 'Lead with Estate Hire deck. Confirm Sat 10 Oct 2026, 90 pax, 40 rooms. Planner is repeat-business channel, treat as VIP partner.' },
        },
      ],
      routing: {
        outcome: 'rep',
        title: 'Senior rep assigned',
        detail:
          'Mira (Head of Events) takes this directly, Estate Hire package. Full wedding brief in her inbox.',
        rep: { name: 'Mira Adebayo', title: 'Head of Events', sla: 'Within 2 hours' },
      },
    },
    junk: {
      greeting:
        "Hi, I'm Iris, the front desk's AI assistant at The Marlow. What brings you to us today?",
      turns: [
        {
          userOptions: [
            'do u rent cars',
            'looking for a car rental',
            'need a car not a hotel',
          ],
          botReply:
            "We don't rent cars, but our concierge can arrange one for guests on arrival. Are you planning to stay with us?",
          extracts: { intent: 'Out of scope (car rental enquiry)' },
        },
        {
          userOptions: [
            'no just need a car',
            'not staying just need car',
            'just car',
          ],
          botReply:
            "Thanks for getting in touch. We can't help with that here, but Sixt and Enterprise both have offices in town.",
          extracts: { urgency: 'None', approach: 'Polite redirect to third-party rental. No follow-up.' },
        },
        {
          userOptions: [
            'ok',
            'thanks',
            'k',
          ],
          botReply: 'All the best with your search.',
        },
        {
          userOptions: ['', '', ''],
          botReply: '',
        },
      ],
      routing: {
        outcome: 'declined',
        title: 'Politely declined',
        detail:
          'Auto-response sent. Conversation closed without ever waking a rep. Lead flagged as off-topic in the log.',
      },
    },
  },

  // ------------------------------------------------------------------ LAW ---
  law: {
    serious: {
      greeting:
        "Reeves & Hart intake, I help you find the right partner for the matter. What's brought you in?",
      turns: [
        {
          userOptions: [
            "I've been served a £2m breach-of-contract claim by a former supplier. I need a defence.",
            'Breach of contract, defendant side. Claim is £2m.',
            '£2m commercial dispute landed on my desk yesterday.',
          ],
          botReply:
            'Understood, commercial dispute, defendant side. What does the response window look like?',
          extracts: { intent: 'Commercial litigation (defence)', scope: '£2m claim' },
        },
        {
          userOptions: [
            '21 days from yesterday.',
            'Three weeks, so 20 days now.',
            'Tight. Three weeks max.',
          ],
          botReply:
            "Tight clock. Have you instructed counsel yet, or are we the first call?",
          extracts: { timing: '21-day response deadline', urgency: 'High' },
        },
        {
          userOptions: [
            "You're the first call.",
            "Nobody else yet, wanted you first.",
            'First firm I rang.',
          ],
          botReply:
            "Good, that gives us room. I'll have Tom, our commercial disputes partner, look at the claim and call you today.",
          extracts: { budget: 'Defended litigation budget · partner-level' },
        },
        {
          userOptions: [
            "David Mensah. Best to reach me on mobile.",
            "It's David Mensah.",
            'David Mensah, mobile is fine.',
          ],
          botReply:
            "Thank you, David. Tom will call within the next two hours and the claim documents are already with us.",
          extracts: { name: 'David Mensah', approach: 'Lead with Tom (commercial disputes). 21-day clock. Confirm scope of supplier contracts, prior correspondence, and limitation analysis.' },
        },
      ],
      routing: {
        outcome: 'consultation',
        title: 'Booked consultation slot',
        detail:
          'Tom Mbeki (Commercial Disputes Partner) calls David in the next 2 hours. Claim docs already routed to his inbox.',
        rep: { name: 'Tom Mbeki', title: 'Partner · Commercial Disputes', sla: 'Within 2 hours' },
      },
    },
    shopper: {
      greeting:
        "Reeves & Hart intake, I help you find the right partner for the matter. What's brought you in?",
      turns: [
        {
          userOptions: [
            'What do you charge per hour?',
            "How much do your solicitors cost?",
            "Just shopping around for rates.",
          ],
          botReply:
            'Our rates range £350–£900 depending on seniority and matter type. What is the situation you are looking at?',
          extracts: { intent: 'Rate enquiry', budget: 'Price-led' },
        },
        {
          userOptions: [
            "Just want the cheapest option.",
            "Looking for whoever's cheapest.",
            "Not really, just want lowest rate.",
          ],
          botReply:
            "We are not the cheapest in town, we are partner-led. Happy to send you our published fee guide if that helps.",
          extracts: { urgency: 'Low' },
        },
        {
          userOptions: [
            'Yes send it.',
            'Sure, send the guide.',
            'OK fine.',
          ],
          botReply:
            "Done. If a specific matter comes up where partner-level cover matters, do come back to us.",
          extracts: { scope: 'No matter disclosed', approach: 'Fee guide auto-sent. Re-engage if a real matter surfaces. Do not consume partner time.' },
        },
        {
          userOptions: [
            'Will do.',
            'OK.',
            'Thanks.',
          ],
          botReply: 'Take care.',
        },
      ],
      routing: {
        outcome: 'waitlist',
        title: 'Added to nurture list',
        detail:
          'Fee guide auto-sent. No matter disclosed and no urgency, no partner time consumed.',
      },
    },
    enterprise: {
      greeting:
        "Reeves & Hart intake, I help you find the right partner for the matter. What's brought you in?",
      turns: [
        {
          userOptions: [
            "I'm GC at a FTSE 250. We're consolidating panel firms, commercial, employment, IP.",
            'In-house counsel running a panel review across three practice areas.',
            'Panel firm review, looking for multi-practice cover.',
          ],
          botReply:
            'Understood, that is a managing-partner conversation. May I book Helen for a 30-minute discovery?',
          extracts: { intent: 'Panel firm review (multi-practice)', scope: 'Commercial · Employment · IP' },
        },
        {
          userOptions: [
            'Tomorrow 11am works.',
            'Yes, diary tomorrow morning.',
            "Helen, tomorrow 11. Done.",
          ],
          botReply:
            'Booked. Are you running an RFP, or doing an informal review first?',
          extracts: { timing: 'Discovery: tomorrow 11:00', urgency: 'High' },
        },
        {
          userOptions: [
            "RFP closes end of Q3.",
            'Formal RFP, end-of-quarter deadline.',
            "It's a proper RFP. Q3 close.",
          ],
          botReply:
            "Helpful, Helen will come prepared with our panel-firm credentials pack.",
          extracts: { budget: 'Multi-year retainer · panel mandate' },
        },
        {
          userOptions: [
            "Sarah Okonkwo, GC.",
            "I'm Sarah Okonkwo, General Counsel.",
            "Sarah Okonkwo, contact's with you.",
          ],
          botReply:
            'Thank you, Sarah. Helen has the meeting and the credentials pack will go ahead of it.',
          extracts: { name: 'Sarah Okonkwo', approach: 'Helen leads with panel credentials. Frame as cross-practice mandate, partner-level coverage, audit-trail-grade matter intake. Q3 RFP deadline anchors urgency.' },
        },
      ],
      routing: {
        outcome: 'rep',
        title: 'Senior rep assigned',
        detail:
          'Helen Reeves (Managing Partner) takes this directly. Panel credentials pack queued for send before the meeting.',
        rep: { name: 'Helen Reeves', title: 'Managing Partner', sla: 'Meeting locked tomorrow 11:00' },
      },
    },
    junk: {
      greeting:
        "Reeves & Hart intake, I help you find the right partner for the matter. What's brought you in?",
      turns: [
        {
          userOptions: [
            'do u do divorse cheap',
            'need cheap divorce lawyer',
            'divorse asap cheap',
          ],
          botReply:
            "We do not handle family law, but the Law Society can refer you to a family solicitor. Want the link?",
          extracts: { intent: 'Out of scope (family law)' },
        },
        {
          userOptions: [
            'yes',
            'ok send',
            'k',
          ],
          botReply:
            "Sent. They will match you to a specialist near you.",
          extracts: { urgency: 'None', approach: 'Polite redirect to Law Society referral. No follow-up.' },
        },
        {
          userOptions: [
            'thanks',
            'ok',
            'cheers',
          ],
          botReply: 'All the best with it.',
        },
        {
          userOptions: ['', '', ''],
          botReply: '',
        },
      ],
      routing: {
        outcome: 'declined',
        title: 'Politely declined',
        detail:
          'Out-of-practice-area enquiry. Auto-referral to the Law Society. No partner time consumed.',
      },
    },
  },

  // ----------------------------------------------------------------- SAAS ---
  saas: {
    serious: {
      greeting:
        "Hi, I'm Atlas, I help teams find the right plan. What are you trying to solve?",
      turns: [
        {
          userOptions: [
            "We're a Series B startup, 80 engineers. Replacing Jira next quarter.",
            "Series B, 80 eng. Looking to move off Jira.",
            "80-engineer team, moving off Jira soon.",
          ],
          botReply:
            'Got it. What is pushing the move, pricing, integrations, or the way it handles your flow?',
          extracts: { intent: 'Jira replacement (engineering workflow)', scope: '80 engineers · Series B' },
        },
        {
          userOptions: [
            "It's clunky for our agile flow. We need better roadmapping.",
            'Roadmapping is the killer. Jira fights us.',
            "Workflow's too rigid, need real roadmapping.",
          ],
          botReply:
            "That's exactly the Mid-Market plan's sweet spot. Want a 30-minute product walkthrough this week?",
          extracts: { timing: 'Next quarter', urgency: 'High' },
        },
        {
          userOptions: [
            'Thursday 2pm works.',
            'Yes, Thu 14:00.',
            "Book me Thursday afternoon.",
          ],
          botReply:
            "Booked. I'll send a roadmap-flow walkthrough deck the morning before. Who's the right contact?",
          extracts: { budget: 'Mid-Market plan · annual contract' },
        },
        {
          userOptions: [
            "Lena Park, VP Engineering.",
            "I'm Lena Park, VP Eng.",
            'Lena Park, VP Engineering.',
          ],
          botReply:
            "Thank you, Lena. Demo's locked for Thursday 14:00 with the roadmap-flow walkthrough.",
          extracts: { name: 'Lena Park', approach: 'Lead with roadmapping demo. Show Jira-migration story. Mid-Market plan pricing. Position around agile flow pain.' },
        },
      ],
      routing: {
        outcome: 'consultation',
        title: 'Booked consultation slot',
        detail:
          'Product walkthrough locked for Thursday 14:00 with Lena. Roadmap-flow deck queued for morning-of send.',
        rep: { name: 'Marcus Day', title: 'Mid-Market AE', sla: 'Demo confirmed · prep deck sent prior' },
      },
    },
    shopper: {
      greeting:
        "Hi, I'm Atlas, I help teams find the right plan. What are you trying to solve?",
      turns: [
        {
          userOptions: [
            'Is there a free plan?',
            'Got a free tier?',
            'How much for the cheapest plan?',
          ],
          botReply:
            "We run a 14-day trial, no credit card, full features. Want me to send the sign-up link?",
          extracts: { intent: 'Free-tier enquiry', budget: 'Self-serve / low' },
        },
        {
          userOptions: [
            'Sure.',
            'Yes please.',
            'OK send it.',
          ],
          botReply:
            "Done. The trial drops a Slack-style onboarding sequence, feel free to ignore the nudges if you just want to look around.",
          extracts: { timing: 'Now (trial)', urgency: 'Low' },
        },
        {
          userOptions: [
            'OK.',
            'Cool.',
            'Got it.',
          ],
          botReply:
            "If you spin up a real workspace and hit a wall, I can pull a human in. Otherwise the trial is yours.",
          extracts: { scope: 'Unknown team size', approach: 'Self-serve trial. Promote into AE pipeline only if usage signals a team workspace.' },
        },
        {
          userOptions: [
            'Thanks.',
            'Ta.',
            'Cheers.',
          ],
          botReply: 'Enjoy.',
        },
      ],
      routing: {
        outcome: 'waitlist',
        title: 'Added to product nurture',
        detail:
          'Trial link auto-sent. Promoted to AE only if usage signals a team workspace. No sales time spent.',
      },
    },
    enterprise: {
      greeting:
        "Hi, I'm Atlas, I help teams find the right plan. What are you trying to solve?",
      turns: [
        {
          userOptions: [
            "Fortune 500, running a 6-month evaluation. Need SOC 2, SSO, and a custom DPA.",
            'Enterprise evaluation. SOC 2, SSO, DPA required.',
            "Big-co procurement. Six-month eval, full security review.",
          ],
          botReply:
            'Understood, that is an Enterprise track. Our VP Sales runs those evaluations directly. May I book the discovery this week?',
          extracts: {
            intent: 'Enterprise evaluation (security + procurement)',
            scope: 'SOC 2 · SSO · custom DPA',
          },
        },
        {
          userOptions: [
            "Wednesday morning works.",
            "Wed AM, anytime before noon.",
            "Yes, Wed 10:00.",
          ],
          botReply:
            'Booked for Wednesday 10:00. How large is the team this would roll out to?',
          extracts: { timing: '6-month evaluation · Discovery Wed 10:00', urgency: 'High' },
        },
        {
          userOptions: [
            '~2,400 seats across engineering and ops.',
            'About 2.4k seats firmwide.',
            '2,400 seats, multiple business units.',
          ],
          botReply:
            "Substantial. We'll have the security pack and a draft DPA ready before the call.",
          extracts: { budget: 'Enterprise · 2.4k seats · multi-year' },
        },
        {
          userOptions: [
            'Marcus Webb, Director of Engineering.',
            "I'm Marcus Webb, Director of Engineering.",
            'Marcus Webb, Dir Eng. Contact on file.',
          ],
          botReply:
            "Thank you, Marcus. Wednesday 10:00 with our VP Sales, security pack and draft DPA will land the day before.",
          extracts: { name: 'Marcus Webb', approach: 'VP Sales leads. Pre-send security pack + draft DPA. Lead with SOC 2 / SSO story, then seat-rollout commercials.' },
        },
      ],
      routing: {
        outcome: 'rep',
        title: 'Senior rep assigned',
        detail:
          'Naomi Khan (VP Sales) takes this directly. Security pack and draft DPA queued to send before the discovery call.',
        rep: { name: 'Naomi Khan', title: 'VP Sales · Enterprise', sla: 'Discovery locked Wed 10:00' },
      },
    },
    junk: {
      greeting:
        "Hi, I'm Atlas, I help teams find the right plan. What are you trying to solve?",
      turns: [
        {
          userOptions: [
            'how do i open excel',
            'cant open excel pls help',
            'excel wont start',
          ],
          botReply:
            "We're a workflow tool, not Microsoft. Try support.microsoft.com for Excel issues.",
          extracts: { intent: 'Out of scope (Microsoft support)' },
        },
        {
          userOptions: [
            'ok thx',
            'thanks',
            'ok',
          ],
          botReply:
            "Hope you get it sorted.",
          extracts: { urgency: 'None', approach: 'Polite redirect to Microsoft support. No follow-up.' },
        },
        {
          userOptions: [
            '',
            '',
            '',
          ],
          botReply: '',
        },
        {
          userOptions: ['', '', ''],
          botReply: '',
        },
      ],
      routing: {
        outcome: 'declined',
        title: 'Politely declined',
        detail:
          'Out-of-product enquiry. Redirected to Microsoft support. No AE time consumed.',
      },
    },
  },
}

// ============================================================================
// State
// ============================================================================

const businessType = ref<BusinessType>('hotel')
const persona = ref<Persona>('serious')

interface ChatMessage {
  id: number
  from: 'bot' | 'user'
  text: string
}

const messages = ref<ChatMessage[]>([])
const stepIndex = ref(0) // how many user turns have been taken
const composing = ref(false) // bot is "typing"
const inputText = ref('')
const finished = ref(false)
const briefRevealed = ref(false) // animation hook on first brief update
let msgId = 0
let pendingTimers: ReturnType<typeof setTimeout>[] = []

const currentScript = computed(() => SCRIPTS[businessType.value][persona.value])
const currentBusiness = computed(() => BUSINESSES[businessType.value])
const currentPersona = computed(() => PERSONAS[persona.value])

const liveBrief = ref<Brief>({})

const activeTurn = computed<Turn | null>(() => {
  if (finished.value) return null
  return currentScript.value.turns[stepIndex.value] ?? null
})

// Visible suggested replies, filter out empty placeholders so junk-lead scripts
// can have shorter conversations without showing blank buttons.
const visibleOptions = computed(() => {
  const t = activeTurn.value
  if (!t) return []
  return t.userOptions.filter((s) => s.trim().length > 0)
})

// Routing pane reveals after the last meaningful turn.
const routingVisible = ref(false)

// ============================================================================
// Lifecycle helpers
// ============================================================================

function cancelTimers() {
  for (const t of pendingTimers) clearTimeout(t)
  pendingTimers = []
}

function pushMessage(from: 'bot' | 'user', text: string) {
  messages.value.push({ id: ++msgId, from, text })
}

function resetConversation() {
  cancelTimers()
  messages.value = []
  liveBrief.value = {}
  stepIndex.value = 0
  composing.value = false
  inputText.value = ''
  finished.value = false
  routingVisible.value = false
  briefRevealed.value = false
  // Greeting lands immediately.
  pushMessage('bot', currentScript.value.greeting)
}

function commitUserTurn(userText: string) {
  const turn = activeTurn.value
  if (!turn || composing.value) return

  pushMessage('user', userText)
  composing.value = true
  inputText.value = ''

  // "Typing" pause, then bot replies + extracts land.
  const replyDelay = 650 + Math.min(turn.botReply.length, 220) * 4
  pendingTimers.push(
    setTimeout(() => {
      if (turn.botReply) pushMessage('bot', turn.botReply)
      if (turn.extracts) {
        // Merge extracts; trigger one-shot reveal flag.
        liveBrief.value = { ...liveBrief.value, ...turn.extracts }
        briefRevealed.value = true
      }
      composing.value = false
      stepIndex.value += 1

      const remaining = currentScript.value.turns.length - stepIndex.value
      const remainingMeaningful = currentScript.value.turns
        .slice(stepIndex.value)
        .some((t) => t.userOptions.some((s) => s.trim().length > 0))
      if (remaining === 0 || !remainingMeaningful) {
        finished.value = true
        pendingTimers.push(
          setTimeout(() => {
            routingVisible.value = true
          }, 500),
        )
      }
    }, replyDelay),
  )
}

function pickOption(text: string) {
  commitUserTurn(text)
}

function submitTyped() {
  const t = inputText.value.trim()
  if (!t) return
  commitUserTurn(t)
}

// ============================================================================
// Reactivity wiring, reset when business or persona changes
// ============================================================================

watch([businessType, persona], () => {
  resetConversation()
})

// Initial greeting on mount (run via watcher trick: set businessType to its
// current value triggers nothing; explicit init instead).
resetConversation()

// Autoscroll the chat to the bottom on new messages.
const chatScroll = ref<HTMLElement | null>(null)
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (chatScroll.value) {
      chatScroll.value.scrollTop = chatScroll.value.scrollHeight
    }
  },
)

onBeforeUnmount(() => {
  cancelTimers()
})

// ============================================================================
// Routing presentation helpers
// ============================================================================

const ROUTING_META: Record<Outcome, { icon: Component; tone: 'positive' | 'positive-strong' | 'neutral' | 'muted'; label: string }> = {
  consultation: { icon: CalendarCheck, tone: 'positive', label: 'Consultation booked' },
  rep:          { icon: UserCheck,     tone: 'positive-strong', label: 'Senior rep assigned' },
  waitlist:     { icon: Hourglass,     tone: 'neutral', label: 'Nurture list' },
  declined:     { icon: ShieldOff,     tone: 'muted',   label: 'Politely declined' },
}

const routingMeta = computed(() => ROUTING_META[currentScript.value.routing.outcome])

// Brief shown to the rep, only meaningful for consultation / rep outcomes.
const briefForRep = computed<Brief | null>(() => {
  const outcome = currentScript.value.routing.outcome
  if (outcome !== 'consultation' && outcome !== 'rep') return null
  return liveBrief.value
})

const BRIEF_ROWS: { key: keyof Brief; label: string }[] = [
  { key: 'name',     label: 'Name' },
  { key: 'intent',   label: 'Intent' },
  { key: 'scope',    label: 'Scope' },
  { key: 'timing',   label: 'Timing' },
  { key: 'budget',   label: 'Budget' },
  { key: 'urgency',  label: 'Urgency' },
]

const urgencyTone = (u?: Brief['urgency']) => {
  if (u === 'High')   return 'text-cyan-brand-deep'
  if (u === 'Medium') return 'text-ink'
  if (u === 'Low')    return 'text-mute'
  return 'text-mute-2'
}
</script>

<template>
  <div class="lqe-root bg-white">
    <!-- Top toolbar: business + persona -->
    <header class="border-b border-line bg-white px-4 sm:px-5 md:px-6 py-4 md:py-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div
            class="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold"
          >
            <span class="dot" />
            Live demo
          </div>
          <h3 class="mt-2 font-display text-[20px] sm:text-[24px] md:text-[28px] leading-[1.15] text-ink">
            One AI intake. Three businesses. Four prospects.
          </h3>
          <p class="mt-1.5 text-[14px] text-mute max-w-2xl">
            Pick a business and a persona. Hold the conversation as the prospect, the system qualifies you in real time and routes the lead before a human gets involved.
          </p>
        </div>
      </div>

      <!-- Business type tabs -->
      <div class="mt-5">
        <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2">
          Business type
        </div>
        <div role="tablist" aria-label="Business type" class="flex flex-wrap gap-2">
          <button
            v-for="(meta, key) in BUSINESSES"
            :key="key"
            type="button"
            role="tab"
            :aria-selected="businessType === key"
            @click="businessType = key as BusinessType"
            :class="[
              'inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              businessType === key
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-ink border-line hover:border-cyan-brand/40',
            ]"
          >
            <component :is="meta.icon" :size="15" :stroke-width="1.9" aria-hidden="true" />
            {{ meta.label }}
          </button>
        </div>
      </div>

      <!-- Persona tabs -->
      <div class="mt-4">
        <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold mb-2">
          Prospect persona
        </div>
        <div role="tablist" aria-label="Prospect persona" class="flex flex-wrap gap-2">
          <button
            v-for="(meta, key) in PERSONAS"
            :key="key"
            type="button"
            role="tab"
            :aria-selected="persona === key"
            @click="persona = key as Persona"
            :class="[
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
              persona === key
                ? 'bg-cyan-brand/12 text-cyan-brand-deep border-cyan-brand/40'
                : 'bg-white text-ink border-line hover:border-cyan-brand/40',
            ]"
          >
            <component :is="meta.icon" :size="14" :stroke-width="1.9" aria-hidden="true" />
            {{ meta.label }}
          </button>
        </div>
        <p class="mt-2 text-[13px] text-mute">
          <span class="font-semibold text-ink">{{ currentPersona.short }}.</span>
          {{ currentPersona.blurb }}
        </p>
      </div>
    </header>

    <!-- Main two-column grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2">
      <!-- ============================== CHAT PANEL ============================== -->
      <section
        class="border-b lg:border-b-0 lg:border-r border-line flex flex-col"
        aria-label="Conversation"
      >
        <!-- Chat header -->
        <div class="flex items-center justify-between px-4 sm:px-5 md:px-6 py-4 border-b border-line gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-cyan-brand/10 text-cyan-brand-deep font-display text-[18px] leading-none ring-1 ring-cyan-brand/25"
              aria-hidden="true"
            >
              {{ currentBusiness.brandInitial }}
            </span>
            <div class="min-w-0">
              <div class="text-[14.5px] font-semibold text-ink leading-tight truncate">
                {{ currentBusiness.brandName }}
              </div>
              <div class="text-[12.5px] text-mute leading-tight truncate">
                {{ currentBusiness.assistantName }} · AI intake
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="resetConversation"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-mute hover:text-ink hover:border-cyan-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Reset conversation"
          >
            <RotateCcw :size="13" :stroke-width="2" />
            Reset
          </button>
        </div>

        <!-- Messages -->
        <div
          ref="chatScroll"
          class="lqe-chat px-4 sm:px-5 md:px-6 py-5 flex flex-col gap-3 overflow-y-auto"
          role="log"
          aria-live="polite"
        >
          <transition-group name="lqe-msg" tag="div" class="flex flex-col gap-3">
            <div
              v-for="m in messages"
              :key="m.id"
              :class="[
                'flex',
                m.from === 'user' ? 'justify-end' : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-[1.5] border',
                  m.from === 'user'
                    ? 'bg-ink text-white border-ink rounded-br-md'
                    : 'bg-white text-ink border-line rounded-bl-md',
                ]"
              >
                {{ m.text }}
              </div>
            </div>
          </transition-group>

          <!-- Typing indicator -->
          <div v-if="composing" class="flex justify-start" aria-label="Assistant is typing">
            <div class="rounded-2xl rounded-bl-md border border-line bg-white px-3.5 py-2.5">
              <span class="lqe-dot" />
              <span class="lqe-dot" />
              <span class="lqe-dot" />
            </div>
          </div>
        </div>

        <!-- Suggested replies + free text -->
        <div class="border-t border-line bg-surface-alt/60 px-4 sm:px-5 md:px-6 py-4">
          <template v-if="!finished">
            <div v-if="visibleOptions.length" class="flex flex-wrap gap-2">
              <button
                v-for="(opt, i) in visibleOptions"
                :key="i"
                type="button"
                :disabled="composing"
                @click="pickOption(opt)"
                :class="[
                  'inline-flex items-start text-left rounded-xl border bg-white px-3 py-2 text-[13.5px] leading-[1.4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                  composing
                    ? 'border-line text-mute-2 cursor-not-allowed'
                    : 'border-line text-ink hover:border-cyan-brand/40 hover:bg-white',
                ]"
              >
                {{ opt }}
              </button>
            </div>

            <form class="mt-3 flex items-center gap-2" @submit.prevent="submitTyped">
              <input
                v-model="inputText"
                type="text"
                :placeholder="composing ? 'Iris is replying…' : 'Or type your own reply…'"
                :disabled="composing"
                class="lqe-input flex-1 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-mute-2 focus:outline-none focus:border-cyan-brand focus:shadow-[0_0_0_3px_rgba(1,219,241,0.22)] transition-all"
                aria-label="Type a reply"
              />
              <button
                type="submit"
                :disabled="composing || !inputText.trim()"
                class="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-ink text-white disabled:bg-line disabled:text-mute-2 hover:bg-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                aria-label="Send"
              >
                <Send :size="16" :stroke-width="2" />
              </button>
            </form>
          </template>

          <div v-else class="rounded-xl border border-line bg-white px-3.5 py-3 text-[13.5px] text-mute flex items-start gap-2">
            <Sparkles :size="14" :stroke-width="2" class="mt-0.5 text-cyan-brand-deep shrink-0" />
            <span>
              Conversation closed, see how the system routed this lead on the right. Switch persona or business type to run another.
            </span>
          </div>
        </div>
      </section>

      <!-- ============================== RIGHT PANE ============================== -->
      <section class="flex flex-col" aria-label="Qualifying brief and routing decision">
        <!-- Live brief -->
        <div class="px-4 sm:px-5 md:px-6 py-5 border-b border-line">
          <div class="flex items-center justify-between">
            <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
              Qualifying, live
            </div>
            <div class="text-[12px] text-mute">
              Updates every turn
            </div>
          </div>

          <dl class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div
              v-for="row in BRIEF_ROWS"
              :key="row.key"
              class="flex flex-col"
            >
              <dt class="text-[11.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                {{ row.label }}
              </dt>
              <dd
                :class="[
                  'mt-1 text-[14.5px] leading-[1.4] font-medium transition-colors',
                  liveBrief[row.key]
                    ? row.key === 'urgency'
                      ? urgencyTone(liveBrief.urgency)
                      : 'text-ink'
                    : 'text-mute-2',
                ]"
              >
                <template v-if="liveBrief[row.key]">{{ liveBrief[row.key] }}</template>
                <template v-else><span class="opacity-60">-</span></template>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Routing decision -->
        <div class="px-4 sm:px-5 md:px-6 py-5 flex-1">
          <div class="text-[11.5px] uppercase tracking-[0.22em] text-cyan-brand-deep font-semibold">
            Routing decision
          </div>

          <transition name="lqe-fade">
            <div v-if="routingVisible" class="mt-3">
              <!-- Outcome card -->
              <div
                :class="[
                  'rounded-2xl border p-4 sm:p-5 md:p-6 transition-colors',
                  routingMeta.tone === 'positive-strong'
                    ? 'border-cyan-brand/40 bg-cyan-brand/8 ring-1 ring-cyan-brand/20'
                    : routingMeta.tone === 'positive'
                    ? 'border-cyan-brand/30 bg-white'
                    : routingMeta.tone === 'neutral'
                    ? 'border-line bg-surface-alt/60'
                    : 'border-line bg-surface-alt/60',
                ]"
              >
                <div class="flex items-start gap-3">
                  <span
                    :class="[
                      'inline-flex items-center justify-center h-11 w-11 rounded-xl shrink-0 ring-1',
                      routingMeta.tone === 'positive-strong' || routingMeta.tone === 'positive'
                        ? 'bg-cyan-brand/10 text-cyan-brand-deep ring-cyan-brand/25'
                        : 'bg-white text-mute-2 ring-line',
                    ]"
                    aria-hidden="true"
                  >
                    <component :is="routingMeta.icon" :size="20" :stroke-width="1.85" />
                  </span>
                  <div class="min-w-0">
                    <div class="text-[11.5px] uppercase tracking-[0.18em] font-semibold text-mute-2">
                      {{ routingMeta.label }}
                    </div>
                    <div class="mt-1 font-display text-[18px] sm:text-[22px] md:text-[24px] leading-[1.15] text-ink">
                      {{ currentScript.routing.title }}
                    </div>
                    <p class="mt-2 text-[14.5px] leading-[1.55] text-mute">
                      {{ currentScript.routing.detail }}
                    </p>
                  </div>
                </div>

                <!-- Rep + SLA row -->
                <div
                  v-if="currentScript.routing.rep"
                  class="mt-4 flex flex-wrap items-center gap-3 text-[13px] border-t border-line pt-4"
                >
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center h-7 w-7 rounded-full bg-surface-alt text-mute font-semibold text-[11.5px]" aria-hidden="true">
                      {{ currentScript.routing.rep.name.split(' ').map((p) => p[0]).join('') }}
                    </span>
                    <span class="text-ink font-semibold">{{ currentScript.routing.rep.name }}</span>
                    <span class="text-mute">· {{ currentScript.routing.rep.title }}</span>
                  </div>
                  <div class="sm:ml-auto text-mute">
                    <span class="font-semibold text-ink">SLA:</span> {{ currentScript.routing.rep.sla }}
                  </div>
                </div>
              </div>

              <!-- Brief for the rep (only for consultation / rep outcomes) -->
              <div
                v-if="briefForRep"
                class="mt-4 rounded-2xl border border-line bg-white p-4 sm:p-5 md:p-6"
              >
                <div class="flex items-center justify-between">
                  <div class="text-[11.5px] uppercase tracking-[0.22em] text-mute-2 font-semibold">
                    What the rep gets
                  </div>
                  <span class="text-[12px] text-mute">Inbox brief · auto-prepared</span>
                </div>

                <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  <div v-for="row in BRIEF_ROWS" :key="row.key" class="flex flex-col">
                    <span class="text-[11.5px] uppercase tracking-[0.18em] text-mute-2 font-semibold">
                      {{ row.label }}
                    </span>
                    <span
                      :class="[
                        'mt-1 text-[14px] leading-[1.45]',
                        liveBrief[row.key] ? 'text-ink font-medium' : 'text-mute-2',
                      ]"
                    >
                      {{ liveBrief[row.key] ?? '-' }}
                    </span>
                  </div>
                </div>

                <div v-if="liveBrief.approach" class="mt-4 rounded-xl bg-surface-alt/70 border border-line px-3.5 py-3">
                  <div class="text-[11.5px] uppercase tracking-[0.18em] text-cyan-brand-deep font-semibold">
                    Suggested approach
                  </div>
                  <p class="mt-1.5 text-[14px] leading-[1.55] text-ink">
                    {{ liveBrief.approach }}
                  </p>
                </div>
              </div>

              <!-- Why this outcome -->
              <p class="mt-3 text-[12.5px] text-mute-2 italic">
                Same rules engine. Different persona ⇒ different outcome. Try the persona tabs above.
              </p>
            </div>

            <div
              v-else
              class="mt-3 rounded-2xl border border-dashed border-line bg-surface-alt/40 px-5 py-8 text-center text-mute"
            >
              <p class="text-[14px]">
                Hold the conversation. The routing decision lands when the system has enough to decide.
              </p>
            </div>
          </transition>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lqe-root {
  /* Bleed to the rounded container's edges via DemoSlot wrapper. */
  border-radius: 1rem;
  overflow: hidden;
}

.lqe-chat {
  min-height: 360px;
  max-height: 460px;
}

@media (min-width: 1024px) {
  .lqe-chat {
    min-height: 460px;
    max-height: 460px;
  }
}

/* Message reveal */
.lqe-msg-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.lqe-msg-enter-active {
  transition: opacity 260ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
.lqe-msg-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Routing reveal */
.lqe-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.lqe-fade-enter-active {
  transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.lqe-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Typing dots */
.lqe-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin: 0 2px;
  border-radius: 9999px;
  background: #94a3b8;
  animation: lqe-bounce 1.2s infinite;
}
.lqe-dot:nth-child(2) { animation-delay: 0.15s; }
.lqe-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes lqe-bounce {
  0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
  40%           { transform: translateY(-4px); opacity: 1;   }
}

/* iOS auto-zoom guard already covered by 15px+ font-size, but explicit */
.lqe-input { font-size: 16px; }
@media (min-width: 768px) {
  .lqe-input { font-size: 15px; }
}

@media (prefers-reduced-motion: reduce) {
  .lqe-msg-enter-active,
  .lqe-fade-enter-active { transition: none !important; }
  .lqe-dot { animation: none !important; }
}
</style>
