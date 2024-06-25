import { type FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
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

export const DrawStage: FunctionalComponent = () => {
	const [color, setColor] = useState(Color.Black);
	const [brushSettings, setBrushSettings] = useState({
		color: Color.Black,
		size: Size.Small,
	});
	const canvasDimensions = {
		width: 400,
		height: 400,
	};
	const colors = Object.values(Color);
	return (
		<div class={classes['stage']}>
			<Canvas brushSettings={brushSettings} canvasDimensions={canvasDimensions} />
			<div class={classes['brush-options']}>
				<div class={classes['tools']}>
					<button>
						<p>✏️</p>️
					</button>
					<button>🧽</button>
					<button>🗑️</button>
				</div>
				<div class={classes['sizes']}>
					<button>
						<div class={classes['small']}></div>
					</button>
					<button>
						<div class={classes['medium']}></div>
					</button>
					<button>
						<div class={classes['large']}></div>
					</button>
				</div>
				<div class={classes['colors']}>
					{colors.map((color) => (
						<button
							class={brushSettings.color === color ? classes['color--selected'] : ''}
							style={{ backgroundColor: color }}
							onClick={() =>
								setBrushSettings({
									...brushSettings,
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
