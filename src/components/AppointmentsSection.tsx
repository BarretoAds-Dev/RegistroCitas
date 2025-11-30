/** @jsxImportSource preact */
import { useState, useMemo } from 'preact/hooks';
import AppointmentRow from './AppointmentRow';
import AppointmentModal from './AppointmentModal';
import { Appointment } from '../types/appointment';

interface AppointmentsSectionProps {
	appointments: Appointment[];
}

export default function AppointmentsSection({ appointments }: AppointmentsSectionProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
	const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const filteredAppointments = useMemo(() => {
		return appointments.filter(apt => {
			const matchesSearch = !searchQuery || 
				apt.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				apt.client.email.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [appointments, searchQuery, statusFilter]);

	const handleViewAppointment = (appointment: Appointment) => {
		setSelectedAppointment(appointment);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedAppointment(null);
	};

	const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
		console.log(`Cambiar estado de cita ${id} a ${newStatus}`);
		alert(`Estado cambiado a: ${newStatus}`);
	};

	return (
		<div class="space-y-6">
			{/* Filtros */}
			<div class="bg-slate-800/40 backdrop-blur-xl p-6 border-2 border-slate-700/50 shadow-md shadow-black/20">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Buscar</label>
						<input
							type="text"
							value={searchQuery}
							onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
							placeholder="Nombre o email del cliente..."
							class="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
						/>
					</div>
					<div>
						<label class="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Estado</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value as any)}
							class="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
						>
							<option value="all">Todos</option>
							<option value="pending">Pendientes</option>
							<option value="confirmed">Confirmadas</option>
							<option value="cancelled">Canceladas</option>
							<option value="completed">Completadas</option>
						</select>
					</div>
				</div>
			</div>

			{/* Tabla de citas */}
			<div class="bg-slate-800/40 backdrop-blur-xl border-2 border-slate-700/50 shadow-md shadow-black/20 overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-slate-900/50 border-b-2 border-slate-700/50">
							<tr>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Fecha y Hora</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Cliente</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Contacto</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Estado</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Duración</th>
								<th class="px-6 py-4 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">Acciones</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-700/30">
							{filteredAppointments.length === 0 ? (
								<tr>
									<td colspan="6" class="px-6 py-12 text-center">
										<p class="text-gray-400 text-lg">No se encontraron citas</p>
									</td>
								</tr>
							) : (
								filteredAppointments.map((appointment) => (
									<AppointmentRow
										key={appointment.id}
										appointment={appointment}
										onView={() => handleViewAppointment(appointment)}
										onStatusChange={handleStatusChange}
									/>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal */}
			{isModalOpen && selectedAppointment && (
				<AppointmentModal
					appointment={selectedAppointment}
					onClose={handleCloseModal}
					onStatusChange={handleStatusChange}
				/>
			)}
		</div>
	);
}

