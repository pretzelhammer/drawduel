import { type FunctionalComponent, type JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import classes from 'src/frontend/components/Canvas.module.css';

export interface BrushSettings {
	readonly color: string;
	readonly size: number;
}

export interface CanvasDimensions {
	readonly width: number;
	readonly height: number;
}

export interface CanvasProps {
	readonly brushSettings: BrushSettings;
	readonly canvasDimensions: CanvasDimensions;
}

export const Canvas: FunctionalComponent<CanvasProps> = ({ brushSettings, canvasDimensions }: CanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		let coord = {
			x: 0,
			y: 0,
		};

		const canvas = canvasRef.current;
		if (!canvas) {
			throw new Error('Could not get canvas');
		}

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get 2d context');
		}

		const start = (event: MouseEvent) => {
			canvas.addEventListener('mousemove', draw);
			reposition(event);
		};

		const stop = () => {
			canvas.removeEventListener('mousemove', draw);
		};

		const reposition = (event: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			coord = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			};
		};

		const draw = (event: MouseEvent) => {
			const { color, size } = brushSettings;
			context.beginPath();
			context.strokeStyle = color;
			context.lineWidth = size;
			context.lineCap = 'round';
			context.moveTo(coord.x, coord.y);
			reposition(event);
			context.lineTo(coord.x, coord.y);
			context.stroke();
		};

		canvas.addEventListener('mousedown', start);
		canvas.addEventListener('mouseup', stop);

		return () => {
			canvas.removeEventListener('mousedown', start);
			canvas.removeEventListener('mouseup', stop);
		};
	}, [brushSettings]);

	return (
		<canvas
			ref={canvasRef}
			class={classes['canvas']}
			width={canvasDimensions.width}
			height={canvasDimensions.height}
		/>
	);
};
