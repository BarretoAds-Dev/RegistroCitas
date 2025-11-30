/** @jsxImportSource preact */
import { useState, useMemo } from 'preact/hooks';
import AppointmentRow from './AppointmentRow';
import AppointmentModal from './AppointmentModal';
import { Appointment } from '../types/appointment';

interface AppointmentsDashboardProps {
	appointments: Appointment[];
}

type SortField = 'date' | 'name' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function AppointmentsDashboard({ appointments }: AppointmentsDashboardProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
	const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'upcoming'>('all');
	const [sortField, setSortField] = useState<SortField>('date');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const itemsPerPage = 10;

	// Calcular estadísticas avanzadas
	const stats = useMemo(() => {
		const total = appointments.length;
		const pending = appointments.filter(a => a.status === 'pending').length;
		const confirmed = appointments.filter(a => a.status === 'confirmed').length;
		const cancelled = appointments.filter(a => a.status === 'cancelled').length;
		const completed = appointments.filter(a => a.status === 'completed').length;
		
		// Citas próximas (próximas 7 días)
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const nextWeek = new Date(today);
		nextWeek.setDate(nextWeek.getDate() + 7);
		
		const upcoming = appointments.filter(apt => {
			const aptDate = new Date(apt.date);
			return aptDate >= today && aptDate <= nextWeek && apt.status !== 'cancelled' && apt.status !== 'completed';
		}).length;

		// Tasa de conversión
		const conversionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';

		return { total, pending, confirmed, cancelled, completed, upcoming, conversionRate };
	}, [appointments]);

	// Filtrar y ordenar citas
	const processedAppointments = useMemo(() => {
		let filtered = [...appointments];

		// Filtro de búsqueda
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(apt => 
				apt.client.name.toLowerCase().includes(query) ||
				apt.client.email.toLowerCase().includes(query) ||
				(apt.client.phone && apt.client.phone.toLowerCase().includes(query))
			);
		}

		// Filtro de estado
		if (statusFilter !== 'all') {
			filtered = filtered.filter(apt => apt.status === statusFilter);
		}

		// Filtro de fecha
		if (dateFilter !== 'all') {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			filtered = filtered.filter(apt => {
				const aptDate = new Date(apt.date);
				aptDate.setHours(0, 0, 0, 0);

				switch (dateFilter) {
					case 'today':
						return aptDate.getTime() === today.getTime();
					case 'week':
						const weekAgo = new Date(today);
						weekAgo.setDate(weekAgo.getDate() - 7);
						return aptDate >= weekAgo;
					case 'month':
						const monthAgo = new Date(today);
						monthAgo.setMonth(monthAgo.getMonth() - 1);
						return aptDate >= monthAgo;
					case 'upcoming':
						const nextWeek = new Date(today);
						nextWeek.setDate(nextWeek.getDate() + 7);
						return aptDate >= today && aptDate <= nextWeek;
					default:
						return true;
				}
			});
		}

		// Ordenamiento
		filtered.sort((a, b) => {
			let aValue: any;
			let bValue: any;

			switch (sortField) {
				case 'date':
					aValue = new Date(`${a.date}T${a.time}`).getTime();
					bValue = new Date(`${b.date}T${b.time}`).getTime();
					break;
				case 'name':
					aValue = a.client.name.toLowerCase();
					bValue = b.client.name.toLowerCase();
					break;
				case 'status':
					aValue = a.status;
					bValue = b.status;
					break;
				case 'createdAt':
					aValue = new Date(a.createdAt).getTime();
					bValue = new Date(b.createdAt).getTime();
					break;
				default:
					return 0;
			}

			if (typeof aValue === 'string' && typeof bValue === 'string') {
				return sortDirection === 'asc' 
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}

			return sortDirection === 'asc' 
				? aValue - bValue
				: bValue - aValue;
		});

		return filtered;
	}, [appointments, searchQuery, statusFilter, dateFilter, sortField, sortDirection]);

	// Paginación
	const totalPages = Math.ceil(processedAppointments.length / itemsPerPage);
	const paginatedAppointments = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return processedAppointments.slice(start, start + itemsPerPage);
	}, [processedAppointments, currentPage, itemsPerPage]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const handleViewAppointment = (appointment: Appointment) => {
		setSelectedAppointment(appointment);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedAppointment(null);
	};

	const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
		// En una aplicación real, aquí harías una llamada API
		console.log(`Cambiar estado de cita ${id} a ${newStatus}`);
		// Por ahora solo mostramos en consola
		alert(`Estado cambiado a: ${newStatus}`);
	};

	const SortIcon = ({ field }: { field: SortField }) => {
		if (sortField !== field) {
			return (
				<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
				</svg>
			);
		}
		return sortDirection === 'asc' ? (
			<svg class="w-4 h-4 text-[#00a0df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
			</svg>
		) : (
			<svg class="w-4 h-4 text-[#00a0df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		);
	};

	return (
		<div class="space-y-6">
			{/* Estadísticas avanzadas */}
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
				<div class="bg-slate-800/40 backdrop-blur-xl p-4 border-2 border-slate-700/50 shadow-md shadow-black/20">
					<div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Total</div>
					<div class="text-2xl font-bold text-white">{stats.total}</div>
				</div>
				<div class="bg-slate-800/40 backdrop-blur-xl p-4 border-2 border-slate-700/50 shadow-md shadow-black/20">
					<div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Próximas</div>
					<div class="text-2xl font-bold text-[#00a0df]">{stats.upcoming}</div>
				</div>
				<div class="bg-slate-800/40 backdrop-blur-xl p-4 border-2 border-slate-700/50 shadow-md shadow-black/20">
					<div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Pendientes</div>
					<div class="text-2xl font-bold text-yellow-400">{stats.pending}</div>
				</div>
				<div class="bg-slate-800/40 backdrop-blur-xl p-4 border-2 border-slate-700/50 shadow-md shadow-black/20">
					<div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Confirmadas</div>
					<div class="text-2xl font-bold text-green-400">{stats.confirmed}</div>
				</div>
				<div class="bg-slate-800/40 backdrop-blur-xl p-4 border-2 border-slate-700/50 shadow-md shadow-black/20">
					<div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Canceladas</div>
					<div class="text-2xl font-bold text-red-400">{stats.cancelled}</div>
				</div>
				<div class="bg-slate-800/40 backdrop-blur-xl p-4 border-2 border-slate-700/50 shadow-md shadow-black/20">
					<div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Completadas</div>
					<div class="text-2xl font-bold text-blue-400">{stats.completed}</div>
				</div>
				<div class="bg-slate-800/40 backdrop-blur-xl p-4 border-2 border-slate-700/50 shadow-md shadow-black/20">
					<div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">Conversión</div>
					<div class="text-2xl font-bold text-purple-400">{stats.conversionRate}%</div>
				</div>
			</div>

			{/* Filtros y búsqueda */}
			<div class="bg-slate-800/40 backdrop-blur-xl p-6 border-2 border-slate-700/50 shadow-md shadow-black/20">
				<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div class="md:col-span-2">
						<label class="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
							Buscar cliente
						</label>
						<input
							type="text"
							value={searchQuery}
							onInput={(e) => {
								setSearchQuery((e.target as HTMLInputElement).value);
								setCurrentPage(1);
							}}
							placeholder="Nombre, email o teléfono..."
							class="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
						/>
					</div>

					<div>
						<label class="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
							Estado
						</label>
						<select
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter((e.target as HTMLSelectElement).value as any);
								setCurrentPage(1);
							}}
							class="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
						>
							<option value="all">Todos</option>
							<option value="pending">Pendientes</option>
							<option value="confirmed">Confirmadas</option>
							<option value="cancelled">Canceladas</option>
							<option value="completed">Completadas</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
							Fecha
						</label>
						<select
							value={dateFilter}
							onChange={(e) => {
								setDateFilter((e.target as HTMLSelectElement).value as any);
								setCurrentPage(1);
							}}
							class="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
						>
							<option value="all">Todas</option>
							<option value="today">Hoy</option>
							<option value="week">Última semana</option>
							<option value="month">Último mes</option>
							<option value="upcoming">Próximas 7 días</option>
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
								<th 
									class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors"
									onClick={() => handleSort('date')}
								>
									<div class="flex items-center gap-2">
										Fecha y Hora
										<SortIcon field="date" />
									</div>
								</th>
								<th 
									class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors"
									onClick={() => handleSort('name')}
								>
									<div class="flex items-center gap-2">
										Cliente
										<SortIcon field="name" />
									</div>
								</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
									Contacto
								</th>
								<th 
									class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-slate-800/50 transition-colors"
									onClick={() => handleSort('status')}
								>
									<div class="flex items-center gap-2">
										Estado
										<SortIcon field="status" />
									</div>
								</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
									Duración
								</th>
								<th class="px-6 py-4 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-700/30">
							{paginatedAppointments.length === 0 ? (
								<tr>
									<td colspan="6" class="px-6 py-12 text-center">
										<svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
										<p class="text-gray-400 text-lg">No se encontraron citas</p>
									</td>
								</tr>
							) : (
								paginatedAppointments.map((appointment) => (
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

				{/* Paginación */}
				{totalPages > 1 && (
					<div class="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
						<div class="text-sm text-gray-400">
							Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, processedAppointments.length)} de {processedAppointments.length} citas
						</div>
						<div class="flex gap-2">
							<button
								onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
								disabled={currentPage === 1}
								class="px-4 py-2 border-2 border-slate-600/50 bg-slate-700/40 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/60 hover:border-[#00a0df]/50 transition-all uppercase tracking-wide text-sm"
							>
								Anterior
							</button>
							<div class="flex items-center gap-2">
								{Array.from({ length: totalPages }, (_, i) => i + 1)
									.filter(page => {
										if (totalPages <= 7) return true;
										if (page === 1 || page === totalPages) return true;
										if (Math.abs(page - currentPage) <= 1) return true;
										return false;
									})
									.map((page, idx, arr) => {
										const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
										return (
											<>
												{showEllipsis && <span class="text-gray-400">...</span>}
												<button
													key={page}
													onClick={() => setCurrentPage(page)}
													class={`px-4 py-2 border-2 font-semibold transition-all uppercase tracking-wide text-sm ${
														currentPage === page
															? 'bg-[#003d82] border-[#00a0df]/60 text-white'
															: 'border-slate-600/50 bg-slate-700/40 text-white hover:bg-slate-700/60 hover:border-[#00a0df]/50'
													}`}
												>
													{page}
												</button>
											</>
										);
									})}
							</div>
							<button
								onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
								disabled={currentPage === totalPages}
								class="px-4 py-2 border-2 border-slate-600/50 bg-slate-700/40 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/60 hover:border-[#00a0df]/50 transition-all uppercase tracking-wide text-sm"
							>
								Siguiente
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Modal de detalles */}
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
