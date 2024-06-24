import { type FunctionalComponent, type JSX } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

export const Canvas: FunctionalComponent<{}> = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			throw new Error('Could not get canvas');
		}

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get 2d context');
		}

		const draw = (event: MouseEvent) => {
			const x = event.clientX;
			const y = event.clientY;
			context.fillStyle = 'red';
			context.fillRect(x, y, 10, 10);
		};

		canvas.addEventListener('mousedown', draw);

		return () => {
			canvas.removeEventListener('mousedown', draw);
		};
	}, []);

	return <canvas ref={canvasRef} />;
};
