# 🪷 Bhakti Tracker

A calm, premium daily-sadhana tracker for ISKCON devotees. Log two things each day —
**chanting rounds** and **reading minutes** — and watch your consistency grow.

Built with **React Native + Expo**, **TypeScript**, **Firebase (Auth + Firestore)**,
**React Navigation**, **NativeWind**, **Reanimated**, and **react-native-chart-kit**.

---

## Features

- **Email/password auth** with two roles: *Devotee* and *Mentor (admin)*.
- **Today** — one entry per day via a large, thumb-friendly stepper (< 30s). Editable until midnight.
- **History** — chronological list with *Last 7 Days / Last 30 Days / All Time* filters.
- **Dashboard** — current streak, totals, averages, animated line charts, weekly/monthly
  summaries, and a chanting-activity heatmap.
- **Mentor dashboard** — view assigned devotees, search by name, and open any devotee's
  read-only history and statistics.
- **Profile** — name, email, assigned mentor, and logout. (Mentors see a shareable code.)
- **Optional** evening reminder notification at 8 PM.

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env` with your Firebase and Google credentials (see comments in
[`.env.example`](.env.example)). `.env` is gitignored — only the example file is committed.

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method →** enable **Email/Password** (and Google, if used).
3. **Firestore Database →** create a database (production mode).
4. Publish the security rules from [`firestore.rules`](firestore.rules)
   (Firestore → Rules → paste → Publish).

### 3. Run

```bash
npm start          # then press a/i, or scan the QR with Expo Go
npm run android
npm run ios
```

---

## How roles connect

Every devotee belongs to a mentor. On sign-up:

- A **Mentor** registers with no code. Their **mentor code is their account ID**, shown in
  **Profile** (tap to copy).
- A **Devotee** enters that mentor code, which is stored as `adminId` and links them to the mentor.

The mentor's **Students** tab lists everyone whose `adminId` matches their id.

---

## Data model

**`users/{uid}`** — `name`, `email`, `role` (`admin` | `user`), `adminId` (mentor's uid | null)

**`entries/{uid}_{YYYY-MM-DD}`** — `userId`, `date`, `chantingRounds`, `readingMinutes`,
`createdAt`, `updatedAt`

The deterministic `{uid}_{date}` document id guarantees a single entry per day and makes
same-day edits a simple overwrite.

---

## Project structure

```
src/
  components/     Reusable UI (Card, Button, StatCard, charts, skeletons, …)
  config/         Firebase initialization
  context/        AuthContext (session + profile)
  navigation/     Auth / User tabs / Admin stack + tabs
  screens/        Today, History, Dashboard, Profile, auth/, admin/
  services/       auth, entries (Firestore), notifications
  theme/          Shared color palette
  types/          Shared TypeScript types
  utils/          Date helpers + stats/streak calculations
```

---

## Notes

- Placeholder app icons in `assets/` are simple generated squares — swap in real artwork
  before publishing.
- Analytics are computed client-side for simplicity; for large datasets you'd paginate
  Firestore queries.
