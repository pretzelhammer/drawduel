import { useState, useEffect } from 'preact/hooks';
import classes from 'src/frontend/components/PingPong.module.css';

const PingPong = () => {
	const [sentMessages, setSentMessages] = useState<string[]>([]);
	const [gotMessages, setGotMessages] = useState<string[]>([]);
	const [socket, setSocket] = useState<WebSocket | null>(null);

	useEffect(() => {
		let protocol = 'ws'; // TODO change to wss when we get ssl on prod
		let host = window.location.host;
		if (import.meta.env.DEV) {
			protocol = 'ws';
			host = 'localhost:9999';
		}
		const wsUrl = `${protocol}://${host}`;
		const newSocket = new WebSocket(wsUrl);
		newSocket.addEventListener('message', getMessage);
		newSocket.addEventListener('open', () => {
			console.log('WebSocket connection established.');
			setSocket(newSocket);
		});
		newSocket.addEventListener('error', (event) => {
			console.error('WebSocket error:', event);
		});
		newSocket.addEventListener('close', () => {
			console.log('WebSocket connection closed.');
			setSocket(null);
		});
		return () => {
			newSocket.removeEventListener('message', getMessage);
			newSocket.close();
		};
	}, []);

	const getMessage = (event: MessageEvent) => {
		setGotMessages((prevMessages) => [...prevMessages, event.data]);
	};

	const sendMessage = (message: string) => {
		if (socket) {
			socket.send(message);
			setSentMessages((prevMessages) => [...prevMessages, message]);
		}
	};

	return (
		<>
			<h2>websocket client</h2>
			<button onClick={() => sendMessage('PING')}>Send PING</button>
			<ul className={classes.list}>
				{gotMessages.map((message, index) => (
					<li key={index}>Got {message}</li>
				))}
			</ul>
		</>
	);
};

export default PingPong;
