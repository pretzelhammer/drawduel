import { type FunctionalComponent, type JSX } from 'preact';
import { DrawStage } from 'src/frontend/game/components/DrawStage.tsx';

export interface TeamPreview {
	readonly teamName: string;
	readonly drawer: string;
	// TODO: replace unknown with the correct type
	readonly canvasPreview: unknown;
}

export interface RoundProps {
	readonly teamName: string;
	readonly teamPreviews: TeamPreview[];
}

export const Round: FunctionalComponent<RoundProps> = ({ teamName, teamPreviews }: RoundProps) => {
	// TODO: replace time with something from server
	const time = '1:00';
	return (
		<div>
			<div>
				<div>
					<h2>{time}</h2>
					<h3>{teamName}</h3>
				</div>
				<DrawStage />
			</div>
			<div class="previews">
				{teamPreviews.map(() => (
					<div>TODO</div>
				))}
			</div>
		</div>
	);
};
