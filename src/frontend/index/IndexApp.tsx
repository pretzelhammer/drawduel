import { useState } from 'preact/hooks';
import { randomShortId } from 'src/agnostic/random.ts';
import 'src/frontend/index/index-app.css';
import LineInput from 'src/frontend/components/LineInput.tsx';
import { ChangeEvent } from 'react';

export default function IndexApp() {
	const shortId = randomShortId();
	const gameLink = `/game/#${shortId}`;
	const [code, setCode] = useState('');
	return (
		<>
			<h1>draw duel 🎨⚔️</h1>
			<h2>home page</h2>
			<div className="button-group">
				<a className="button" href={gameLink}>
					new game
				</a>
				<div className="join-game">
					<LineInput
						placeholder="enter 4-letter code"
						value={code}
						onChange={(event) => setCode((event.target as HTMLInputElement).value)}
					/>
					<a className="button" href={`/game/#${code}`}>
						join game
					</a>
				</div>
			</div>
		</>
	);
}
