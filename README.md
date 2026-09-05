# Vamanan GPT

> Where the smallest step holds the world.

Vamanan GPT is an immersive, interactive chatbot that brings the story of Vamanan (the fifth avatar of Vishnu) and King Mahabali to life through Kerala's Onam traditions. It speaks in character as Vamanan — friendly, witty, philosophical, and traditional — and engages users with storytelling, riddles, quizzes, jokes, and cultural knowledge.

## What makes it different

- **Stays in character as Vamanan** — every response is voiced by the dwarf-sage himself, with warmth, mischief, and philosophical depth.
- **Multilingual support** — understands and responds in English, Malayalam (with native script), and Manglish (Malayalam + English mix).
- **Creative interactive features** — Onam riddles (Onappuzzhu), a 5-question quiz, Malayalam jokes, interactive storytelling with follow-up prompts, and a spinning Pookkalam widget with clickable flower trivia.
- **Visual language** — pookkalam geometry, palm-leaf warmth, kasavu golden borders, mural reds, temple greens, a nilavilakku lamp, and a chibi Vamanan avatar with blinking eyes and a flickering aura.
- **Ambient Onam music** — a music button lets users play/pause a looping Onam evergreen tune.
- **Mobile-responsive** — the Pookkalam opens as a slide-in drawer on phones; the layout adapts to all screen sizes.

## Features

### Chatbot Persona
Vamanan GPT stays in character throughout. It answers questions about:
- The story of Vamanan and Mahabali
- The meaning of the three cosmic steps
- The ten days of Onam (Atham to Thiruvonam)
- The Onam Sadya (feast) and its 20+ dishes
- How to make a Pookkalam (flower carpet)
- Vallamkali (snake boat races), Pulikali (tiger dance), Kaikottikali, Kathakali, Mohiniyattam, Theyyam
- Onam songs (Onappattu) with Malayalam lyrics and translations
- The Dashavatara (ten avatars of Vishnu)
- Temples associated with Vamanan (Thrikkakara, Ulagalanda Perumal)
- Kerala's spices, backwaters, monsoons, and culture
- Philosophy of the small, generosity, and dharma

### Creative & Interactive
- **Onam Riddles** — traditional brain teasers with answers
- **Onam Quiz** — a 5-question quiz with answer checking
- **Malayalam Jokes** — a rotating collection of Kerala-style humor in Manglish
- **Manglish Guide** — essential Onam phrases in the Malayalam-English mix
- **Follow-up Prompts** — every answer suggests related questions to keep the conversation flowing
- **Spinning Pookkalam** — drag to spin, click petals for flower trivia
- **Blessing Counter** — counts Vamanan's blessings given; tap for a petal shower
- **Typewriter Effect** — responses type out character by character for a storytelling feel

### General Knowledge
Beyond Onam, Vamanan GPT can discuss AI, programming, space, mathematics, history, philosophy, music, food, science, health, love, business, travel, sports, books, weather, Kerala geography, Indian festivals, and language — all through Vamanan's philosophical voice.

## Tech Stack

- **Frontend:** React + Vite
- **Backend/Database:** Supabase (PostgreSQL with Row Level Security)
- **Styling:** Custom CSS with Kerala-themed design system (kasavu gold, temple green, marigold orange, crimson)
- **Audio:** HTML5 Audio API with a looping Onam tune
- **No external AI APIs** — the knowledge base is curated and hand-crafted, with a scoring engine that matches user queries to the most relevant stories

## Run Locally

```bash
npm install
npm run dev
```


## Build & Deploy

```bash
npm run build      # Production build to dist/
npm run preview     # Preview the production build locally
npm run deploy      # Deploy to GitHub Pages
```

## The Story

Vamanan is the fifth avatar of Vishnu: the small brahmachari who asks King Mahabali for three paces of land, then reveals a cosmic form (Trivikrama). The first step covers the earth. The second covers the heavens. For the third, Mahabali offers his own head — and is granted the boon of returning to his people once a year.

That return is Onam.

In Kerala, Onam is the annual celebration of generosity, belonging, and the promise that a good story can return whenever it is remembered. Vamanan GPT is a small vessel for that story — carrying it forward, one conversation at a time.

## Project Structure

```
src/
  App.jsx          # Main app — UI, chat interface, sidebar, audio
  engine.js         # Query scoring & response matching engine
  knowledge.js      # Curated knowledge base (stories, riddles, quizzes, jokes)
  index.css         # Kerala-themed design system
  lib/supabase.js   # Supabase client
supabase/
  migrations/       # Database schema with RLS policies
public/
  audio/            # Onam evergreen tune
```

## Credits

- **Design inspiration:** Kerala mural art, kasavu textile patterns, pookkalam geometry
- **Built with:** React, Vite, Supabase

