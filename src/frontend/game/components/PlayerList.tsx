import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/ClientContextProvider.tsx';
import { IncreaseMyScore } from 'src/frontend/game/components/IncreaseMyScore';
import { GamePlayer } from 'src/agnostic/gameState.ts';

export const PlayerList: FunctionalComponent = () => {
	const [clientContext, dispatchGameEvent, setClientState] = useClientContext();
	const players = Object.values(clientContext.gameState.players);
	const myId = clientContext.clientState.player.id;
	function playerName(player: GamePlayer) {
		let name = player.name;
		if (player.id == myId) {
			name += ' (you)';
		}
		return name;
	}
	return (
		<>
			{/*
			<div style="margin-bottom: 16px;">{JSON.stringify(clientContext)}</div>
			*/}
			<table style="margin-bottom: 16px;">
				<thead>
					<tr>
						<th>id</th>
						<th>name</th>
						<th>score</th>
					</tr>
				</thead>
				<tbody>
					{players.map((player) => (
						<tr key={player.id}>
							<td>{player.id}</td>
							<td>{playerName(player)}</td>
							<td>{player.score}</td>
						</tr>
					))}
				</tbody>
			</table>
			<IncreaseMyScore />
		</>
	);
};
