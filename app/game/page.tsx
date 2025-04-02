'use client'

import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

interface GameState {
    fen: string;
    players: string[];
    status: string;
    moves: { moveNumber: number; move: string }[];
    playMode: string;
    timeLimit: number;
    turn?: string;
    inCheck?: boolean;
    gameOver?: boolean;
    moveNumber?: number;
    move?: string;
    whiteTimeLeft?: number;
    blackTimeLeft?: number;
    result?: string;
}

const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const Home = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [opponentId, setOpponentId] = useState<string>('');
    const [playMode, setPlayMode] = useState<string>('blitz');
    const [colorPreference, setColorPreference] = useState<string>('random');
    const [gameId, setGameId] = useState<string>('');
    const [gameLink, setGameLink] = useState<string>('');
    const [move, setMove] = useState<string>('');
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [message, setMessage] = useState<string>('');
    const [matchDuration, setMatchDuration] = useState<number>(0);

    useEffect(() => {
        const newSocket = io(BACKEND_URL, { reconnection: true });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            if (gameId && userId) newSocket.emit('rejoinGame', { gameId, userId });
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('gameState', (state: GameState) => {
            setGameState(state);
        });

        newSocket.on('timeUpdate', ({ whiteTimeLeft, blackTimeLeft }) => {
            setGameState(prev => prev ? { ...prev, whiteTimeLeft, blackTimeLeft } : null);
        });

        newSocket.on('opponentDisconnected', ({ message }) => {
            setMessage(message);
        });

        newSocket.on('gameResumed', () => {
            setMessage('Game resumed!');
        });

        newSocket.on('gameOver', ({ result, eloUpdate }) => {
            setGameState(prev => prev ? { ...prev, gameOver: true, result } : null);
            const myElo = userId === gameState?.players[0] ? eloUpdate.whiteElo : eloUpdate.blackElo;
            setMessage(`${result} - New ELO: ${myElo}`);
        });

        newSocket.on('invalidMove', (error) => {
            setMessage(`Invalid Move: ${error.error}`);
        });

        newSocket.on('error', (error) => {
            setMessage(`Error: ${error.message}`);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [gameId, userId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState?.status === 'active') {
            interval = setInterval(() => {
                setMatchDuration(prev => prev + 1000);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState?.status]);

    const register = async () => {
        try {
            const res = await axios.post(`${BACKEND_URL}/register`, { username, email, password });
            setUserId(res.data.userId);
            setMessage(`Registered! User ID: ${res.data.userId}`);
        } catch (err: any) {
            setMessage(`Registration failed: ${err.response?.data?.error || err.message}`);
        }
    };

    const login = async () => {
        try {
            const res = await axios.post(`${BACKEND_URL}/login`, { email, password });
            setUserId(res.data.userId);
            setMessage(`Logged in! User ID: ${res.data.userId}`);
        } catch (err: any) {
            setMessage(`Login failed: ${err.response?.data?.error || err.message}`);
        }
    };

    const createGame = async () => {
        if (!userId) {
            setMessage('Please log in or register first.');
            return;
        }
        try {
            const res = await axios.post(`${BACKEND_URL}/game/new`, { userId, playMode, colorPreference });
            setGameId(res.data.gameId);
            setGameLink(res.data.gameLink);
            setMessage(`Game created! ID: ${res.data.gameId}`);
            joinGame(res.data.gameId);
        } catch (err: any) {
            setMessage(`Create game failed: ${err.response?.data?.error || err.message}`);
        }
    };

    const findMatch = async () => {
        if (!userId) {
            setMessage('Please log in or register first.');
            return;
        }
        try {
            const res = await axios.post(`${BACKEND_URL}/game/find`, { userId, playMode, colorPreference });
            setGameId(res.data.gameId);
            setMessage(`Match found! Game ID: ${res.data.gameId}`);
            joinGame(res.data.gameId);
        } catch (err: any) {
            setMessage(`Find match failed: ${err.response?.data?.error || err.message}`);
        }
    };

    const challengeUser = async () => {
        if (!userId || !opponentId) {
            setMessage('Please provide User ID and Opponent ID.');
            return;
        }
        try {
            const res = await axios.post(`${BACKEND_URL}/game/challenge`, { userId, opponentId, playMode, colorPreference });
            setGameId(res.data.gameId);
            setGameLink(res.data.gameLink);
            setMessage(`Challenge sent! Game ID: ${res.data.gameId}`);
            joinGame(res.data.gameId);
        } catch (err: any) {
            setMessage(`Challenge failed: ${err.response?.data?.error || err.message}`);
        }
    };

    const joinGame = (id: string) => {
        if (!socket || !userId) {
            setMessage('Socket not initialized or user not logged in.');
            return;
        }
        setGameId(id);
        socket.emit('joinGame', { gameId: id, userId });
        setMessage(`Joined game: ${id}`);
    };

    const makeMove = () => {
        if (!socket || !gameId) {
            setMessage('No active game or socket not initialized.');
            return;
        }
        socket.emit('move', { gameId, move });
        setMove('');
        setMessage(`Move sent: ${move}`);
    };

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Chess Game Tester</h1>
                <div className="flex items-center">
                    <span className="mr-2">Socket Status:</span>
                    <div
                        className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                        title={isConnected ? 'Connected' : 'Disconnected'}
                    />
                </div>
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-black p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Authentication</h2>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 mb-2 border rounded" />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-2 border rounded" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-2 border rounded" />
                    <div className="flex space-x-4">
                        <button onClick={register} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Register</button>
                        <button onClick={login} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Login</button>
                    </div>
                </div>

                <div className="bg-black p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Game Options</h2>
                    <div className="mb-2">
                        <label className="block text-sm font-medium">Play Mode:</label>
                        <select value={playMode} onChange={(e) => setPlayMode(e.target.value)} className="w-full p-2 border rounded">
                            <option value="bullet">Bullet</option>
                            <option value="blitz">Blitz</option>
                            <option value="rapid">Rapid</option>
                        </select>
                    </div>
                    <div className="mb-2">
                        <label className="block text-sm font-medium">Color Preference:</label>
                        <select value={colorPreference} onChange={(e) => setColorPreference(e.target.value)} className="w-full p-2 border rounded">
                            <option value="white">White</option>
                            <option value="black">Black</option>
                            <option value="random">Random</option>
                        </select>
                    </div>
                    <input type="text" placeholder="Opponent ID (for challenge)" value={opponentId} onChange={(e) => setOpponentId(e.target.value)} className="w-full p-2 mb-2 border rounded" />
                    <div className="flex space-x-4">
                        <button onClick={createGame} className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600">Create Game</button>
                        <button onClick={findMatch} className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600">Find Match</button>
                        <button onClick={challengeUser} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">Challenge User</button>
                    </div>
                    {gameLink && <p className="mt-2 text-blue-600">Game Link: <a href={gameLink} target="_blank" rel="noopener noreferrer">{gameLink}</a></p>}
                </div>

                <div className="bg-black p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Join Game</h2>
                    <input type="text" placeholder="Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)} className="w-full p-2 mb-2 border rounded" />
                    <button onClick={() => joinGame(gameId)} className="bg-teal-500 text-white p-2 rounded hover:bg-teal-600">Join Game</button>
                </div>

                <div className="bg-black p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Make a Move</h2>
                    <input type="text" placeholder="Move (e.g., e4)" value={move} onChange={(e) => setMove(e.target.value)} className="w-full p-2 mb-2 border rounded" />
                    <button onClick={makeMove} className="bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600">Send Move</button>
                </div>

                {gameState && (
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Game State</h2>
                        <p><strong>Match Duration:</strong> {formatTime(matchDuration)}</p>
                        <p><strong>White Time Left:</strong> {gameState.whiteTimeLeft !== undefined ? formatTime(gameState.whiteTimeLeft) : 'N/A'}</p>
                        <p><strong>Black Time Left:</strong> {gameState.blackTimeLeft !== undefined ? formatTime(gameState.blackTimeLeft) : 'N/A'}</p>
                        <p><strong>FEN:</strong> {gameState.fen}</p>
                        <p><strong>Players:</strong> {gameState.players.join(', ')}</p>
                        <p><strong>Status:</strong> {gameState.status}</p>
                        <p><strong>Moves:</strong> {gameState.moves.map(m => `${m.moveNumber}: ${m.move}`).join(', ')}</p>
                        <p><strong>Play Mode:</strong> {gameState.playMode}</p>
                        <p><strong>Time Limit:</strong> {gameState.timeLimit / 60000} minutes</p>
                        {gameState.turn && <p><strong>Turn:</strong> {gameState.turn === 'w' ? 'White' : 'Black'}</p>}
                        {gameState.inCheck !== undefined && <p><strong>In Check:</strong> {gameState.inCheck ? 'Yes' : 'No'}</p>}
                        {gameState.gameOver !== undefined && <p><strong>Game Over:</strong> {gameState.gameOver ? 'Yes' : 'No'}</p>}
                    </div>
                )}

                {message && (
                    <div className="bg-yellow-100 p-4 rounded shadow">
                        <p>{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;