import { useState, useEffect } from 'preact/hooks';
import classes from 'src/frontend/components/PingPong.module.css';

const PingPong = () => {
	const [sentMessages, setSentMessages] = useState<string[]>([]);
	const [gotMessages, setGotMessages] = useState<string[]>([]);
	const [socket, setSocket] = useState<WebSocket | null>(null);

	useEffect(() => {
		const newSocket = new WebSocket('ws://localhost:9001');
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
			newSocket.close();
		};
	}, []);

	useEffect(() => {
		if (socket) {
			socket.addEventListener('message', getMessage);
		}

		return () => {
			if (socket) {
				socket.removeEventListener('message', getMessage);
			}
		};
	}, [socket]);

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
			<h2>WebSocket Client</h2>
			<button onClick={() => sendMessage('PING')}>Send PING</button>
			{/*
			<ul>
				{sentMessages.map((message, index) => (
					<li key={index}>Sent {message}</li>
				))}
			</ul>
			*/}
			<ul className={classes.list}>
				{gotMessages.map((message, index) => (
					<li key={index}>Got {message}</li>
				))}
			</ul>
		</>
	);
};

export default PingPong;
