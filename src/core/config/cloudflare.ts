// Configuración específica de Cloudflare Workers

export const CLOUDFLARE_CONFIG = {
	// KV Namespaces
	kvNamespaces: {
		session: 'SESSION',
	},
	// Rate limiting
	rateLimit: {
		requests: 100,
		window: 60, // segundos
	},
	// CORS
	cors: {
		allowedOrigins: import.meta.env.PUBLIC_ALLOWED_ORIGINS?.split(',') || ['*'],
		allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	},
} as const;

