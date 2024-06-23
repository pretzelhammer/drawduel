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

[TypeScript](https://www.typescriptlang.org/) + [Express](https://expressjs.com/) + [socket.io](https://socket.io/). Contains all of the backend code for the project like: http routing, websocket server, general backend utilities, etc.

Backend code is run using [tsx](https://tsx.is/).

There's a single entry point: `/src/backend/server.ts`.

_"Where's the database? Should I add one?"_

There's no database. This project doesn't need one, all state is ephemeral.

_"How is production behind SSL but I don't see any SSL code in the project?"_

We proxy through Cloudflare, which gives us SSL/TLS, http -> https redirects, and www to non-www redirects for free!

#### src/agnostic

[TypeScript](https://www.typescriptlang.org/). Contains all code that can or needs to run on both the frontend and backend like: game logic, general utilities, etc.

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

### general Qs & As

_"During hackweek should I push my work directly to `main` or make PRs and get reviews?"_

I trust you to use your discretion on a case-by-case basis 😊
