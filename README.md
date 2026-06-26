# Strength Data — Workout Tracker

A clean, mobile-first web app to log your workouts, track personal records, and visualize your progress over time.

**[→ Try it live](https://workout-firebase-efeb3.web.app)**

---

## What it does

Log every workout session — exercises, sets, reps, and weight. The app automatically classifies your session (Push / Pull / Leg / Upper / Full Body), tracks your PRs, calculates total volume, and gives you charts showing how you've progressed over time.

At the end of the year, a **Year in Review** summary shows your biggest lifts, most active months, and overall stats.

---

## Features

**Workout Logging**
- Add exercises, sets, reps, and weight to any day
- Bodyweight exercise support (`BW` or `BW+X` notation for pull-ups, dips, etc.)
- Copy a past workout to a new day
- Automatic workout type detection (Push / Pull / Leg / Upper / Full Body)

**Progress Tracking**
- Personal record highlights — gold for new PRs, cyan for ties
- Exercise detail page with time-series charts (weight, volume, estimated 1RM)
- Filter by week / month / year / all time

**Calendar & Navigation**
- Weekly strip view — swipe left/right to move between weeks
- Monthly calendar with color-coded workout indicators
- Remembers your last selected date across sessions

**Exercise Library**
- 50+ built-in exercises with muscle group & category metadata
- Add your own custom exercises
- Rename an exercise and it updates across all historical records

**Account & Data**
- Sign in with Google (or email/password)
- Cloud sync via Firebase — access your data on any device
- Export your full workout history as JSON
- Import a JSON backup

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18, Tailwind CSS |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Auth & Database | Firebase (Auth + Realtime Database) |
| Build | Vite |

---

## Getting Started (Self-Hosted)

To run your own instance you need Node.js 18+ and a Firebase project.

### 1. Clone and install

```bash
git clone https://github.com/your-username/workout-trackerr.git
cd workout-trackerr
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project
2. Enable **Authentication** (Google provider + Email/Password)
3. Enable **Realtime Database** and set up rules (see `database.rules.json`)
4. Copy your web app config values

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview the production build
npm run preview
```

---

## Project Structure

```
src/
├── pages/
│   ├── MainPage.jsx            # Home — weekly view, workout entry
│   ├── ExercisesPage.jsx       # Exercise library
│   ├── ExerciseDetailPage.jsx  # Progress charts & PR history
│   ├── WorkoutDetailPage.jsx   # Single session details
│   ├── ProfilePage.jsx         # Account, export/import
│   └── LoginPage.jsx           # Authentication
├── components/                 # Reusable UI components
├── utils/
│   ├── storage-client.js       # Unified data read/write layer
│   ├── storage-firebase.js     # Firebase Realtime DB adapter
│   ├── workoutTypes.js         # Push/Pull/Leg classification logic
│   └── exerciseMetadata.js     # Exercise library & muscle groups
└── contexts/
    └── AuthContext.jsx         # Firebase Auth context
```

---

## Deployment

The app is ready to deploy to **Firebase Hosting** or **Netlify**.

**Firebase Hosting:**
```bash
npm run build
firebase deploy
```

**Netlify:** Connect the repo — build command is `npm run build`, publish directory is `dist`. Redirects are configured in `netlify.toml`.

---

## How to Use

1. **Sign in** with your Google account
2. **Select a date** on the weekly strip at the top
3. **Add a workout** — tap the + button and add exercises with sets, reps, and weight
4. **View progress** — go to the Exercises tab and tap any exercise to see your PR history and chart
5. **Browse history** — swipe the weekly strip or open the calendar to jump to any past date

---

Developed with ❤️ by [Bekir Goktepe](https://github.com/bekirgoktpe)
