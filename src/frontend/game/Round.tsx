import { type FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { DrawStage, Mode } from 'src/frontend/components/DrawStage.tsx';

export interface TeamPreview {
	readonly teamName: string;
	readonly drawer: string;
	// TODO: replace unknown with the correct type
	readonly canvasPreview: unknown;
}

export interface RoundProps {
	readonly teamName: string;
	readonly teamPreviews: TeamPreview[];
}

export const Round: FunctionalComponent<RoundProps> = ({ teamName, teamPreviews }: RoundProps) => {
	// TODO: server stuff. thanks kirill
	const [mode, setMode] = useState(Mode.Draw);
	const [guess, setGuess] = useState('');
	const time = '1:00';
	// TODO: kirill I need a function that sends to server...
	const onDraw = () => {};
	return (
		<>
			<div>
				<div>
					<h2>{time}</h2>
					<h3>{teamName}</h3>
				</div>
				<DrawStage mode={mode} onGuess={setGuess} onDraw={onDraw} />
			</div>
			<div class="previews">
				{teamPreviews.map(() => (
					<div>TODO</div>
				))}
			</div>
			<button onClick={() => setMode(mode === Mode.Guess ? Mode.Draw : Mode.Guess)}>toggle modes</button>
		</>
	);
};
