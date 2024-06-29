import { type FunctionalComponent, type JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Maybe } from 'src/agnostic/types';
import classes from 'src/frontend/components/Canvas.module.css';

interface CanvasState {
	drawEvents: DrawEvent[];
}

interface SetTool {
	type: 'set-tool';
	data: 'brush' | 'fill';
}

type DrawEvent = [x1: number, y1: number, x2: number, y2: number];

function drawSmoothLine(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
}

/**
 * idk how this works, i asked chatGPT to generate
 * this function and it delivered
 */
function drawPixelatedLine(
	context: CanvasRenderingContext2D,
	pixelSize: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) {
	const dx = Math.abs(x2 - x1);
	const dy = Math.abs(y2 - y1);
	const sx = x1 < x2 ? 1 : -1;
	const sy = y1 < y2 ? 1 : -1;
	let err = dx - dy;

	while (true) {
		context.fillRect(
			Math.floor(x1 / pixelSize) * pixelSize,
			Math.floor(y1 / pixelSize) * pixelSize,
			pixelSize,
			pixelSize,
		);

		if (x1 === x2 && y1 === y2) break;
		const e2 = err * 2;
		if (e2 > -dy) {
			err -= dy;
			x1 += sx;
		}
		if (e2 < dx) {
			err += dx;
			y1 += sy;
		}
	}
}

/**
 * idk how this works, i asked chatGPT to generate
 * this function and it delivered
 */
function drawAntiAliasedPixelatedLine(
	context: CanvasRenderingContext2D,
	pixelSize: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) {
	const dx = Math.abs(x2 - x1);
	const dy = Math.abs(y2 - y1);
	const sx = x1 < x2 ? 1 : -1;
	const sy = y1 < y2 ? 1 : -1;
	let err = dx - dy;

	while (true) {
		drawAntiAliasedPixel(context, pixelSize, x1, y1);

		if (x1 === x2 && y1 === y2) break;
		const e2 = err * 2;
		if (e2 > -dy) {
			err -= dy;
			x1 += sx;
		}
		if (e2 < dx) {
			err += dx;
			y1 += sy;
		}
	}
}

/**
 * idk how this works, i asked chatGPT to generate
 * this function and it delivered
 */
function drawAntiAliasedPixel(context: CanvasRenderingContext2D, pixelSize: number, x: number, y: number) {
	context.fillRect(
		Math.floor(x / pixelSize) * pixelSize,
		Math.floor(y / pixelSize) * pixelSize,
		pixelSize,
		pixelSize,
	);

	// Add anti-aliasing around the edges
	context.globalAlpha = 0.05;
	context.fillRect(
		Math.floor(x / pixelSize) * pixelSize - pixelSize,
		Math.floor(y / pixelSize) * pixelSize,
		pixelSize,
		pixelSize,
	);
	context.fillRect(
		Math.floor(x / pixelSize) * pixelSize + pixelSize,
		Math.floor(y / pixelSize) * pixelSize,
		pixelSize,
		pixelSize,
	);
	context.fillRect(
		Math.floor(x / pixelSize) * pixelSize,
		Math.floor(y / pixelSize) * pixelSize - pixelSize,
		pixelSize,
		pixelSize,
	);
	context.fillRect(
		Math.floor(x / pixelSize) * pixelSize,
		Math.floor(y / pixelSize) * pixelSize + pixelSize,
		pixelSize,
		pixelSize,
	);
	context.globalAlpha = 1.0;
}

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
const contextSettings: CanvasRenderingContext2DSettings = {
	alpha: false,
	colorSpace: 'srgb',
	desynchronized: true, // lets see if this does anything
};

export const StatefulCanvas: FunctionalComponent = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const drawEvents = useRef<DrawEvent[]>([]);
	const drawnEvents = useRef<number>(0);

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const context = canvasRef.current.getContext('2d', contextSettings);
		if (!context) {
			throw new Error('Could not get 2d context');
		}
		context.fillStyle = 'white';
		context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

		function resizeCanvas() {
			// maintain 4:3 aspect ratio
			canvasRef.current!.width = canvasRef.current!.parentElement!.clientWidth;
			canvasRef.current!.height = (canvasRef.current!.parentElement!.clientWidth * 3) / 4;
			context!.fillStyle = 'white';
			context!.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
			for (let i = 0; i < drawEvents.current.length; i++) {
				let [x1, y1, x2, y2] = drawEvents.current[i];
				drawSmoothLine(context!, x1, y1, x2, y2);
			}
		}

		window.addEventListener('resize', resizeCanvas);

		resizeCanvas();

		const thickness = 5;
		const lineWidth = thickness;
		const pixelSize = thickness * 2;

		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.fillStyle = 'black';
		context.strokeStyle = 'black';
		context.lineWidth = lineWidth;

		let drawing = false;
		let lastX = 0;
		let lastY = 0;

		canvasRef.current.addEventListener('mousedown', (mouseEvent: MouseEvent) => {
			drawing = true;
			lastX = mouseEvent.offsetX;
			lastY = mouseEvent.offsetY;
			// drawSmoothLine(context, lastX, lastY, lastX, lastY);
			// setDrawEvents((drawEvents) => [...drawEvents, [lastX, lastY, lastX, lastY]]);
			drawEvents.current = [...drawEvents.current, [lastX, lastY, lastX, lastY]];
			// drawPixelatedLine(context, pixelSize, lastX, lastY, lastX, lastY);
			// drawAntiAliasedPixelatedLine(context, pixelSize, lastX, lastY, lastX, lastY);
		});

		canvasRef.current.addEventListener('mousemove', (mouseEvent: MouseEvent) => {
			// console.log(mouseEvent);

			if (!(mouseEvent.buttons & 1)) {
				// left mouse button pressed
				// stopped drawing
				drawing = false;
				lastX = 0;
				lastY = 0;
			}

			if (drawing) {
				// drawSmoothLine(context, lastX, lastY, mouseEvent.offsetX, mouseEvent.offsetY);
				// setDrawEvents((drawEvents) => [...drawEvents, [lastX, lastY, lastX, lastY]]);
				drawEvents.current = [...drawEvents.current, [lastX, lastY, lastX, lastY]];
				// drawPixelatedLine(context, pixelSize, lastX, lastY, lastX, lastY);
				// drawAntiAliasedPixelatedLine(context, pixelSize, lastX, lastY, lastX, lastY);
				lastX = mouseEvent.offsetX;
				lastY = mouseEvent.offsetY;
			}
		});

		useEffect(() => {
			if (!canvasRef.current) {
				return;
			}
			const context = canvasRef.current.getContext('2d', contextSettings);
			if (!context) {
				throw new Error('couldnt get context');
			}
			console.log({ drawnEvents, drawEventsLength: drawEvents.current.length });
			for (let i = drawnEvents.current; i < drawEvents.current.length; i++) {
				let [x1, y1, x2, y2] = drawEvents.current[i];
				drawSmoothLine(context, x1, y1, x2, y2);
			}
			drawnEvents.current = drawEvents.current.length;
		}, [canvasRef.current, drawEvents.current]);

		return () => {
			if (canvasRef.current) {
				// canvasRef.current.removeEventListener('mousedown');
				// canvasRef.current.removeEventListener('mousedown');
			}
		};
	}, [canvasRef.current]);

	return (
		<div style={{ width: '50%', height: '50%' }}>
			<canvas ref={canvasRef} />
		</div>
	);
};
