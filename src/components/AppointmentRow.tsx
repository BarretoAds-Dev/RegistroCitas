/** @jsxImportSource preact */
import { Appointment } from '../types/appointment';

interface AppointmentRowProps {
	appointment: Appointment;
	onView: () => void;
	onStatusChange: (id: string, status: Appointment['status']) => void;
}

export default function AppointmentRow({ appointment, onView, onStatusChange }: AppointmentRowProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'confirmed':
				return 'bg-green-500/20 text-green-400 border-green-500/30';
			case 'pending':
				return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
			case 'cancelled':
				return 'bg-red-500/20 text-red-400 border-red-500/30';
			case 'completed':
				return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
			default:
				return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'confirmed':
				return 'Confirmada';
			case 'pending':
				return 'Pendiente';
			case 'cancelled':
				return 'Cancelada';
			case 'completed':
				return 'Completada';
			default:
				return status;
		}
	};

	const formatDateTime = (dateStr: string, timeStr: string) => {
		const date = new Date(`${dateStr}T${timeStr}`);
		return date.toLocaleString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const isUpcoming = () => {
		const aptDate = new Date(`${appointment.date}T${appointment.time}`);
		const now = new Date();
		return aptDate > now && appointment.status !== 'cancelled' && appointment.status !== 'completed';
	};

	return (
		<tr class="hover:bg-slate-700/30 transition-colors">
			<td class="px-6 py-4 whitespace-nowrap">
				<div class="flex items-center gap-2">
					<div>
						<div class={`text-sm font-semibold text-white ${isUpcoming() ? 'text-[#00a0df]' : ''}`}>
							{formatDateTime(appointment.date, appointment.time)}
						</div>
						<div class="text-xs text-gray-400">
							{new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'short' })}
						</div>
					</div>
					{isUpcoming() && (
						<span class="px-2 py-1 bg-[#00a0df]/20 text-[#00a0df] text-xs font-bold uppercase rounded border border-[#00a0df]/30">
							Próxima
						</span>
					)}
				</div>
			</td>
			<td class="px-6 py-4 whitespace-nowrap">
				<div class="text-sm font-semibold text-white">{appointment.client.name}</div>
				<div class="text-xs text-gray-400">{appointment.client.email}</div>
			</td>
			<td class="px-6 py-4 whitespace-nowrap">
				{appointment.client.phone ? (
					<div class="text-sm text-gray-300">{appointment.client.phone}</div>
				) : (
					<div class="text-xs text-gray-500">Sin teléfono</div>
				)}
			</td>
			<td class="px-6 py-4 whitespace-nowrap">
				<span class={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${getStatusColor(appointment.status)}`}>
					{getStatusLabel(appointment.status)}
				</span>
			</td>
			<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
				{appointment.duration} min
			</td>
			<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
				<div class="flex items-center justify-end gap-2">
					{appointment.status === 'pending' && (
						<button
							onClick={() => onStatusChange(appointment.id, 'confirmed')}
							class="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all text-xs font-bold uppercase tracking-wide"
							title="Confirmar"
						>
							✓
						</button>
					)}
					{appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
						<button
							onClick={() => onStatusChange(appointment.id, 'cancelled')}
							class="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-xs font-bold uppercase tracking-wide"
							title="Cancelar"
						>
							✕
						</button>
					)}
					{appointment.status === 'confirmed' && (
						<button
							onClick={() => onStatusChange(appointment.id, 'completed')}
							class="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all text-xs font-bold uppercase tracking-wide"
							title="Completar"
						>
							✓✓
						</button>
					)}
					<button
						onClick={onView}
						class="px-4 py-2 bg-[#003d82] text-white border border-[#00a0df]/30 hover:bg-[#004C97] hover:border-[#00a0df]/50 transition-all text-xs font-bold uppercase tracking-wide"
					>
						Ver
					</button>
				</div>
			</td>
		</tr>
	);
}

