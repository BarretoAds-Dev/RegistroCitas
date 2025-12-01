import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	// Permitir que todas las rutas se carguen
	// La verificación de autenticación se hace en el cliente
	// Esto permite que la redirección después del login funcione correctamente
	return next();
});

