import { type FunctionalComponent, type JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import classes from 'src/frontend/components/Canvas.module.css';

export enum Brush {
	Pencil = 'BRUSH_PENCIL',
	Eraser = 'BRUSH_ERASER',
	Clear = 'BRUSH_CLEAR',
}

export interface BrushSettings {
	readonly brush: Brush;
	readonly color: string;
	readonly size: number;
}

export interface CanvasDimensions {
	readonly width: number;
	readonly height: number;
}

export enum CanvasMode {
	Draw = 'CANVAS_MODE_DRAW',
	Preview = 'CANVAS_MODE_PREVIEW',
}

export interface DrawData {
	readonly brushSettings: BrushSettings;
	readonly canvasDimensions: CanvasDimensions;
	readonly start: {
		readonly x: number;
		readonly y: number;
	};
	readonly end: {
		readonly x: number;
		readonly y: number;
	};
}

export interface DrawMode {
	readonly name: CanvasMode.Draw;
	readonly brushSettings: BrushSettings;
	readonly canvasDimensions: CanvasDimensions;
	readonly onDraw: (drawData: DrawData) => void;
	readonly onClear: () => void;
}

export interface PreviewMode {
	readonly name: CanvasMode.Preview;
	readonly drawData: DrawData;
}

export interface CanvasProps {
	readonly mode: DrawMode | PreviewMode;
}

export const Canvas: FunctionalComponent<CanvasProps> = ({ mode }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [drawing, setDrawing] = useState(false);
	const drawingRef = useRef(drawing);
	drawingRef.current = drawing;
	const [coords, setCoords] = useState({
		start: {
			x: 0,
			y: 0,
		},
		end: {
			x: 0,
			y: 0,
		},
	});
	const coordsRef = useRef(coords);
	coordsRef.current = coords;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			throw new Error('Could not get canvas');
		}

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get 2d context');
		}

		if (mode.name === CanvasMode.Draw) {
			if (mode.brushSettings.brush === Brush.Clear) {
				context.clearRect(0, 0, canvas.width, canvas.height);
				mode.onClear();
			}

			const reposition = (event: MouseEvent) => {
				const rect = canvas.getBoundingClientRect();
				const coord = coordsRef.current.end;
				setCoords({
					start: { x: coord.x, y: coord.y },
					end: {
						x: event.clientX - rect.left,
						y: event.clientY - rect.top,
					},
				});
			};

			const draw = (event: MouseEvent) => {
				const { brush, color, size } = mode.brushSettings;
				if (drawingRef.current && brush !== Brush.Clear) {
					context.beginPath();
					context.strokeStyle = brush === Brush.Eraser ? 'white' : color;
					context.lineWidth = size;
					context.lineCap = 'round';
					reposition(event);
					context.moveTo(coordsRef.current.start.x, coordsRef.current.start.y);
					context.lineTo(coordsRef.current.end.x, coordsRef.current.end.y);
					context.stroke();
					mode.onDraw({
						brushSettings: mode.brushSettings,
						canvasDimensions: mode.canvasDimensions,
						...coordsRef.current,
					});
				}
			};

			const start = (event: MouseEvent) => {
				const rect = canvas.getBoundingClientRect();
				// set inital coords
				setCoords({
					start: {
						x: event.clientX - rect.left,
						y: event.clientY - rect.top,
					},
					end: {
						x: event.clientX - rect.left,
						y: event.clientY - rect.top,
					},
				});
				setDrawing(true);
			};

			const stop = () => {
				setDrawing(false);
			};

			canvas.addEventListener('mousemove', draw);
			canvas.addEventListener('mousedown', start);
			canvas.addEventListener('mouseup', stop);

			return () => {
				canvas.removeEventListener('mousedown', start);
				canvas.removeEventListener('mouseup', stop);
				canvas.removeEventListener('mousemove', draw);
			};
		} else if (mode.name === CanvasMode.Preview) {
			const { brush, color, size } = mode.drawData.brushSettings;
			console.log(brush);
			if (brush === Brush.Clear) {
				console.log('clear');
				context.clearRect(0, 0, canvas.width, canvas.height);
			} else {
				console.log('preview mode', mode.drawData.brushSettings);
				const { start, end } = mode.drawData;
				context.beginPath();
				context.strokeStyle = brush === Brush.Eraser ? 'white' : color;
				context.lineWidth = size;
				context.lineCap = 'round';
				context.moveTo(start.x, start.y);
				context.lineTo(end.x, end.y);
				context.stroke();
			}
		}
	}, [mode]);

	const canvasDimensions = mode.name === CanvasMode.Draw ? mode.canvasDimensions : mode.drawData.canvasDimensions;

	return (
		<canvas
			ref={canvasRef}
			class={classes['canvas']}
			width={canvasDimensions.width}
			height={canvasDimensions.height}
		/>
	);
};
