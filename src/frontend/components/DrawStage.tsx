import { type FunctionalComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { Brush, Canvas, CanvasMode, DrawData, PreviewMode } from 'src/frontend/components/Canvas.tsx';
import classes from 'src/frontend/components/DrawStage.module.css';
import { LineInput } from 'src/frontend/components/LineInput.tsx';

export enum Color {
	Black = 'black',
	Gray = 'gray',
	Pink = 'pink',
	Red = 'red',
	Orange = 'orange',
	Yellow = 'yellow',
	Green = 'green',
	Blue = 'blue',
	Purple = 'purple',
	Brown = 'brown',
}

export enum Size {
	Small = 4,
	Medium = 12,
	Large = 24,
}

const SIZES = [
	{ name: 'small', size: Size.Small },
	{ name: 'medium', size: Size.Medium },
	{ name: 'large', size: Size.Large },
];

const BRUSH = [
	{ icon: '✏️', brush: Brush.Pencil },
	{ icon: '🧽', brush: Brush.Eraser },
];

export enum Mode {
	Draw = 'MODE_DRAW',
	Guess = 'MODE_GUESS',
}

export interface DrawStageProps {
	readonly mode: Mode;
	readonly onDraw: (drawData: DrawData) => void;
	readonly onGuess: (guess: string) => void;
}

export const DrawStage: FunctionalComponent<DrawStageProps> = ({ mode, onDraw, onGuess }) => {
	const [guess, setGuess] = useState('');
	const [brushSettings, setBrushSettings] = useState({
		color: Color.Black,
		size: Size.Small,
		brush: Brush.Pencil,
	});
	const canvasDimensions = {
		width: 600,
		height: 400,
	};
	const colors = Object.values(Color);

	const onClearClick = () => {
		console.log('clear');
		setBrushSettings({
			...brushSettings,
			brush: Brush.Clear,
		});
	};

	const onClearFromCanvas = () => {
		console.log('unclear');
		// setBrushSettings({
		// 	...brushSettings,
		// 	brush: Brush.Pencil,
		// });
	};

	const DrawSideBar = (
		<div className={classes['draw-mode']}>
			<div className={classes['tools']}>
				{BRUSH.map(({ icon, brush }) => (
					<button
						key={brush}
						onClick={() =>
							setBrushSettings({
								...brushSettings,
								brush,
							})
						}
						className={brushSettings.brush === brush ? classes['tool--selected'] : ''}
					>
						{icon}
					</button>
				))}

				<button onClick={onClearClick}>️🗑</button>
			</div>
			<div className={classes['sizes']}>
				{SIZES.map(({ name, size }) => (
					<button
						key={name}
						onClick={() =>
							setBrushSettings({
								...brushSettings,
								size,
							})
						}
					>
						<div
							className={`${classes[name]} ${brushSettings.size === size ? classes['size--selected'] : ''}`}
						></div>
					</button>
				))}
			</div>
			<div className={classes['colors']}>
				{colors.map((color) => (
					<button
						key={color}
						className={brushSettings.color === color ? classes['color--selected'] : ''}
						style={{ backgroundColor: color }}
						onClick={() =>
							setBrushSettings({
								...brushSettings,
								brush: Brush.Pencil,
								color,
							})
						}
					></button>
				))}
			</div>
		</div>
	);

	const GuessSideBar = (
		<div class={classes['guess-mode']}>
			<LineInput
				placeholder="enter guess here.."
				value={guess}
				onInput={(event) => setGuess((event.target as HTMLInputElement).value)}
			/>
			<button onClick={() => onGuess(guess)}>Guess</button>
		</div>
	);

	return (
		<div className={classes['stage']}>
			<Canvas
				mode={{
					name: CanvasMode.Draw,
					brushSettings,
					canvasDimensions,
					onDraw,
					onClear: onClearFromCanvas,
				}}
			/>
			{mode === Mode.Draw ? DrawSideBar : GuessSideBar}
		</div>
	);
};
