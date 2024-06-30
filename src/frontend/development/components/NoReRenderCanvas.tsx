import { type FunctionalComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { useClientContext } from '../../game/context/ClientContextProvider';

/**
 * my second attempt at a canvas component
 * THE GOOD
 * - can draw smooth, pixelated, or anti-aliased pixelated lines
 * - saves draw operations using relative coords, so it can redraw
 *   itself on resize events and drawing looks good
 * - saves draw events to client context
 * THE BAD
 * - despite the name it actually re-renders constantly (which includes
 *   unbinding and rebinding the event listeners constantly), i think
 *   it's impossible to prevent re-renders using functional components
 *   so i'm going to try to refactor this into a class component
 *   for try #3
 * - the lines aren't totally smooth, but actually kinda jittery and can
 *   have gaps if you move your mouse fast enough, but i believe this
 *   is a negative side-effect of the first bad point and if i can resolve
 *   that one that this one will auto-resolve
 */

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

export const NoReRenderCanvas: FunctionalComponent = () => {
	const { clientContext, setClientState } = useClientContext();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const isDrawing = useRef<boolean>(false);
	const drawOperationsRef = useRef<any[]>([]);
	const drewOperationsRef = useRef<number>(0);
	const lastCoord = useRef({ x: 0, y: 0 });

	const startDrawing = (e: MouseEvent) => {
		isDrawing.current = true;
		const x = e.offsetX / canvasRef.current!.width;
		const y = e.offsetY / canvasRef.current!.height;
		lastCoord.current = { x, y };
		const drawOp = [lastCoord.current.x, lastCoord.current.y, x, y];
		// drawOperationsRef.current.push(drawOp);
		setClientState({ ...clientContext.clientState, draw: [...clientContext.clientState.draw, drawOp] });
	};

	const draw = (e: MouseEvent) => {
		if (!isDrawing.current) return;
		const x = e.offsetX / canvasRef.current!.width;
		const y = e.offsetY / canvasRef.current!.height;
		const drawOp = [lastCoord.current.x, lastCoord.current.y, x, y];
		// drawOperationsRef.current.push(drawOp);
		setClientState({ ...clientContext.clientState, draw: [...clientContext.clientState.draw, drawOp] });
		lastCoord.current = { x, y };
		// Redraw the canvas as drawing happens
		redrawCanvas();
	};

	const stopDrawing = () => {
		if (isDrawing.current) {
			isDrawing.current = false;
			// Finalize the drawing
			// redrawCanvas();
		}
	};

	const redrawCanvas = () => {
		const canvas = canvasRef.current!;
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;
		const context = canvas.getContext('2d', contextSettings)!;
		if (drewOperationsRef.current === 0) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = 'white';
			context.fillRect(0, 0, canvas.width, canvas.height);
		}

		const thickness = 5;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.lineWidth = thickness;
		context.strokeStyle = 'black';
		context.fillStyle = 'black';
		const pixelSize = thickness * 2;

		const drawOps = clientContext.clientState.draw;
		// const drawOps = drawOperationsRef.current;

		console.log({ drew: drewOperationsRef.current, all: drawOps.length });
		for (let i = drewOperationsRef.current; i < drawOps.length; i++) {
			const [x1, y1, x2, y2] = drawOps[i];
			drawSmoothLine(context, x1 * canvasWidth, y1 * canvasHeight, x2 * canvasWidth, y2 * canvasHeight);
			// drawPixelatedLine(
			// 	context,
			// 	pixelSize,
			// 	Math.round(x1 * canvasWidth),
			// 	Math.round(y1 * canvasHeight),
			// 	Math.round(x2 * canvasWidth),
			// 	Math.round(y2 * canvasHeight),
			// );
			// drawAntiAliasedPixelatedLine(
			// 	context,
			// 	pixelSize,
			// 	Math.round(x1 * canvasWidth),
			// 	Math.round(y1 * canvasHeight),
			// 	Math.round(x2 * canvasWidth),
			// 	Math.round(y2 * canvasHeight),
			// );
		}
		drewOperationsRef.current = drawOps.length;
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Initial canvas setup
		redrawCanvas();

		const handleResize = () => {
			const newWidth = window.innerWidth / 2;
			const newHeight = (newWidth * 3) / 4; // 4:3 aspect ratio
			canvas.width = newWidth;
			canvas.height = newHeight;
			drewOperationsRef.current = 0;
			redrawCanvas();
		};

		// Attach resize event listener
		window.addEventListener('resize', handleResize);

		// Initial resize
		handleResize();

		canvas.addEventListener('mousedown', startDrawing);
		canvas.addEventListener('mousemove', draw);
		canvas.addEventListener('mouseup', stopDrawing);
		canvas.addEventListener('mouseout', stopDrawing);

		// Cleanup event listeners
		return () => {
			window.removeEventListener('resize', handleResize);
			canvas.removeEventListener('mousedown', startDrawing);
			canvas.removeEventListener('mousemove', draw);
			canvas.removeEventListener('mouseup', stopDrawing);
			canvas.removeEventListener('mouseout', stopDrawing);
		};
	}, [clientContext.clientState.draw]);

	return <canvas ref={canvasRef} />;
};
