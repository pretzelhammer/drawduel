import { type FunctionalComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { Canvas } from 'src/frontend/components/Canvas.tsx';
import classes from 'src/frontend/game/components/DrawStage.module.css';

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

export const DrawStage: FunctionalComponent = () => {
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

	return (
		<div class={classes['stage']}>
			<Canvas
				brushSettings={{
					...brushSettings,
					color: brushSettings.tool === Tool.Eraser ? 'white' : brushSettings.color,
				}}
				canvasDimensions={canvasDimensions}
				ref={ref}
			/>
			<div class={classes['brush-options']}>
				<div class={classes['tools']}>
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
				<div class={classes['sizes']}>
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
				<div class={classes['colors']}>
					{colors.map((color) => (
						<button
							key={color}
							class={brushSettings.color === color ? classes['color--selected'] : ''}
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
		</div>
	);
};
