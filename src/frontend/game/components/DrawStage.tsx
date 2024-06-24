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

export const DrawStage: FunctionalComponent = () => {
	const [color, setColor] = useState(Color.Black);
	const brushSettings = {
		color: 'black',
		size: 2,
	};
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
						<button style={{ backgroundColor: color }} onClick={() => setColor(color)}></button>
					))}
				</div>
			</div>
		</div>
	);
};
