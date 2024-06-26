import { type FunctionalComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { Canvas, CanvasMode, DrawData, PreviewMode } from 'src/frontend/components/Canvas.tsx';
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

export enum Tool {
	Pencil = 'TOOL_PENCIL',
	Eraser = 'TOOL_ERASER',
}

const SIZES = [
	{ name: 'small', size: Size.Small },
	{ name: 'medium', size: Size.Medium },
	{ name: 'large', size: Size.Large },
];

const TOOLS = [
	{ icon: '✏️', tool: Tool.Pencil },
	{ icon: '🧽', tool: Tool.Eraser },
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
	const ref = useRef<HTMLCanvasElement | null>(null);
	const [brushSettings, setBrushSettings] = useState({
		color: Color.Black,
		size: Size.Small,
		tool: Tool.Pencil,
	});
	const canvasDimensions = {
		width: 400,
		height: 400,
	};
	const colors = Object.values(Color);

	const onClearClick = () => {
		const canvas = ref.current;
		if (!canvas) {
			throw new Error('Could not get canvas');
		}
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get 2d context');
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
	};

	const DrawSideBar = (
		<div className={classes['draw-mode']}>
			<div className={classes['tools']}>
				{TOOLS.map(({ icon, tool }) => (
					<button
						key={tool}
						onClick={() =>
							setBrushSettings({
								...brushSettings,
								tool,
							})
						}
						className={brushSettings.tool === tool ? classes['tool--selected'] : ''}
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
								tool: Tool.Pencil,
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
					brushSettings: {
						...brushSettings,
						color: brushSettings.tool === Tool.Eraser ? 'white' : brushSettings.color,
					},
					canvasDimensions,
					onDraw,
				}}
				ref={ref}
			/>
			{mode === Mode.Draw ? DrawSideBar : GuessSideBar}
		</div>
	);
};
