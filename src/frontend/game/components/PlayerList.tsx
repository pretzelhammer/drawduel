import { type FunctionalComponent } from 'preact';
import { useClientContext } from 'src/frontend/game/context/ClientContextProvider.tsx';
import { type GamePlayer, type PlayerRole } from 'src/agnostic/gameState.ts';

export const PlayerList: FunctionalComponent = () => {
	const { clientContext } = useClientContext();
	const players = Object.values(clientContext.gameState.players);
	const myId = clientContext.clientState.player.id;
	function playerName(player: GamePlayer) {
		let name = player.name;
		if (player.id == myId) {
			name += ' (you)';
		}
		if (!player.connected) {
			return <span style="opacity: 0.5;">{name}</span>;
		}
		return <span>{name}</span>;
	}
	function playerRole(player: GamePlayer): PlayerRole {
		return clientContext.gameState.teams[player.team].players[player.id].role;
	}
	function teamScore(player: GamePlayer): number {
		return clientContext.gameState.teams[player.team].score;
	}
	return (
		<>
			<table style="margin-bottom: 32px;">
				<thead>
					<tr>
						<th>id</th>
						<th>name</th>
						<th>score</th>
						<th>team</th>
						<th>role</th>
						<th>team score</th>
					</tr>
				</thead>
				<tbody>
					{players.map((player) => (
						<tr key={player.id}>
							<td>{player.id}</td>
							<td>{playerName(player)}</td>
							<td>{player.score}</td>
							<td>{player.team}</td>
							<td>{playerRole(player)}</td>
							<td>{teamScore(player)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
};
