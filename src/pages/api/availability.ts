import type { APIRoute } from 'astro';
import { supabase, type AvailabilitySlot } from '../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
	const startDate =
		url.searchParams.get('start') || new Date().toISOString().split('T')[0];
	const endDate = url.searchParams.get('end');
	const agentId =
		url.searchParams.get('agent_id') ||
		'00000000-0000-0000-0000-000000000001'; // Agente por defecto

	try {
		let query = supabase
			.from('availability_slots')
			.select('*')
			.eq('enabled', true)
			.eq('agent_id', agentId)
			.gte('date', startDate)
			.order('date', { ascending: true })
			.order('start_time', { ascending: true });

		if (endDate) {
			query = query.lte('date', endDate);
		}

		const { data, error } = await query;

		if (error) {
			return new Response(
				JSON.stringify({ error: error.message }),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Type assertion para los slots
		const typedSlots = (data || []) as AvailabilitySlot[];

		// Agrupar por fecha y formatear para el componente
		const grouped = typedSlots.reduce(
			(acc, slot) => {
				if (!slot) return acc;
				const dateKey = slot.date;
				if (!acc[dateKey]) {
					acc[dateKey] = {
						date: dateKey,
						dayOfWeek: getDayOfWeek(new Date(dateKey)),
						slots: [],
						metadata: {
							notes: 'Horario generado automáticamente',
							specialHours: false,
						},
					};
				}
				acc[dateKey].slots.push({
					time: slot.start_time,
					available: slot.booked < slot.capacity,
					capacity: slot.capacity,
					booked: slot.booked,
				});
				return acc;
			},
			{} as Record<
				string,
				{
					date: string;
					dayOfWeek: string;
					slots: Array<{
						time: string;
						available: boolean;
						capacity: number;
						booked: number;
					}>;
					metadata: {
						notes: string;
						specialHours: boolean;
					};
				}
			>
		);

		// Filtrar solo días con slots disponibles
		const result = Object.values(grouped).filter(
			(day) => day.slots.some((slot) => slot.available)
		);

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
};

// Helper para obtener día de la semana
function getDayOfWeek(date: Date): string {
	const days = [
		'sunday',
		'monday',
		'tuesday',
		'wednesday',
		'thursday',
		'friday',
		'saturday',
	];
	return days[date.getDay()];
}

