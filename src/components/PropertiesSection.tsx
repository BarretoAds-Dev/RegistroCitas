/** @jsxImportSource preact */
import { useState, useMemo } from 'preact/hooks';

interface Property {
	id: string;
	title: string;
	type: string;
	operation: string;
	price: number;
	address: string;
	bedrooms: number;
	bathrooms: number;
	area: number;
	status: string;
	description: string;
	features: string[];
	createdAt: string;
}

interface PropertiesSectionProps {
	properties: Property[];
}

export default function PropertiesSection({ properties }: PropertiesSectionProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'disponible' | 'reservado' | 'vendido' | 'rentado'>('all');
	const [operationFilter, setOperationFilter] = useState<'all' | 'venta' | 'renta'>('all');

	const filteredProperties = useMemo(() => {
		return properties.filter(prop => {
			const matchesSearch = !searchQuery || 
				prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				prop.address.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
			const matchesOperation = operationFilter === 'all' || prop.operation === operationFilter;
			return matchesSearch && matchesStatus && matchesOperation;
		});
	}, [properties, searchQuery, statusFilter, operationFilter]);

	const formatPrice = (price: number, operation: string) => {
		if (operation === 'venta') {
			return `$${(price / 1000000).toFixed(1)}M MXN`;
		}
		return `$${price.toLocaleString()} MXN/mes`;
	};

	return (
		<div class="space-y-6">
			{/* Filtros */}
			<div class="bg-slate-800/40 backdrop-blur-xl p-6 border-2 border-slate-700/50 shadow-md shadow-black/20">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label class="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Buscar</label>
						<input
							type="text"
							value={searchQuery}
							onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
							placeholder="Título o dirección..."
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
							<option value="disponible">Disponible</option>
							<option value="reservado">Reservado</option>
							<option value="vendido">Vendido</option>
							<option value="rentado">Rentado</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Operación</label>
						<select
							value={operationFilter}
							onChange={(e) => setOperationFilter((e.target as HTMLSelectElement).value as any)}
							class="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
						>
							<option value="all">Todas</option>
							<option value="venta">Venta</option>
							<option value="renta">Renta</option>
						</select>
					</div>
				</div>
			</div>

			{/* Grid de propiedades */}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredProperties.length === 0 ? (
					<div class="col-span-full bg-slate-800/40 backdrop-blur-xl p-12 border-2 border-slate-700/50 shadow-md shadow-black/20 text-center">
						<svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
						<p class="text-gray-400 text-lg">No se encontraron propiedades</p>
					</div>
				) : (
					filteredProperties.map((prop) => (
						<div key={prop.id} class="bg-slate-800/40 backdrop-blur-xl border-2 border-slate-700/50 shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/30 transition-all hover:border-[#00a0df]/30">
							<div class="p-6">
								<div class="flex items-start justify-between mb-4">
									<div class="flex-1">
										<h3 class="text-lg font-bold text-white mb-1">{prop.title}</h3>
										<p class="text-sm text-gray-400">{prop.address}</p>
									</div>
									<span class={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${
										prop.status === 'disponible'
											? 'bg-green-500/20 text-green-400 border-green-500/30'
											: prop.status === 'vendido' || prop.status === 'rentado'
											? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
											: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
									}`}>
										{prop.status}
									</span>
								</div>

								<div class="mb-4">
									<div class="text-2xl font-bold text-[#00a0df] mb-2">
										{formatPrice(prop.price, prop.operation)}
									</div>
									<div class="flex items-center gap-4 text-sm text-gray-300">
										<span class="flex items-center gap-1">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
											</svg>
											{prop.bedrooms} recámaras
										</span>
										<span class="flex items-center gap-1">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
											</svg>
											{prop.bathrooms} baños
										</span>
										<span>{prop.area} m²</span>
									</div>
								</div>

								<div class="mb-4">
									<p class="text-sm text-gray-300 line-clamp-2">{prop.description}</p>
								</div>

								{prop.features.length > 0 && (
									<div class="mb-4">
										<div class="flex flex-wrap gap-2">
											{prop.features.slice(0, 3).map((feature) => (
												<span class="px-2 py-1 bg-slate-700/40 text-xs text-gray-300 border border-slate-600/30">
													{feature}
												</span>
											))}
										</div>
									</div>
								)}

								<div class="flex items-center justify-between pt-4 border-t border-slate-700/50">
									<span class="text-xs text-gray-400 uppercase tracking-wide">
										{prop.type} • {prop.operation}
									</span>
									<button class="px-4 py-2 bg-[#003d82] text-white border border-[#00a0df]/30 hover:bg-[#004C97] hover:border-[#00a0df]/50 transition-all text-xs font-bold uppercase tracking-wide">
										Ver detalles
									</button>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

