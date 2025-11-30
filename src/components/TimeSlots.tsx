
/** @jsxImportSource preact */

interface TimeSlot {
	time: string;
	available: boolean;
	capacity: number;
	booked: number;
}

interface TimeSlotsProps {
	selectedDate: Date | null;
	selectedTime: string | null;
	slots: TimeSlot[];
	onTimeSelect: (time: string) => void;
	onBack: () => void;
}

export default function TimeSlots({ selectedDate, selectedTime, slots, onTimeSelect, onBack }: TimeSlotsProps) {
	if (!selectedDate) return null;

	const dateStr = selectedDate.toLocaleDateString('es-ES', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	// Filtrar solo slots disponibles
	const availableSlots = slots.filter(slot => slot.available && slot.booked < slot.capacity);

	if (availableSlots.length === 0) {
		return (
			<div className="max-w-2xl mx-auto transition-all duration-500">
				<div className="text-center mb-6">
					<button
						onClick={onBack}
						className="inline-flex items-center text-sm text-gray-300 hover:text-[#00a0df] mb-4 transition-colors font-semibold uppercase tracking-wide"
					>
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
						</svg>
						Cambiar fecha
					</button>
					<h2 className="text-2xl font-bold text-white mb-2 tracking-tight">No hay horarios disponibles</h2>
					<p className="text-gray-300 text-sm font-light">
						No hay horarios disponibles para <span className="font-semibold text-[#00a0df]">
							{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
						</span>
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto transition-all duration-500">
			<div className="text-center mb-6">
				<button
					onClick={onBack}
					className="inline-flex items-center text-sm text-gray-300 hover:text-[#00a0df] mb-4 transition-colors font-semibold uppercase tracking-wide"
				>
					<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
					</svg>
					Cambiar fecha
				</button>
				<h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Selecciona una hora</h2>
				<p className="text-gray-300 text-sm font-light">
					Horarios disponibles para <span className="font-semibold text-[#00a0df]">
						{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
					</span>
				</p>
			</div>
			
			<div className="bg-slate-700/30 backdrop-blur-xl p-6 border-2 border-slate-600/40 shadow-md shadow-black/20">
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{availableSlots.map((slot) => {
						const isSelected = selectedTime === slot.time;
						const remaining = slot.capacity - slot.booked;
						
						return (
							<button
								key={slot.time}
								type="button"
								onClick={() => onTimeSelect(slot.time)}
								className={`
									py-3 px-4 text-sm font-bold transition-all duration-200 backdrop-blur-xl relative
									${isSelected
										? 'bg-[#003d82] backdrop-blur-xl text-white shadow-md shadow-black/20 scale-105 border-2 border-[#00a0df]/60'
										: 'bg-slate-700/40 backdrop-blur-xl text-white hover:bg-slate-700/60 hover:text-[#00a0df] hover:scale-105 active:scale-95 border-2 border-slate-600/50 shadow-sm shadow-black/10 hover:shadow-md hover:shadow-black/15'
									}
								`}
							>
								{slot.time}
								{remaining < slot.capacity && (
									<span className="absolute top-1 right-1 text-xs text-[#00a0df]">
										{remaining}/{slot.capacity}
									</span>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

