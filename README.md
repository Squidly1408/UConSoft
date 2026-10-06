![UConSoft Banner](./.github/banner.png)

# UConSoft – WIL Network

React web app for the University of Newcastle's Work Integrated Learning network. Students publish
portfolios and apply for placements, staff sign off student work, industry partners post opportunities
and see ranked student matches, and administrators manage accounts and content.

Everything runs in the browser on model data (`src/data.js`), saved to localStorage. There is no backend yet.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static build in dist/
npm run build:single # one self-contained HTML file in dist-single/
```

## Demo accounts

Every seeded account uses the password `demo1234`. The sign-in page also has one-click demo buttons.

| Role                                | Email                           |
| ----------------------------------- | ------------------------------- |
| Student                             | liam.chen@uon.edu.au            |
| Staff                               | priya.raman@newcastle.edu.au    |
| Industry partner                    | emma.roberts@hunter-eng.example |
| Industry partner (pending approval) | raj.mehta@portcity.example      |
| Admin                               | sam.rivera@newcastle.edu.au     |

Use **Reset demo data** in the account menu or Settings → Preferences to restore the seed.

## Accounts and what they can do

- **Student**: sign up with an `@uon.edu.au` email, build a profile (degree, skills, interests, availability, links),
  publish projects, request sign-off from staff or a partner, browse opportunities ranked by match, apply and track applications.
- **Staff**: sign up with an `@newcastle.edu.au` email (an admin approves it). Review sign-off requests (approve or ask for changes)
  and browse students and their work.
- **Industry partner**: sign up with any work email (an admin approves it). Post and manage opportunities, see ranked candidates and applicants,
  move applicants through statuses, keep a shortlist pipeline with private notes, sign off WIL projects, and view reports.
- **Admin**: approve, suspend, edit, create and delete accounts; hide, restore or delete reported projects; close opportunities;
  read and export the activity log.

Everyone can edit their profile and account (email, password, theme, delete account), message other users and get notifications.
Profiles (`#/u/:id`) and projects (`#/work/:id`) can be opened without signing in, so students can share their portfolio link.

## What's inside

- `src/App.jsx` – routes and role guards (hash-based, so it works on any static host)
- `src/store.jsx` – app state and every action (auth, profiles, projects, sign-offs, opportunities, applications, messages, notifications, activity log)
- `src/data.js` – seed data and option lists. Replace `seed()` with API calls when there is a backend.
- `src/matching.js` – match scoring: skills, project relevance, course alignment, availability, interests (weights in `WEIGHTS`)
- `src/hooks.js` – derived data (visible projects, ranked students, a company's opportunities)
- `src/pages/` – one file per screen; `Home.jsx` holds the four role dashboards, `Admin.jsx` the admin screens
- `src/components/` – layout shell, shared UI and forms

All people, companies and projects are made up.
