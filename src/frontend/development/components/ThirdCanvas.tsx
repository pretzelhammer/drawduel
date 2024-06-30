import { type FunctionalComponent, Component, createRef, type RefObject } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { useClientContext, ClientContextKey } from '../../game/context/ClientContextProvider';

/**
 * my third attempt at a canvas component
 * THE GOOD
 * - can draw smooth, pixelated, or anti-aliased pixelated lines
 * - saves draw operations using relative coords, so it can redraw
 *   itself on resize events and the drawing looks accurate at
 *   all sizes
 * - resizes itself based on parent container's width, always maintains
 *   a 4:3 aspect ratio
 * - saves draw events to client context
 * - is more efficient on re-render, doesn't constantly rebind event
 *   listeners, lines are smooth
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

export interface ThirdCanvasProps {
	lineType: 'smooth' | 'pixelated' | 'antialiased-pixelated';
}

export class ThirdCanvas extends Component<ThirdCanvasProps> {
	static contextType = ClientContextKey;
	static defaultProps: ThirdCanvasProps = {
		lineType: 'smooth',
	};

	canvasRef: RefObject<HTMLCanvasElement>;
	isDrawing: boolean;
	drewOperations: number;
	lastCoord: { x: number; y: number };

	constructor(props: ThirdCanvasProps) {
		super(props);
		this.canvasRef = createRef<HTMLCanvasElement>();
		this.isDrawing = false;
		this.drewOperations = 0;
		this.lastCoord = { x: 0, y: 0 };
		this.handleResize = this.handleResize.bind(this);
		this.startDrawing = this.startDrawing.bind(this);
		this.draw = this.draw.bind(this);
		this.stopDrawing = this.stopDrawing.bind(this);
	}

	componentDidMount() {
		const canvas = this.canvasRef.current;
		if (!canvas) return;
		canvas.addEventListener('mousedown', this.startDrawing);
		canvas.addEventListener('mousemove', this.draw);
		canvas.addEventListener('mouseup', this.stopDrawing);
		canvas.addEventListener('mouseout', this.stopDrawing);
		window.addEventListener('resize', this.handleResize);
		this.handleResize();
	}

	componentWillUnmount() {
		const canvas = this.canvasRef.current;
		if (canvas) {
			canvas.removeEventListener('mousedown', this.startDrawing);
			canvas.removeEventListener('mousemove', this.draw);
			canvas.removeEventListener('mouseup', this.stopDrawing);
			canvas.removeEventListener('mouseout', this.stopDrawing);
		}
		window.removeEventListener('resize', this.handleResize);
	}

	componentWillUpdate(nextProps: Readonly<ThirdCanvasProps>, nextState: Readonly<{}>, nextContext: any): void {
		// console.log('will update', this.props.lineType, { nextProps, nextState, nextContext });
	}

	// this never gets called wtf?
	shouldComponentUpdate(nextProps: Readonly<ThirdCanvasProps>, nextState: Readonly<{}>, nextContext: any): boolean {
		// console.log('should update', this.props.lineType, { nextProps, nextState, nextContext });
		return false;
	}

	componentDidUpdate(previousProps: Readonly<ThirdCanvasProps>, previousState: Readonly<{}>, snapshot: any): void {
		// console.log('did update', this.props.lineType, { previousProps, previousState, snapshot });
		this.redrawCanvas();
	}

	handleResize() {
		const canvas = this.canvasRef.current;
		if (canvas) {
			const newWidth = canvas.parentElement!.clientWidth;
			const newHeight = (newWidth * 3) / 4; // 4:3 aspect ratio
			canvas.width = newWidth;
			canvas.height = newHeight;
			this.drewOperations = 0;
			this.redrawCanvas();
		}
	}

	startDrawing(e: MouseEvent) {
		this.isDrawing = true;
		if (this.canvasRef.current) {
			const x = e.offsetX / this.canvasRef.current.width;
			const y = e.offsetY / this.canvasRef.current.height;
			this.lastCoord = { x, y };
			const drawOp = [this.lastCoord.x, this.lastCoord.y, x, y];
			this.context.setClientState({
				...this.context.clientContext.clientState,
				draw: [...this.context.clientContext.clientState.draw, drawOp],
			});
		}
	}

	draw(e: MouseEvent) {
		if (!this.isDrawing) return;
		if (this.canvasRef.current) {
			const x = e.offsetX / this.canvasRef.current.width;
			const y = e.offsetY / this.canvasRef.current.height;
			const drawOp = [this.lastCoord.x, this.lastCoord.y, x, y];
			this.context.setClientState({
				...this.context.clientContext.clientState,
				draw: [...this.context.clientContext.clientState.draw, drawOp],
			});
			this.lastCoord = { x, y };
			this.redrawCanvas();
		}
	}

	stopDrawing() {
		if (this.isDrawing) {
			this.isDrawing = false;
		}
	}

	redrawCanvas() {
		const canvas = this.canvasRef.current;
		if (canvas) {
			const context = canvas.getContext('2d');
			if (context) {
				const canvasWidth = canvas.width;
				const canvasHeight = canvas.height;

				if (this.drewOperations === 0) {
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
				const pixelSize = Math.round(thickness * 1.5);

				const drawOps = this.context.clientContext.clientState.draw;

				for (let i = this.drewOperations; i < drawOps.length; i++) {
					// relative xs & ys
					const [x1, y1, x2, y2] = drawOps[i];
					const targetX1 = Math.round(x1 * canvasWidth);
					const targetY1 = Math.round(y1 * canvasHeight);
					const targetX2 = Math.round(x2 * canvasWidth);
					const targetY2 = Math.round(y2 * canvasHeight);
					if (this.props.lineType === 'smooth') {
						drawSmoothLine(context, targetX1, targetY1, targetX2, targetY2);
					} else if (this.props.lineType === 'pixelated') {
						drawPixelatedLine(context, pixelSize, targetX1, targetY1, targetX2, targetY2);
					} else if (this.props.lineType === 'antialiased-pixelated') {
						drawAntiAliasedPixelatedLine(context, pixelSize, targetX1, targetY1, targetX2, targetY2);
					}
				}
				this.drewOperations = drawOps.length;
			}
		}
	}

	render() {
		return (
			// <div style={{ width: '50%' }}>
			<canvas ref={this.canvasRef} />
			// </div>
		);
	}
}
