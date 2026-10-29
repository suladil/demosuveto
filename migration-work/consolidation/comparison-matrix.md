# Consolidated Veterinary Homepage – Comparison Matrix

Sources analysed on 2026-10-29 (desktop, 1440px):

| Key | Site | Role |
|---|---|---|
| WLV | West Loop Veterinary Care – https://westloopvet.com/ | Structural base / primary journey |
| WOFA | World of Animals Veterinary Hospital – https://wofainc.com/ | Multi-location (5 hospitals) |
| HOC | Heart of Chelsea Veterinary Group – https://heartofchelsea.com/ | Brand / tone, multi-region (8 hospitals, NYC + Seattle) |
| VO | VO Vets – https://vovets.com/ | Trophy Club / Fort Worth, 2 hospitals |

## Section-by-section

| Section | WLV | WOFA | HOC | VO | Chosen pattern |
|---|---|---|---|---|---|
| Utility / top bar | Header tabs: Book Now, "New Clients: First Exam Free" | Utility links (About, Careers, Contact, Locations, phone) | — | Promo banner ("Dental Days – Save $200") | **VO promo strip + WOFA utility links/phone** |
| Header CTAs | Book Now | Book Appt. + Pharmacy | BOOK an Appointment + Find a Location | Book Appointment pill | **Book Appointment (primary) + Find a Location + Pharmacy** |
| Hero | Background video, slogan, crimson pill bar (Talk to team / Rx refill / Urgent care) | Eyebrow + H1 + Book Appointment | Lifestyle photo, two-weight serif/sans headline | Split hero, photo + "Get your first exam free" | **Split photo hero (VO/HOC), two-weight headline (HOC), Book + Find location CTAs, new-client offer (VO/HOC)** |
| Quick actions | Crimson pill bar under hero | — | — | — | **WLV quick-action bar** expanded to Book / New Clients / Rx Refill / Urgent Care |
| Trust / accreditation | AAHA, Fear Free, Cat Friendly logos | — | AAHA-accredited feature with photo | AAHA + Cat Friendly (footer) | **Trust strip with accreditation names (WLV) + stat counters (HOC)** |
| Locations | 2 photo cards (phone, hours, Visit location) | 5 neighbourhood tiles + Google map | Region-grouped accordion (NYC / Seattle) | 2 cards with phone, address, hours, map | **Location cards with address, hours, phone, Book here (VO/WLV) + region grouping label (HOC)** |
| Services | 4 featured icon cards + 9-link list | 8 service tiles | Teaser + "See our services" | Footer list | **Icon service cards (WLV/WOFA) + "View all services" link** |
| Why choose us | About text + Meet the team | Intro paragraph | Stat counters (locations, team, years) | Mission paragraph + video | **Stat counters (HOC) + 3 differentiator columns** |
| New clients | Header tab "First Exam Free" | "First-time clients / Current clients" switch | "First exam free" with Manhattan/Brooklyn/Seattle buttons | "Get your first exam free" | **3-step journey: Request → Forms → First visit (WOFA first-time clients + WLV/VO offer)** |
| Team | Meet the Team button | — | Text + team photo gallery + per-region team CTAs | Our Vet Team button + video | **Image + text teaser with Meet our team CTA (HOC)** |
| Reviews | Third-party widget (36 reviews, 4.66★) | — | Single large testimonial | Embedded widgets | **3 static testimonial cards with rating summary (WLV rating + HOC quote style)** |
| Pharmacy | Rx refill form (hero bar) | Header Pharmacy button | Medication request + Online pharmacy (menu) | — | **Pharmacy promo columns: online store + refill request** |
| Emergency | Urgent Care link | Emergency Care service | Emergencies footer button | Walk-in urgent care + after-hours partner | **Emergency notice in CTA band and footer (VO after-hours pattern)** |
| Final CTA | Crimson band "Book Now" | — | — | — | **Navy band with Book Appointment + call (WLV pattern, HOC palette)** |
| Footer | Locations, phones, links | Locations list, services, other links, social | Coast-to-coast map, quick buttons, social | Visit us (addresses), hours, services, 24/7 emergencies, resources, accreditation, social | **VO 4-column footer: Locations & phones / Hours / Services / Emergencies & resources + social** |

