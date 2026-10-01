# PlantPulse — Client

Web app for **PlantPulse**, an app to keep track of your plants and when you water them.

- Save your plants with a photo, their species, how much water they need and how often.
- See what needs water today as a checklist, and tick plants off as you water them.
- See every plant's next watering, a history of past waterings, and a calendar of the upcoming ones.
- Search plant species (via the [Perenual API](https://perenual.com/docs/api), through the server) to fill in the species and watering frequency automatically.

**Live app:** https://plantpulse-nine.vercel.app

**Stack:** React 19 · TypeScript · Vite · React Router 7 · Tailwind CSS 4 · shadcn/ui (Radix) · FullCalendar 7 · date-fns · axios

The API lives in [PlantPulse-server](https://github.com/ale-almonacid/PlantPulse-server).

---

## How it works

```
PlantPulse-client (this repo)  ──►  PlantPulse-server  ──►  Supabase (PostgreSQL)   plants + water logs
                                                       ──►  Cloudinary              plant images
                                                       ──►  Perenual API            species search + watering info
```

- The **client only talks to the server**. It holds no secret keys.
- All requests go through one axios instance in `src/services/index.services.ts`, which reads the server URL from `VITE_SERVER_URL`.
- There is no login. The app has one shared set of plants.
- There is no global state (no context or store). Each page fetches what it needs and passes it down as props.

---

## Getting started

### Requirements
- Node.js 20+ (developed with Node 24)
- [PlantPulse-server](https://github.com/ale-almonacid/PlantPulse-server) running locally or deployed

### 1. Install
```bash
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
```

| Variable | Value |
|---|---|
| `VITE_SERVER_URL` | URL of the server, e.g. `http://localhost:5005` (a trailing `/` is ignored) |

> The `VITE_` prefix is required: Vite only exposes variables with that prefix to the app. The value ends up in the browser, so never put a secret in a `VITE_` variable.

### 3. Run
```bash
npm run dev
```
The app opens on `http://localhost:5173`. The server's `ORIGIN` variable must be set to this address, or the browser blocks the requests (CORS).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server |
| `npm run build` | Type-checks (`tsc -b`) and builds for production into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | Type-checks without building |
| `npm run lint` | Runs ESLint |
| `npm run format` | Formats `.ts` / `.tsx` files with Prettier |

---

## Pages

| Route | Page | What it shows |
|---|---|---|
| `/` | `DashboardPage` | Today's watering checklist, then all plants ordered by next watering |
| `/plants` | `PlantsListPage` | All plants as cards (ordered by next watering) and the "+ Plant" dialog |
| `/plants/:plantId` | `PlantDetailsPage` | Cover photo, watering info, species info from Perenual, watering history, edit and delete |
| `/waterings` | `WateringsPage` | Two tabs: **To do** (today's checklist + every plant's next watering) and **History** (past waterings by day) |
| `/calendar` | `CalendarPage` | Month calendar with each plant's watering as a repeating event |
| `*` | `NotFoundPage` | 404 |

---

## Project structure

```
src/
├── main.tsx                 Entry point: BrowserRouter + ThemeProvider + App
├── App.tsx                  Navbar + the routes
├── index.css                Tailwind, shadcn theme tokens, the "water" colours, the Checklist CSS
├── pages/                   One file per route
├── components/
│   ├── navigation/          Navbar
│   ├── plants/              Plant cards, dialogs, species search
│   ├── watering-logs/       To-do list, history, watering dialogs
│   ├── checklist/           The animated checklist row (adapted from Bencho)
│   └── ui/                  shadcn/ui components (generated, not hand-written)
├── lib/
│   ├── watering.ts          All the "when is the next watering" logic
│   ├── dates.ts             Date labels ("Today", "Yesterday"…)
│   └── utils.ts             shadcn's `cn` helper
├── services/                The axios instance
├── types/                   TypeScript types for Plant, WaterLog and species
└── assets/                  Logo and favicon
```

---

## Component architecture

Pages fetch the data and own it. Components receive it as props and report changes back through callback props (`onWatered`, `onPlantCreated`, `onWaterLogsChanged`…), and the page then re-fetches.

```
App
├── Navbar
└── Routes
    ├── DashboardPage
    │   ├── WateringTodoList (Today section only)
    │   │   ├── AllWateredEmpty
    │   │   └── WateringTodoCard ── ChecklistItem, PlantThumbnail
    │   └── PlantCard ── WateringBadge, LogWaterButton
    │
    ├── PlantsListPage
    │   ├── CreatePlantDialog ── SpeciesSearch ── SpeciesItem
    │   └── PlantCard ── WateringBadge, LogWaterButton
    │
    ├── PlantDetailsPage
    │   ├── EditPlantDialog ── SpeciesSearch ── SpeciesItem
    │   ├── DeletePlantDialog
    │   ├── WateringBadge, LogWaterButton
    │   └── SpeciesInfo ── SpeciesItem
    │
    ├── WateringsPage
    │   ├── WateringTodoList                       ("To do" tab)
    │   │   ├── AllWateredEmpty
    │   │   ├── WateringTodoCard ── ChecklistItem, PlantThumbnail
    │   │   └── WateringUpcomingCard ── PlantThumbnail
    │   └── WateringHistoryList                    ("History" tab)
    │       ├── DateSeparator
    │       └── WateringCard ── PlantThumbnail, EditWateringDialog, DeleteWateringDialog
    │
    ├── CalendarPage ── FullCalendar
    └── NotFoundPage
```

### Components

**Navigation** (`components/navigation/`)

| Component | What it does |
|---|---|
| `Navbar` | Floating pill navbar. Logo on the left, links on the right. Below 640px the links become a hamburger menu. |

**Plants** (`components/plants/`)

| Component | What it does |
|---|---|
| `PlantCard` | Card with the plant photo, name, species, water amount, the watering badge and the Log water button. Links to the details page. |
| `PlantThumbnail` | Small square plant photo for list items, with a leaf icon when there is no photo. |
| `WateringBadge` | "Water in 3 days" / "Water today" / "Overdue by 2 days". Red when overdue. |
| `LogWaterButton` | Logs a watering for a plant (dated now). Shows "Logging…" then "Watered". |
| `CreatePlantDialog` | Form to add a plant: name, species, water amount, frequency and an optional photo. Sent as form-data. |
| `EditPlantDialog` | Same form, pre-filled. A new photo replaces the old one. |
| `DeletePlantDialog` | Confirmation before deleting a plant, its photo and its waterings. |
| `SpeciesSearch` | Search box for the species. Searches Perenual (through the server) half a second after typing stops, and fills in the watering frequency when a result is picked. Free text still works if the API fails. |
| `SpeciesItem` | One species: Perenual picture, common name and scientific name. Used in the search results and on the details page. |
| `SpeciesInfo` | Looks up the plant's species on Perenual for the details page. |

**Waterings** (`components/watering-logs/`)

| Component | What it does |
|---|---|
| `WateringTodoList` | The "To do" tab. **Today**: every plant as a checklist, pending ones first. **Next waterings**: each plant's next date with a "Water now" button. Ticking logs a watering, unticking deletes it. |
| `WateringTodoCard` | One checklist row as a horizontal card: checkbox, photo, name and water amount. |
| `WateringUpcomingCard` | One "Next waterings" row: photo, name, "In 3 days · Sun 4 Oct" and the Water now button. |
| `AllWateredEmpty` | "You're all done for today" box with a Show list / Hide list button. |
| `WateringHistoryList` | The "History" tab: past waterings grouped by day, newest first. |
| `WateringCard` | One past watering: photo, plant, time, amount, and the edit and delete buttons. |
| `DateSeparator` | A line with the day in the middle: "Today", "Yesterday", "Tuesday 29 September 2026". |
| `EditWateringDialog` | Changes the date and time of a watering. |
| `DeleteWateringDialog` | Confirmation before deleting a watering. |

**Checklist** (`components/checklist/`)

| Component | What it does |
|---|---|
| `ChecklistItem` | The animated checkbox row (see [Bencho](#bencho-checklist) below). Knows nothing about plants: it gets `checked`, `onToggle`, a `label` and optional `media`, `description` and `aside` slots. |

**shadcn/ui** (`components/ui/`): `alert-dialog`, `badge`, `button`, `calendar`, `card`, `dialog`, `empty`, `field`, `input`, `label`, `popover`, `separator`, `tabs`. These are generated by the shadcn CLI and left as they come.

---

## Watering logic

Everything is derived from two values: the plant's **last watering** and its **frequency** (days between waterings). It lives in `src/lib/watering.ts`.

- **Next watering** = last watering + frequency. A plant that was never watered is due today.
- `getDaysUntilWatering(plant)` returns `0` for today, a negative number when overdue, a positive number for days left. The badge, the to-do list, the plant order and the calendar all use it.
- Days are counted as calendar days (`differenceInCalendarDays`), so a plant watered last night shows "tomorrow" the next morning.
- `sortByNextWatering(plants)` orders plants: overdue first, then today, then the rest.

The server stores dates in UTC. The browser converts them to local time, so "today" means today where the user is.

---

## Libraries, and how they were adapted

### shadcn/ui
Style `radix-vega` (the Radix version, so triggers use `asChild`), with [lucide](https://lucide.dev) icons. New components are added with:
```bash
npx shadcn@latest add <component>
```
Several app components start from a shadcn example:

| App component | shadcn example | What changed |
|---|---|---|
| `PlantCard` | Card with image | The grey, darkened image overlay was removed so plant photos keep their colours. Badge and button are wired to the watering data. |
| `WateringCard`, `WateringTodoCard`, `WateringUpcomingCard` | Card | Laid out horizontally as list items. The thumbnail is wrapped in an element, because `Card` removes its top padding when an `<img>` is its first child. |
| `AllWateredEmpty` | Empty (outline) | No dashed border, the "water" blue as background, lucide `Droplets` icon. |
| `EditWateringDialog` | Date picker with time | Starts from the watering's saved date and time. Hours and minutes only. |
| `DeletePlantDialog`, `DeleteWateringDialog` | Alert dialog | The dialog stays open until the request finishes (`AlertDialogAction` closes on click by default) and shows the error if it fails. |

### FullCalendar
[FullCalendar 7](https://fullcalendar.io/docs/react) (`@fullcalendar/react`) draws the calendar page, with the `dayGridMonth` view and the `monarch` theme.

- **Repeating events:** FullCalendar's built-in recurrence only works by weekday, so "every 5 days" uses the [`@fullcalendar/rrule`](https://fullcalendar.io/docs/rrule-plugin) plugin with the `rrule` library. Each plant is one event with the rule `{ freq: "daily", interval: plant.frequency, dtstart: <next watering> }`. FullCalendar works out the dates for whichever month is on screen.
- **Colours:** the theme's CSS variables (`--fc-monarch-event`, `--fc-monarch-tertiary`…) are overridden on the page wrapper so events and the "today" circle use the app's water colours.
- **Toolbar:** v7 shows no toolbar by default, so `headerToolbar` is set (title, Today, previous, next).
- Clicking an event opens that plant's details page.
- `temporal-polyfill` is a required peer dependency of FullCalendar 7. The app does not use it directly.

### Bencho Checklist
The tick animation in the to-do list comes from the **Checklist** component by [Bencho](https://bencho.dev/?c=checklist) (MIT licence, [bencho.dev/licence](https://bencho.dev/licence)), adapted in `src/components/checklist/Checklist.tsx`.

**Kept** (with the original comments):
- One spring per row, driven by `requestAnimationFrame`. A single number goes from 0 to 1 and four things read it: the box fill, the tick drawing itself, the line crossing out the name, and the name fading.
- The small overshoot on the box, and the line starting slightly after the box.
- Respecting the device's "reduce motion" setting.

**Removed:**
- The ending where the list falls into a heap when every item is ticked. Here ticked items stay in place.
- The three-second reset to sample tasks and the "Add new task" row.
- `framer-motion`, which was only needed for the fall.

**Changed:**
- The row takes `media`, `description` and `aside` slots, so it can hold a plant photo and details.
- Bencho's design tokens are mapped to the shadcn ones in `index.css`: the fill and ring use `--foreground`, the tick uses `--card`. Bencho builds `rgba()` from RGB numbers; the shadcn colours are `oklch`, so those became `color-mix()`, which also follows dark mode.

### Other libraries

| Library | Used for |
|---|---|
| `react-router-dom` | The routes and navigation |
| `axios` | Requests to the server |
| `date-fns` | Date maths (`addDays`, `differenceInCalendarDays`) and formatting (`format`) |
| `react-day-picker` | What shadcn's `Calendar` is built on (the date picker in the edit watering dialog) |
| `lucide-react` | Icons |
| `@fontsource-variable/inter` | The Inter font |

### Colours
The app's blue is defined once in `index.css` as two Tailwind theme colours:

| Name | Value | Used as |
|---|---|---|
| `water` | `#D9E7ED` | `bg-water` — Log water button, calendar events, the "all done" box |
| `water-foreground` | `#20535E` | `text-water-foreground` — text and icons on top of it |

---

## Deployment (Vercel)

- `vercel.json` rewrites every path to `index.html`, so refreshing or opening a link like `/plants/123` works (React Router handles the URL).
- Set `VITE_SERVER_URL` in the Vercel project to the deployed server URL. Vite reads it at build time, so redeploy after changing it.
- On the **server's** Vercel project, `ORIGIN` must be the client's address (`https://plantpulse-nine.vercel.app`), or the browser blocks the requests.

---

## Credits

- Checklist animation: [Bencho](https://bencho.dev) (MIT)
- UI components: [shadcn/ui](https://ui.shadcn.com)
- Calendar: [FullCalendar](https://fullcalendar.io)
- Plant data: [Perenual](https://perenual.com)
- Icons: [Lucide](https://lucide.dev)
