import type { APIRoute } from 'astro';
import { validateAppointment } from '../../../features/appointments/schemas/appointment.schema';
import { AppointmentsService } from '../../../features/appointments/services/appointment.service';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	try {
		const contentType = request.headers.get('content-type');
		if (!contentType || !contentType.includes('application/json')) {
			return new Response(
				JSON.stringify({ error: 'Content-Type debe ser application/json' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		let body;
		try {
			body = await request.json();
		} catch (jsonError) {
			console.error('❌ Error al parsear JSON:', jsonError);
			return new Response(
				JSON.stringify({
					error: 'Body inválido o vacío',
					details: jsonError instanceof Error ? jsonError.message : 'Unknown error'
				}),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Logs temporales para debugging
		console.log('📥 Request recibido:', {
			date: body.date,
			time: body.time,
			operationType: body.operationType,
			hasName: !!body.name,
			hasEmail: !!body.email
		});

		console.log('🔍 Datos completos del body:', JSON.stringify(body, null, 2));

		// Detectar si es una actualización (tiene appointmentId)
		const isUpdate = body.appointmentId && typeof body.appointmentId === 'string' && body.appointmentId.trim() !== '';

		// Validar con Zod
		const validation = validateAppointment(body);
		if (!validation.success || !validation.data) {
			console.error('❌ Validación fallida:', validation.errors);
			return new Response(
				JSON.stringify({
					error: 'Validation failed',
					issues: validation.errors,
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		const formData = validation.data;
		console.log('✅ Datos validados:', {
			date: formData.date,
			time: formData.time,
			email: formData.email,
			name: formData.name,
			operationType: formData.operationType,
			propertyId: formData.propertyId || null,
			appointmentId: formData.appointmentId || null,
			isUpdate,
		});

		// Buscar slot (sin verificar disponibilidad si es actualización)
		console.log('🔍 Iniciando búsqueda de slot...');
		const normalizedTime = AppointmentsService.normalizeTime(formData.time);
		console.log('⏰ Tiempo normalizado:', {
			original: formData.time,
			normalized: normalizedTime,
		});

		// Si es actualización, buscar el slot sin verificar disponibilidad
		// (porque la cita ya está reservada)
		let slot: any = null;
		let slotError: Error | null = null;

		if (isUpdate) {
			// Para actualizaciones, solo necesitamos encontrar el slot
			// No verificamos disponibilidad porque la cita ya está reservada
			const { getSupabaseAdmin } = await import('../../../core/config/supabase');
			const client = getSupabaseAdmin();
			const cleanDate = formData.date.split('T')[0];
			const defaultAgentId = '00000000-0000-0000-0000-000000000001';
			const targetHHMM = normalizedTime.substring(0, 5);

			const { data: slots, error: findError } = await client
				.from('availability_slots')
				.select('*')
				.eq('date', cleanDate)
				.eq('enabled', true)
				.eq('agent_id', defaultAgentId);

			if (findError) {
				slotError = findError;
			} else {
				const matchingSlot = (slots || []).find((s: any) => {
					const slotHHMM = String(s.start_time).substring(0, 5);
					return slotHHMM === targetHHMM;
				});

				if (matchingSlot) {
					slot = matchingSlot;
				} else {
					slotError = new Error(`No se encontró slot para las ${targetHHMM}`);
				}
			}
		} else {
			// Para nuevas citas, verificar disponibilidad
			const result = await AppointmentsService.findAvailableSlot(
				formData.date,
				formData.time
			);
			slot = result.slot;
			slotError = result.error;
		}

		// Logs temporales para debugging
		console.log('🎯 Resultado de búsqueda de slot:', {
			slotFound: !!slot,
			slotId: slot?.id,
			slotDate: slot?.date,
			slotTime: slot?.start_time,
			slotAgentId: slot?.agent_id,
			slotEnabled: slot?.enabled,
			slotCapacity: slot?.capacity,
			slotBooked: slot?.booked,
			error: slotError?.message,
			requestedDate: formData.date,
			requestedTime: formData.time,
			normalizedTime: normalizedTime,
			isUpdate,
		});

		if (slotError || !slot) {
			// Intentar buscar todos los slots disponibles para esa fecha para diagnóstico
			const { getSupabaseAdmin } = await import('../../../core/config/supabase');
			const client = getSupabaseAdmin();
			const { data: allSlots } = await client
				.from('availability_slots')
				.select('*')
				.eq('date', formData.date)
				.eq('enabled', true)
				.limit(20);

			console.error('❌ Error al buscar slot:', {
				error: slotError?.message,
				date: formData.date,
				time: formData.time,
				normalizedTime: normalizedTime,
				isUpdate,
				slotsDisponiblesEnFecha: allSlots?.map(s => ({
					id: s.id,
					start_time: s.start_time,
					capacity: s.capacity,
					booked: s.booked,
					enabled: s.enabled,
				})) || [],
			});

			const availableTimes = allSlots?.map(s => s.start_time).join(', ') || 'ninguno';
			return new Response(
				JSON.stringify({
					error: 'Slot no encontrado o no disponible',
					details: slotError?.message || `No se encontró un slot disponible para ${formData.date} a las ${formData.time}`,
					debug: {
						date: formData.date,
						time: formData.time,
						normalizedTime: normalizedTime,
						slotsDisponibles: allSlots?.map(s => ({
							time: s.start_time,
							capacity: s.capacity,
							booked: s.booked,
							available: s.booked < s.capacity,
						})) || [],
						horasDisponibles: availableTimes,
						message: `Para la fecha ${formData.date}, los horarios disponibles son: ${availableTimes || 'ninguno'}. Verifica que el slot esté habilitado y que el agent_id sea correcto.`,
					},
				}),
				{ status: 404, headers: { 'Content-Type': 'application/json' } }
			);
		}

		console.log('✅ Slot encontrado:', {
			slotId: slot.id,
			date: slot.date,
			time: slot.start_time,
			capacity: slot.capacity,
			booked: slot.booked,
			enabled: slot.enabled,
			agent_id: slot.agent_id,
		});

		// Solo verificar disponibilidad si NO es una actualización
		if (!isUpdate) {
			const availability = await AppointmentsService.checkSlotAvailability(slot.id);

			console.log('🔍 Verificación de disponibilidad:', {
				slotId: slot.id,
				available: availability.available,
				bookedCount: availability.bookedCount,
				capacity: availability.capacity,
				hasError: !!availability.error,
				slotBooked: slot.booked,
			});

			// Solo marcar como completo si:
			// 1. Realmente está lleno (bookedCount >= capacity)
			// 2. NO hay errores en la verificación
			// 3. El contador real es mayor o igual a la capacidad
			if (!availability.available && availability.error === null && availability.bookedCount >= availability.capacity) {
				console.warn('⚠️ Slot completo:', {
					slotId: slot.id,
					bookedCount: availability.bookedCount,
					capacity: availability.capacity,
					date: formData.date,
					time: formData.time,
					message: `El slot ya tiene ${availability.bookedCount} cita(s) y su capacidad es ${availability.capacity}. Por favor selecciona otro horario disponible.`
				});
				return new Response(
					JSON.stringify({
						error: `Slot completo. Ya hay ${availability.bookedCount} cita(s) en este horario. Por favor selecciona otro horario disponible.`,
					}),
					{ status: 409 }
				);
			}

			// Si hay error en la verificación, permitir crear la cita (confiar en el contador del slot como fallback)
			if (availability.error) {
				console.warn('⚠️ Error al verificar disponibilidad, usando contador del slot como fallback:', availability.error.message);
				// Verificar el contador del slot directamente como fallback
				if (slot.booked >= slot.capacity) {
					console.warn('⚠️ Slot marcado como lleno según contador del slot:', {
						slotId: slot.id,
						booked: slot.booked,
						capacity: slot.capacity
					});
					return new Response(
						JSON.stringify({
							error: 'Slot completo. Por favor selecciona otro horario.',
						}),
						{ status: 409 }
					);
				}
				// Si hay error pero el slot parece disponible, continuar
				console.log('✅ Slot disponible según contador, continuando...');
			} else if (availability.available) {
				console.log('✅ Slot disponible según verificación, continuando...');
			}
		} else {
			console.log('🔄 Modo actualización: omitiendo verificación de disponibilidad');
		}

		// Crear o actualizar cita
		let appointment: any = null;
		let operationError: Error | null = null;

		if (isUpdate && formData.appointmentId) {
			console.log('🔄 Actualizando cita existente:', formData.appointmentId);
			const result = await AppointmentsService.updateAppointment(
				formData.appointmentId,
				formData,
				slot
			);
			appointment = result.appointment;
			operationError = result.error;
		} else {
			console.log('➕ Creando nueva cita');
			const result = await AppointmentsService.createAppointment(
				formData,
				slot
			);
			appointment = result.appointment;
			operationError = result.error;
		}

		if (operationError || !appointment) {
			console.error(`❌ Error al ${isUpdate ? 'actualizar' : 'crear'} cita:`, operationError);
			return new Response(
				JSON.stringify({
					error: `Error al ${isUpdate ? 'actualizar' : 'crear'} cita`,
					details: operationError?.message || `No se pudo ${isUpdate ? 'actualizar' : 'crear'} la cita`,
				}),
				{ status: 500 }
			);
		}

		console.log(`✅ Cita ${isUpdate ? 'actualizada' : 'creada'} exitosamente:`, appointment.id);

		return new Response(
			JSON.stringify({
				success: true,
				appointment: {
					id: appointment.id,
					date: appointment.appointment_date,
					time: appointment.appointment_time,
					status: appointment.status,
				},
			}),
			{
				status: isUpdate ? 200 : 201,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('❌ API Error completo:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		const errorStack = error instanceof Error ? error.stack : undefined;

		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				message: errorMessage,
				...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
			}),
			{ status: 500 }
		);
	}
};

