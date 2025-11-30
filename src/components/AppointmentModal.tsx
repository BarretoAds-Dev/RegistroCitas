/** @jsxImportSource preact */
import { Appointment } from '../types/appointment';

interface AppointmentModalProps {
	appointment: Appointment;
	onClose: () => void;
	onStatusChange: (id: string, status: Appointment['status']) => void;
}

export default function AppointmentModal({ appointment, onClose, onStatusChange }: AppointmentModalProps) {
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

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('es-ES', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
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

	const formatCreatedAt = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<div class="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
			<div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
				{/* Overlay */}
				<div class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

				{/* Modal */}
				<div 
					class="inline-block align-bottom bg-slate-800/95 backdrop-blur-xl rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border-2 border-slate-700/50"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div class="bg-gradient-to-r from-[#003d82]/50 to-[#004C97]/50 px-6 py-4 border-b-2 border-slate-700/50">
						<div class="flex items-center justify-between">
							<h3 class="text-xl font-bold text-white uppercase tracking-wide">
								Detalles de la Cita
							</h3>
							<button
								onClick={onClose}
								class="text-gray-400 hover:text-white transition-colors"
							>
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>

					{/* Content */}
					<div class="px-6 py-6 space-y-6">
						{/* Estado */}
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-400 uppercase tracking-wide">Estado</span>
							<span class={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide border-2 ${getStatusColor(appointment.status)}`}>
								{getStatusLabel(appointment.status)}
							</span>
						</div>

						{/* Información del Cliente */}
						<div class="bg-slate-700/30 p-4 border-2 border-slate-600/30">
							<h4 class="text-sm font-bold text-white mb-4 uppercase tracking-wide">Información del Cliente</h4>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Nombre</div>
									<div class="text-sm font-semibold text-white">{appointment.client.name}</div>
								</div>
								<div>
									<div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</div>
									<div class="text-sm font-semibold text-white">{appointment.client.email}</div>
								</div>
								{appointment.client.phone && (
									<div>
										<div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Teléfono</div>
										<div class="text-sm font-semibold text-white">{appointment.client.phone}</div>
									</div>
								)}
							</div>
						</div>

						{/* Información de la Cita */}
						<div class="bg-slate-700/30 p-4 border-2 border-slate-600/30">
							<h4 class="text-sm font-bold text-white mb-4 uppercase tracking-wide">Información de la Cita</h4>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Fecha</div>
									<div class="text-sm font-semibold text-white">{formatDate(appointment.date)}</div>
								</div>
								<div>
									<div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Hora</div>
									<div class="text-sm font-semibold text-white">{appointment.time}</div>
								</div>
								<div>
									<div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Duración</div>
									<div class="text-sm font-semibold text-white">{appointment.duration} minutos</div>
								</div>
								<div>
									<div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Creada</div>
									<div class="text-sm font-semibold text-white">{formatCreatedAt(appointment.createdAt)}</div>
								</div>
							</div>
						</div>

						{/* Notas */}
						{appointment.client.notes && (
							<div class="bg-slate-700/30 p-4 border-2 border-slate-600/30">
								<h4 class="text-sm font-bold text-white mb-2 uppercase tracking-wide">Notas</h4>
								<p class="text-sm text-gray-300">{appointment.client.notes}</p>
							</div>
						)}

						{/* Acciones */}
						<div class="flex flex-wrap gap-3 pt-4 border-t border-slate-700/50">
							{appointment.status === 'pending' && (
								<button
									onClick={() => {
										onStatusChange(appointment.id, 'confirmed');
										onClose();
									}}
									class="px-6 py-2 bg-green-500/20 text-green-400 border-2 border-green-500/30 hover:bg-green-500/30 transition-all font-bold uppercase tracking-wide text-sm"
								>
									Confirmar Cita
								</button>
							)}
							{appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
								<button
									onClick={() => {
										onStatusChange(appointment.id, 'cancelled');
										onClose();
									}}
									class="px-6 py-2 bg-red-500/20 text-red-400 border-2 border-red-500/30 hover:bg-red-500/30 transition-all font-bold uppercase tracking-wide text-sm"
								>
									Cancelar Cita
								</button>
							)}
							{appointment.status === 'confirmed' && (
								<button
									onClick={() => {
										onStatusChange(appointment.id, 'completed');
										onClose();
									}}
									class="px-6 py-2 bg-blue-500/20 text-blue-400 border-2 border-blue-500/30 hover:bg-blue-500/30 transition-all font-bold uppercase tracking-wide text-sm"
								>
									Marcar como Completada
								</button>
							)}
							<button
								onClick={onClose}
								class="px-6 py-2 bg-slate-700/40 text-white border-2 border-slate-600/50 hover:bg-slate-700/60 hover:border-[#00a0df]/50 transition-all font-bold uppercase tracking-wide text-sm ml-auto"
							>
								Cerrar
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

