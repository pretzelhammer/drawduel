## draw duel 🎨⚔️

Hackweek project!

## contributing

### setup

```bash
nvm use
npm ci
```

### develop

```bash
npm run dev
```

Then go to http://localhost:8888.

### deploy

All pushes to the `main` branch trigger a Github Action which deploys the code to production, which is at https://drawduel.com. Usually completes within 30 seconds.

### code organization

They key directories in this project are

```text
src
├── frontend
├── backend
└── agnostic
```

#### src/frontend

[TypeScript](https://www.typescriptlang.org/) + [Preact](https://preactjs.com/). Contains all of the frontend code for the project like: UI components, CSS, websocket client, general frontend utilities, etc.

Frontend code is built using [vite](https://vitejs.dev/).

There are two entry points: index & game.

The index entry point is the main home page of the site. Its template is at `/index.html` and it loads `/src/frontend/index/index.tsx` which loads `/src/frontend/index/IndexApp.tsx` which renders the main home page. If you want to make changes to this page you'll likely put them in `IndexApp.tsx`. See this page on prod here https://drawduel.com.

The game entry point is the page of the site where actual draw duel games are played. Its template is at `/game/index.html` and it loads `/src/frontend/game/game.tsx` which loads `/src/frontend/game/GameApp.tsx` which renders the game page. If you want to make changes to this page you'll likely put them in `GameApp.tsx`. See this page on prod here https://drawduel.com/game/.

Global CSS should be put in `/src/frontend/global.css` which is imported by both entry points. To scope CSS to a specific component, put it in a `*.module.css` file and import it within that component, see `/src/frontend/components/PingPong.tsx` and `/src/frontend/PingPong.module.css` as an example.

_"There's no client-side routing library, should I add one?"_

No. This project is simple enough that it doesn't need one.

_"There's no state management library, should I add one?"_

I don't think we'll need one. Let's see how far we get by just using [`useContext`](https://preactjs.com/guide/v10/hooks#usecontext) and then we'll re-evaluate if things start getting too confusing or messy.

#### src/backend

[TypeScript](https://www.typescriptlang.org/) + [Express](https://expressjs.com/) + [ws](https://github.com/websockets/ws). Contains all of the backend code for the project like: http routing, websocket server, general backend utilities, etc.

Backend code is run using [tsx](https://tsx.is/).

There's a single entry point: `/src/backend/server.ts`.

_"Where's the database? Should I add one?"_

There's no database. This project doesn't need one, all state is ephemeral.

_"How is production behind SSL but I don't see any SSL code in the project?"_

We proxy through Cloudflare, which gives us SSL/TLS, http -> https redirects, and www to non-www redirects for free!

#### src/agnostic

[TypeScript](https://www.typescriptlang.org/). Contains all code that can or needs to run on both the frontend and backend like: game logic, general utilities, etc.

### general Qs & As

_"During hackweek should I push my work directly to `main` or make PRs and get reviews?"_

I trust you to use your discretion on a case-by-case basis 😊
