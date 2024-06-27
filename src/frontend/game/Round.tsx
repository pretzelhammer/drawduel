import { type FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { DrawStage, Mode } from 'src/frontend/components/DrawStage.tsx';
import classes from 'src/frontend/game/Round.module.css';
import { Canvas, CanvasMode, DrawData } from 'src/frontend/components/Canvas.tsx';

export interface TeamPreview {
	readonly teamName: string;
	readonly drawer: string;
	// TODO: replace unknown with the correct type
	readonly canvasPreview: DrawData;
}

export interface RoundProps {
	readonly teamName: string;
	readonly teamPreviews: TeamPreview[];
	// TODO: remove. this is for testing
	readonly onDraw: (drawData: DrawData) => void;
}

export const Round: FunctionalComponent<RoundProps> = ({ teamName, teamPreviews, onDraw }: RoundProps) => {
	// TODO: server stuff. thanks kirill
	const [mode, setMode] = useState(Mode.Draw);
	const [guess, setGuess] = useState('');
	const time = '1:00';
	// TODO: kirill I need a function that sends to server...

	const word = mode === Mode.Draw ? 'word' : '_ _ _ _';
	// const onDraw = () => {};

	const previews =
		teamPreviews.length > 0 ? (
			<div className={classes['previews']}>
				{teamPreviews.map((preview) => (
					<div class={classes['preview']}>
						<div class={classes['preview-header']}>
							<h3>{preview.teamName}</h3>
							<h3>✏️ {preview.drawer}</h3>
						</div>
						<div class={classes['canvas']}>
							<Canvas mode={{ name: CanvasMode.Preview, drawData: preview.canvasPreview }} />
						</div>
					</div>
				))}
			</div>
		) : null;

	return (
		<>
			<div class={classes['stage']}>
				<div>
					<div className={classes['header']}>
						<div className={classes['word-timer']}>
							<h2>{word}</h2>
							<h2>{time}</h2>
						</div>
						<h2>{teamName}</h2>
					</div>
					<DrawStage mode={mode} onGuess={setGuess} onDraw={onDraw} />
				</div>
				{previews}
			</div>
			<button onClick={() => setMode(mode === Mode.Guess ? Mode.Draw : Mode.Guess)}>toggle modes</button>
		</>
	);
};