## Design tokens (source → consolidated)

| Token | WLV | WOFA | HOC | VO | Consolidated |
|---|---|---|---|---|---|
| Dark / primary | — | #004660 | #2e3e52 navy | #054570 navy | **#1f3a52 navy** |
| CTA | #bf3b4d crimson | #4a8ecc blue | #d6af4c gold | #dc596d coral | **#c9475a coral-crimson** |
| Accent | #3f3f3f | — | #d6af4c gold | #e6bc67 gold, #5baaa2 teal | **#d6af4c gold, #5baaa2 teal** |
| Light background | #e9eaeb | #e2e3e4 (31%) | #eceae6 warm grey | #f1f2f2 | **#f5f2ec warm cream** |
| Heading font | Prompt 600 | Oswald 800 caps | Playfair Display / Moderat Serif + Lato 300 | Playfair Display 700 + Montserrat | **Playfair Display 600/700** |
| Body font | Source Sans Pro 19px | Lato 15px | Lato 17px/300 | Montserrat 14px | **Lato 400/700, 18px** |
| Buttons | Pill, uppercase Prompt 600 | 3px radius, uppercase | Square, uppercase | Pill (300px) | **Pill, Lato 700, slight uppercase tracking** |

## Brand

- Name (placeholder): **Paws & Partners Veterinary Group**
- Tagline: "Neighborhood care, connected."
- Locations (fictional, 555 numbers): Riverside, Old Town, Lakeview, Northgate
- Imagery: neutral stock-style photography (no source-clinic photos)

## Final consolidated page (implemented)

| # | Section | Block | Pattern sources |
|---|---|---|---|
| – | Utility bar (promo + About/Careers/Contact/phone) | header (nav section 4) | VO promo banner, WOFA utility links |
| – | Main nav + Find a Location / Book Appointment | header | WLV menu, HOC/WOFA header CTAs |
| 1 | Split hero, two-weight headline, offer pill, location chips | `hero` (split layout) | WLV hero position, VO split hero, HOC headline + region buttons |
| 2 | Quick actions: Book / New Clients / Rx Refill / Urgent Care | `quick-actions` (new) | WLV crimson CTA bar |
| 3 | Location cards: region, address, hours, phone, per-location Book | `cards (locations)` | WLV cards, VO details, HOC region grouping |
| 4 | Services (8 icon cards) + View all services | `cards (services)` | WLV featured services, WOFA service tiles |
| 5 | Why us: counters + 3 differentiators | `columns (stats)`, `columns (features)` | HOC counters, WLV accreditations |
| 6 | New-client journey (3 steps) + free-exam CTA | `cards (steps)` | WOFA first-time clients, WLV/VO/HOC first exam free |
| 7 | Team teaser | `columns (media)` | WLV about + Meet the team, HOC team section |
| 8 | Reviews: rating summary + 3 testimonials | `cards (testimonials)` | WLV rating, HOC quote style |
| 9 | Pharmacy promo | `columns (media)` | WOFA header Pharmacy, HOC medication request / online pharmacy |
| 10 | Closing CTA + after-hours emergency note | default content (dark section) | WLV closing band, VO 24/7 emergencies |
| – | Footer: brand, Visit Us (phones + hours), Services, Resources + 24/7 emergencies, legal + social | footer, `columns (footer-links)` | VO 4-column footer, WOFA locations list, HOC quick links |

## Regenerating the content

Copy lives in `source/index.html` (`nav.html` and `footer.html` are symlinks to it).

```bash
python3 -m http.server 4600 --bind 127.0.0.1 --directory migration-work/consolidation/source &
S=<excat-content-import scripts dir>
for t in homepage nav footer; do
  $S/aem-import-bundle.sh --importjs tools/importer/import-consolidated-$t.js
  node $S/run-bulk-import.js --force --import-script tools/importer/import-consolidated-$t.bundle.js --urls tools/importer/urls-consolidated-$t.txt
done
```
