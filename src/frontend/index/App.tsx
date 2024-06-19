import { randomShortCode } from 'src/agnostic/utils.ts';
import PingPong from 'src/frontend/components/PingPong.tsx';
import 'src/frontend/index/app.css';

export function App() {
	const shortCode = randomShortCode();
	const gameLink = `/game/#${shortCode}`;
	return (
		<>
			<h1>draw duel 🎨⚔️</h1>
			<a class="button" href={gameLink}>
				new game
			</a>
			<PingPong />
		</>
	);
}
