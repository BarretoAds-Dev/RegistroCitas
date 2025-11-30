import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

// Endpoint de prueba para verificar conexión con Supabase
export const GET: APIRoute = async () => {
	try {
		// Probar conexión básica
		const { data: agents, error: agentsError } = await supabase
			.from('agents')
			.select('id, name, email')
			.limit(1);

		if (agentsError) {
			return new Response(
				JSON.stringify({
					error: 'Error al conectar con Supabase',
					details: agentsError.message,
					code: agentsError.code,
				}),
				{ status: 500 }
			);
		}

		// Probar consulta de slots
		const { data: slots, error: slotsError } = await supabase
			.from('availability_slots')
			.select('id, date, start_time, enabled')
			.eq('date', '2025-12-01')
			.eq('enabled', true)
			.limit(5);

		return new Response(
			JSON.stringify({
				success: true,
				connection: 'OK',
				agents: agents?.length || 0,
				slotsForDec1: slots?.length || 0,
				sampleSlots: slots || [],
				slotsError: slotsError?.message,
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: 'Error de conexión',
				message: error instanceof Error ? error.message : 'Unknown error',
				stack: error instanceof Error ? error.stack : undefined,
			}),
			{ status: 500 }
		);
	}
};

