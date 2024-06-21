import { randomShortId } from 'src/agnostic/utils.ts';
import 'src/frontend/index/index-app.css';

export default function IndexApp() {
	const shortId = randomShortId();
	const gameLink = `/game/#${shortId}`;
	return (
		<>
			<h1>draw duel 🎨⚔️</h1>
			<h2>home page</h2>
			<a class="button" href={gameLink}>
				new game
			</a>
		</>
	);
};
