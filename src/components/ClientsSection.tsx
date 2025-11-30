/** @jsxImportSource preact */
import { useState, useMemo } from 'preact/hooks';

interface Client {
	id: string;
	name: string;
	email: string;
	phone: string;
	appointmentsCount: number;
	lastAppointment: string;
}

interface ClientsSectionProps {
	clients: Client[];
}

export default function ClientsSection({ clients }: ClientsSectionProps) {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredClients = useMemo(() => {
		return clients.filter(client => 
			!searchQuery ||
			client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			client.phone.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [clients, searchQuery]);

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	};

	return (
		<div class="space-y-6">
			{/* Búsqueda */}
			<div class="bg-slate-800/40 backdrop-blur-xl p-6 border-2 border-slate-700/50 shadow-md shadow-black/20">
				<label class="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Buscar Cliente</label>
				<input
					type="text"
					value={searchQuery}
					onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
					placeholder="Nombre, email o teléfono..."
					class="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
				/>
			</div>

			{/* Tabla de clientes */}
			<div class="bg-slate-800/40 backdrop-blur-xl border-2 border-slate-700/50 shadow-md shadow-black/20 overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-slate-900/50 border-b-2 border-slate-700/50">
							<tr>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Cliente</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Email</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Teléfono</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Citas</th>
								<th class="px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Última Cita</th>
								<th class="px-6 py-4 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">Acciones</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-700/30">
							{filteredClients.length === 0 ? (
								<tr>
									<td colspan="6" class="px-6 py-12 text-center">
										<svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
										</svg>
										<p class="text-gray-400 text-lg">No se encontraron clientes</p>
									</td>
								</tr>
							) : (
								filteredClients.map((client) => (
									<tr key={client.id} class="hover:bg-slate-700/30 transition-colors">
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="flex items-center gap-3">
												<div class="w-10 h-10 rounded-full bg-[#003d82] flex items-center justify-center text-white font-bold">
													{client.name.charAt(0).toUpperCase()}
												</div>
												<div class="text-sm font-semibold text-white">{client.name}</div>
											</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="text-sm text-gray-300">{client.email}</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="text-sm text-gray-300">{client.phone || '-'}</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span class="px-3 py-1 bg-[#00a0df]/20 text-[#00a0df] border border-[#00a0df]/30 rounded-full text-xs font-bold">
												{client.appointmentsCount}
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="text-sm text-gray-300">{formatDate(client.lastAppointment)}</div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-right">
											<button class="px-4 py-2 bg-[#003d82] text-white border border-[#00a0df]/30 hover:bg-[#004C97] hover:border-[#00a0df]/50 transition-all text-xs font-bold uppercase tracking-wide">
												Ver detalles
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

