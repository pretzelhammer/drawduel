import { type FunctionalComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

export const NoReRenderCanvas: FunctionalComponent = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const isDrawing = useRef<boolean>(false);
	const drawOperationsRef = useRef<any[]>([]);
	const drewOperationsRef = useRef<number>(0);

	const startDrawing = (e: MouseEvent) => {
		isDrawing.current = true;
		const newOperation = {
			type: 'beginPath',
			points: [{ x: e.clientX - canvasRef.current!.offsetLeft, y: e.clientY - canvasRef.current!.offsetTop }],
		};
		drawOperationsRef.current.push(newOperation);
	};

	const draw = (e: MouseEvent) => {
		if (!isDrawing.current) return;
		const point = { x: e.clientX - canvasRef.current!.offsetLeft, y: e.clientY - canvasRef.current!.offsetTop };
		const lastOperation = drawOperationsRef.current[drawOperationsRef.current.length - 1];
		lastOperation.points.push(point);
		// Redraw the canvas as drawing happens
		redrawCanvas();
	};

	const stopDrawing = () => {
		if (isDrawing.current) {
			const lastOperation = drawOperationsRef.current[drawOperationsRef.current.length - 1];
			lastOperation.type = 'stroke';
			isDrawing.current = false;
			// Finalize the drawing
			redrawCanvas();
		}
	};

	const redrawCanvas = () => {
		const canvas = canvasRef.current!;
		const context = canvas.getContext('2d')!;
		if (drewOperationsRef.current === 0) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = 'white';
			context.fillRect(0, 0, canvas.width, canvas.height);
		}

		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.lineWidth = 5;
		context.strokeStyle = 'black';

		console.log({ drew: drewOperationsRef.current, all: drawOperationsRef.current.length });
		for (let i = 0; i < drawOperationsRef.current.length; i++) {
			const op = drawOperationsRef.current[i];
			if (op.type === 'beginPath') {
				context.beginPath();
				context.moveTo(op.points[0].x, op.points[0].y);
				op.points.slice(1).forEach((point: any) => context.lineTo(point.x, point.y));
			} else if (op.type === 'stroke') {
				context.stroke();
			}
		}
		drewOperationsRef.current = drawOperationsRef.current.length;
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Initial canvas setup
		redrawCanvas();

		const handleResize = () => {
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
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
	}, []);

	return <canvas ref={canvasRef} style={{ border: '1px solid black', width: '50%', height: '50%' }} />;
};
