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

Global CSS should be put in `/src/frontend/global.css` which is imported by both entry points. To scope CSS to a specific component, put it in a `*.module.css` file and import it within that component, see `lineInput.tsx` and `LineInput.module.css` as an example.

_"There's no client-side routing library, should I add one?"_

No. This project is simple enough that it doesn't need one.

_"There's no state management library, should I add one?"_

I don't think we'll need one. Let's see how far we get by just using [`useContext`](https://preactjs.com/guide/v10/hooks#usecontext) and then we'll re-evaluate if things start getting too confusing or messy.

#### src/backend

[TypeScript](https://www.typescriptlang.org/) + [Express](https://expressjs.com/) + [socket.io](https://socket.io/). Contains all of the backend code for the project like: http routing, websocket server, general backend utilities, etc.

Backend code is run using [tsx](https://tsx.is/).

There's a single entry point: `/src/backend/server.ts`.

_"Where's the database? Should I add one?"_

There's no database. This project doesn't need one, all state is ephemeral.

_"How is production behind SSL but I don't see any SSL code in the project?"_

We proxy through Cloudflare, which gives us SSL/TLS, http -> https redirects, and www to non-www redirects for free!

#### src/agnostic

[TypeScript](https://www.typescriptlang.org/). Contains all code that can or needs to run on both the frontend and backend like: game logic, general utilities, etc.

### state organization

State logic is spread across three key files: `gameState.ts`, `clientContext.ts`, and `serverContext.ts`. If you'd like to see a reference PR that touches all three of these files to implement a new feature in the game (changing player name) you can [see that here](https://github.com/pretzelhammer/drawduel/pull/3).

#### src/agnostic/gameState.ts

This file contains definitions of the game state and of game events that can advance the game state.

#### src/frontend/clientContext.ts

This file contains the definition of the client context. The main two parts of the client context are the game state and the client state. The game state represents the state of the game, and should stay in sync with the server at all times. The client state represents state specific to this client, and that the server doesn't need to know about or shouldn't know about.

#### src/backend/serverContext.ts

This file contains the definition of the the server context. Inside the server context is a map of game ids to server game contexts, since the server can handle multiple concurrent games. Inside each server game context is the game state and server state. The game state represents the state of the game, and should be synced with all clients at all times. The server state represents state specific to this game for all clients, but is information that the clients don't need to know about or shouldn't know about.

### code style conventions

All imports should use an absolute url:

```ts
// ❌ - No
import { randomShortId } from '../../agnostic/random.ts';
import './global.css';

// ✅ - Yes!
import { randomShortId } from 'src/agnostic/random.ts';
import 'src/frontend/global.css';
```

All imports should contain an extension:

```ts
// ❌ - No
import Button from 'src/frontend/components/Button';
import utils from 'src/agnostic/utils';
import 'src/frontend/global';

// ✅ - Yes!
import Button from 'src/frontend/components/Button.tsx';
import utils from 'src/agnostic/utils.ts';
import 'src/frontend/global.css';
```

Import only specific functions from `lodash`, not the entire lib:

```ts
// ❌ - No
import { isObject } from 'lodash-es';

// ✅ - Yes!
import isObject from 'lodash-es/isObject';
```

Prefix type imports with the `type` keyword:

```ts
// ❌ - No
import { GameState, PlayerId } from 'src/agnostic/gameState.ts';

// ✅ - Yes!
import { type GameState, type PlayerId } from 'src/agnostic/gameState.ts';
```

Prefer functional components over class components:

```ts
// ❌ - No
import { Component } from 'preact';
interface MyComponentProps {
	// etc
}
class MyComponent extends Component<MyComponentProps> {
	// etc
}

// ✅ - Yes!
import { type FunctionalComponent } from 'preact';
interface MyComponentProps {
	// etc
}
const MyComponent: FunctionalComponent<MyComponentProps> = (props) => {
	// etc
};
```

Prefer named exports over default export:

```ts
// ❌ - No
const MyComponent: FunctionalComponent = () => {
	// etc
};
export default MyComponent;

// ✅ - Yes!
export const MyComponent: FunctionalComponent = () => {
	// etc
};
```

Since this is a `preact` and not a `react` project, use the `class` attribute instead of the `className` attribute in JSX:

```tsx
// ❌ - No
const MyComponent: FunctionalComponent = () => {
	return <button className="button">button</button>;
};

// ✅ - Yes!
const MyComponent: FunctionalComponent = () => {
	return <button class="button">button</button>;
};
```

Also, since this is a `preact` project and not a `react` project, use the `onInput` event handler on input elements instead of `onChange`:

```tsx
// ❌ - No
const MyComponent: FunctionalComponent = (props) => {
	return <input type="text" onChange={props.onChange} />;
};

// ✅ - Yes!
const MyComponent: FunctionalComponent = (props) => {
	return <input type="text" onInput={props.onInput} />;
};
```

We should probably should add [eslint](https://eslint.org/) to this project to catch those cases when we have time. Don't want to go down an eslint config rabbit hole right now.

### dev tips

#### tooling

Since this is largely a TypeScript and Preact project it'd good to use an IDE with strong TypeScript support like [VSCode](https://code.visualstudio.com/) and install the [Preact DevTools](https://preactjs.github.io/preact-devtools/) extension for your browser.

#### impersonating multiple players at once

Since this is a multiplayer game we'll have impersonate many players at once to test stuff in local dev. Convenient support for this is already implemented in this project and it's called "personas". To create or use a player "persona" just append a dash and some string after the game id in the game url. For example, if this is the game url:

http://localhost:8888/game/#test

You can create three "personas" to play the game with these urls, as an example:

1.  http://localhost:8888/game/#test-alex
1.  http://localhost:8888/game/#test-bob
1.  http://localhost:8888/game/#test-chris

The "personas" are managed entirely by the client and the server isn't aware of them. They also persist between games, although the only player-facing data within a "persona" is the player name.

### general Qs & As

_"During hackweek should I push my work directly to `main` or make PRs and get reviews?"_

I trust you to use your discretion on a case-by-case basis 😊

### production server maintainence

The production server is a Ubuntu VPS. The drawduel server is run as a systemd service. The systemd service config file for drawduel is in the `production` directory of this project, among other production-only files. Handy commands for managing the drawduel service on production:

```bash
# start drawduel
systemctl start drawduel

# stop drawduel
systemctl stop drawduel

# tells systemd to reload config files
# use to run before restart if they
# may have changed
systemctl daemon-reload

# restart drawduel
systemctl restart drawduel

# see status of drawduel
systemctl status drawduel

# enable drawduel on startup
systemctl enable drawduel

# disable drawduel on startup
systemctl disable drawduel

# see all drawduel logs (even across restarts)
journalctl -u drawduel

# see real-time drawduel logs (similar to tail -f)
journalctl -u drawduel -f

# see 50 most recent drawduel logs
journalctl -u drawduel -n 50
```
