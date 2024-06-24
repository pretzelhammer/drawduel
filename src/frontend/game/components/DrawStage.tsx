import { type FunctionalComponent } from 'preact';
import { Canvas } from 'src/frontend/components/Canvas.tsx';

export const DrawStage: FunctionalComponent = () => {
	const brushSettings = {
		color: 'black',
		size: 2,
	};
	const canvasDimensions = {
		width: 400,
		height: 400,
	};
	return <Canvas brushSettings={brushSettings} canvasDimensions={canvasDimensions} />;
};
