// Define an interface for environment variables (for better type safety)
interface EnvConfig {
    PRODUCTION: string;
    LOCALHOST: string;
    PROD: string;
}

// Access environment variables with type safety
const env: EnvConfig = {
    PRODUCTION: process.env.NEXT_PUBLIC_PRODUCTION || '1',
    LOCALHOST: process.env.NEXT_PUBLIC_LOCALHOST || 'http://localhost:8080',
    PROD: process.env.NEXT_PUBLIC_PROD || 'https://history-chess-game-back-end.onrender.com',
};

const basePath = env.PRODUCTION !== '0' ? `${env.PROD}` : `${env.LOCALHOST}`;

export default basePath;