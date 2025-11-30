/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { validateAppointment, type AppointmentFormData } from '../schemas/appointmentSchema';

interface AppointmentFormProps {
	selectedDate: Date | null;
	selectedTime: string | null;
	onBack: () => void;
	onSubmit: (data: AppointmentFormData) => void;
}

export default function AppointmentForm({ selectedDate, selectedTime, onBack, onSubmit }: AppointmentFormProps) {
	const [operationType, setOperationType] = useState<'rentar' | 'comprar' | ''>('');
	const [resourceType, setResourceType] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const validateField = (name: string, value: any) => {
		const form = document.getElementById('appointmentForm') as HTMLFormElement;
		if (!form) return;

		const formData = new FormData(form);
		const data: any = {
			date: selectedDate?.toLocaleDateString('es-ES') || '',
			time: selectedTime || '',
			name: formData.get('name') || '',
			email: formData.get('email') || '',
			phone: formData.get('phone') || '',
			operationType: formData.get('operationType') || '',
			notes: formData.get('notes') || ''
		};

		if (operationType === 'rentar') {
			data.budgetRentar = formData.get('budgetRentar') || '';
			data.company = formData.get('company') || '';
		} else if (operationType === 'comprar') {
			data.budgetComprar = formData.get('budgetComprar') || '';
			data.resourceType = formData.get('resourceType') || '';
			
			if (resourceType === 'credito-bancario') {
				data.banco = formData.get('banco') || '';
				data.creditoPreaprobado = formData.get('creditoPreaprobado') || '';
			} else if (resourceType === 'infonavit') {
				data.modalidadInfonavit = formData.get('modalidadInfonavit') || '';
				data.numeroTrabajadorInfonavit = formData.get('numeroTrabajadorInfonavit') || '';
			} else if (resourceType === 'fovissste') {
				data.modalidadFovissste = formData.get('modalidadFovissste') || '';
				data.numeroTrabajadorFovissste = formData.get('numeroTrabajadorFovissste') || '';
			}
		}

		const result = validateAppointment(data);
		if (!result.success && result.errors) {
			setErrors(prev => ({ ...prev, [name]: result.errors![name] || '' }));
		} else {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const handleBlur = (fieldName: string) => {
		setTouched(prev => ({ ...prev, [fieldName]: true }));
		const form = document.getElementById('appointmentForm') as HTMLFormElement;
		if (form) {
			const field = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
			if (field) {
				validateField(fieldName, field.value);
			}
		}
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (!selectedDate || !selectedTime) return;

		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		
		const appointmentData: any = {
			date: selectedDate.toLocaleDateString('es-ES'),
			time: selectedTime,
			name: formData.get('name') || '',
			email: formData.get('email') || '',
			phone: formData.get('phone') || '',
			operationType: formData.get('operationType') || '',
			notes: formData.get('notes') || ''
		};

		// Agregar campos según el tipo de operación
		if (operationType === 'rentar') {
			appointmentData.budgetRentar = formData.get('budgetRentar') || '';
			appointmentData.company = formData.get('company') || '';
		} else if (operationType === 'comprar') {
			appointmentData.budgetComprar = formData.get('budgetComprar') || '';
			appointmentData.resourceType = formData.get('resourceType') || '';
			
			if (resourceType === 'credito-bancario') {
				appointmentData.banco = formData.get('banco') || '';
				appointmentData.creditoPreaprobado = formData.get('creditoPreaprobado') || '';
			} else if (resourceType === 'infonavit') {
				appointmentData.modalidadInfonavit = formData.get('modalidadInfonavit') || '';
				appointmentData.numeroTrabajadorInfonavit = formData.get('numeroTrabajadorInfonavit') || '';
			} else if (resourceType === 'fovissste') {
				appointmentData.modalidadFovissste = formData.get('modalidadFovissste') || '';
				appointmentData.numeroTrabajadorFovissste = formData.get('numeroTrabajadorFovissste') || '';
			}
		}

		// Validar con Zod
		const validation = validateAppointment(appointmentData);
		
		if (!validation.success) {
			setErrors(validation.errors || {});
			setIsSubmitting(false);
			// Marcar todos los campos como touched para mostrar errores
			const allFields = Object.keys(validation.errors || {});
			const touchedFields: Record<string, boolean> = {};
			allFields.forEach(field => {
				touchedFields[field] = true;
			});
			setTouched(touchedFields);
			return;
		}

		setIsSubmitting(true);
		setErrors({});

		// Simular envío
		setTimeout(() => {
			console.log('Datos de la cita validados:', validation.data);
			setIsSubmitting(false);
			if (validation.data) {
				onSubmit(validation.data);
			}
		}, 1500);
	};

	if (!selectedDate || !selectedTime) return null;

	const dateStr = selectedDate.toLocaleDateString('es-ES', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	return (
		<div className="max-w-xl mx-auto transition-all duration-500">
			<div className="text-center mb-6">
				<button
					onClick={onBack}
					className="inline-flex items-center text-sm text-gray-300 hover:text-[#00a0df] mb-4 transition-colors font-semibold uppercase tracking-wide"
				>
					<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
					</svg>
					Cambiar hora
				</button>
				<h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Información de contacto</h2>
				<p className="text-gray-300 text-sm font-light">Completa tus datos para confirmar la cita</p>
			</div>

			{/* Resumen de selección */}
			<div className="bg-gradient-to-r from-[#003d82]/30 to-[#004C97]/30 backdrop-blur-xl p-4 mb-6 border-2 border-[#00a0df]/30 shadow-md shadow-black/15">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs text-gray-400 mb-1">Fecha seleccionada</p>
						<p className="text-sm font-semibold text-white">{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
					</div>
					<div className="text-right">
						<p className="text-xs text-gray-400 mb-1">Hora seleccionada</p>
						<p className="text-sm font-bold text-[#00a0df]">{selectedTime}</p>
					</div>
				</div>
			</div>

			<form id="appointmentForm" onSubmit={handleSubmit} className="space-y-5">
				{Object.keys(errors).length > 0 && (
					<div className="bg-red-500/20 border-2 border-red-500/50 backdrop-blur-xl p-4 mb-4">
						<p className="text-red-300 text-sm font-semibold mb-2">Por favor corrige los siguientes errores:</p>
						<ul className="list-disc list-inside text-red-200 text-xs space-y-1">
							{Object.entries(errors).map(([field, error]) => (
								<li key={field}>{error}</li>
							))}
						</ul>
					</div>
				)}
				<div>
					<label htmlFor="name" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
						Nombre completo <span className="text-red-400">*</span>
					</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						onBlur={() => handleBlur('name')}
						className={`w-full px-4 py-3 border-2 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light ${
							touched.name && errors.name
								? 'border-red-500/70 focus:ring-2 focus:ring-red-500/30 focus:border-red-500'
								: 'border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70'
						}`}
						placeholder="Ej: Juan Pérez"
					/>
					{touched.name && errors.name && (
						<p className="mt-1 text-sm text-red-400">{errors.name}</p>
					)}
				</div>

				<div>
					<label htmlFor="email" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
						Correo electrónico <span className="text-red-400">*</span>
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						onBlur={() => handleBlur('email')}
						className={`w-full px-4 py-3 border-2 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light ${
							touched.email && errors.email
								? 'border-red-500/70 focus:ring-2 focus:ring-red-500/30 focus:border-red-500'
								: 'border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70'
						}`}
						placeholder="Ej: juan@ejemplo.com"
					/>
					{touched.email && errors.email && (
						<p className="mt-1 text-sm text-red-400">{errors.email}</p>
					)}
				</div>

				<div>
					<label htmlFor="phone" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
						Teléfono <span className="text-gray-400 text-xs font-normal normal-case">(opcional)</span>
					</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						onBlur={() => handleBlur('phone')}
						className={`w-full px-4 py-3 border-2 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light ${
							touched.phone && errors.phone
								? 'border-red-500/70 focus:ring-2 focus:ring-red-500/30 focus:border-red-500'
								: 'border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70'
						}`}
						placeholder="Ej: +34 600 000 000"
					/>
					{touched.phone && errors.phone && (
						<p className="mt-1 text-sm text-red-400">{errors.phone}</p>
					)}
				</div>

				{/* Campo de selección: Rentar o Comprar */}
				<div>
					<label className="block text-sm font-bold text-white mb-3 uppercase tracking-wide">
						Tipo de operación <span className="text-red-400">*</span>
					</label>
					<div className="grid grid-cols-2 gap-3">
						<label className={`group relative flex items-center p-4 border-2 cursor-pointer bg-slate-700/40 backdrop-blur-xl hover:bg-slate-700/60 transition-all shadow-md shadow-black/20 hover:shadow-md hover:shadow-black/25 ${
							operationType === 'rentar' ? 'border-[#00a0df]/60 bg-[#003d82]/15' : 'border-slate-600/50 hover:border-[#00a0df]/40'
						}`}>
							<input
								type="radio"
								name="operationType"
								value="rentar"
								checked={operationType === 'rentar'}
								onChange={(e) => {
									const target = e.target as HTMLInputElement;
									if (target) setOperationType(target.value as 'rentar');
								}}
								required
								className="sr-only peer"
							/>
							<div className="flex items-center gap-3 w-full">
								<div className={`w-5 h-5 rounded-full border-2 backdrop-blur-sm flex items-center justify-center transition-all shadow-sm ${
									operationType === 'rentar' ? 'border-[#00a0df] bg-[#00a0df] shadow-[#00a0df]/15' : 'border-slate-500/50'
								}`}>
									<div className={`w-2 h-2 rounded-full transition-all ${
										operationType === 'rentar' ? 'bg-white' : 'bg-slate-700'
									}`}></div>
								</div>
								<span className={`text-white font-semibold transition-colors uppercase tracking-wide text-xs ${
									operationType === 'rentar' ? 'text-[#00a0df]' : ''
								}`}>Rentar</span>
							</div>
						</label>
						<label className={`group relative flex items-center p-4 border-2 cursor-pointer bg-slate-700/40 backdrop-blur-xl hover:bg-slate-700/60 transition-all shadow-md shadow-black/20 hover:shadow-md hover:shadow-black/25 ${
							operationType === 'comprar' ? 'border-[#00a0df]/60 bg-[#003d82]/15' : 'border-slate-600/50 hover:border-[#00a0df]/40'
						}`}>
							<input
								type="radio"
								name="operationType"
								value="comprar"
								checked={operationType === 'comprar'}
								onChange={(e) => {
									const target = e.target as HTMLInputElement;
									if (target) setOperationType(target.value as 'comprar');
								}}
								required
								className="sr-only peer"
							/>
							<div className="flex items-center gap-3 w-full">
								<div className={`w-5 h-5 rounded-full border-2 backdrop-blur-sm flex items-center justify-center transition-all shadow-sm ${
									operationType === 'comprar' ? 'border-[#00a0df] bg-[#00a0df] shadow-[#00a0df]/15' : 'border-slate-500/50'
								}`}>
									<div className={`w-2 h-2 rounded-full transition-all ${
										operationType === 'comprar' ? 'bg-white' : 'bg-slate-700'
									}`}></div>
								</div>
								<span className={`text-white font-semibold transition-colors uppercase tracking-wide text-xs ${
									operationType === 'comprar' ? 'text-[#00a0df]' : ''
								}`}>Comprar</span>
							</div>
						</label>
					</div>
				</div>

				{/* Campos condicionales para RENTAR */}
				{operationType === 'rentar' && (
					<div className="space-y-5">
						<div>
							<label htmlFor="budgetRentar" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
								Presupuesto <span className="text-red-400">*</span>
							</label>
							<select
								id="budgetRentar"
								name="budgetRentar"
								required
								className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
							>
								<option value="">Selecciona un rango</option>
								<option value="20000-30000">$20,000 - $30,000 MXN</option>
								<option value="30000-40000">$30,000 - $40,000 MXN</option>
								<option value="40000-50000">$40,000 - $50,000 MXN</option>
								<option value="50000-60000">$50,000 - $60,000 MXN</option>
								<option value="60000-80000">$60,000 - $80,000 MXN</option>
								<option value="80000-100000">$80,000 - $100,000 MXN</option>
								<option value="100000-150000">$100,000 - $150,000 MXN</option>
								<option value="mas-150000">Más de $150,000 MXN</option>
							</select>
						</div>
						<div>
							<label htmlFor="company" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
								Empresa donde labora <span className="text-red-400">*</span>
							</label>
							<input
								type="text"
								id="company"
								name="company"
								required
								className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
								placeholder="Ej: Empresa S.A."
							/>
						</div>
					</div>
				)}

				{/* Campos condicionales para COMPRAR */}
				{operationType === 'comprar' && (
					<div className="space-y-5">
						<div>
							<label htmlFor="budgetComprar" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
								Presupuesto <span className="text-red-400">*</span>
							</label>
							<select
								id="budgetComprar"
								name="budgetComprar"
								required
								className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
							>
								<option value="">Selecciona un rango</option>
								<option value="2500000-3000000">$2,500,000 - $3,000,000 MXN</option>
								<option value="3000000-3500000">$3,000,000 - $3,500,000 MXN</option>
								<option value="3500000-4000000">$3,500,000 - $4,000,000 MXN</option>
								<option value="4000000-5000000">$4,000,000 - $5,000,000 MXN</option>
								<option value="5000000-6000000">$5,000,000 - $6,000,000 MXN</option>
								<option value="6000000-8000000">$6,000,000 - $8,000,000 MXN</option>
								<option value="8000000-10000000">$8,000,000 - $10,000,000 MXN</option>
								<option value="mas-10000000">Más de $10,000,000 MXN</option>
							</select>
						</div>
						<div>
							<label htmlFor="resourceType" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
								Tipo de recurso <span className="text-red-400">*</span>
							</label>
							<select
								id="resourceType"
								name="resourceType"
								value={resourceType}
								onChange={(e) => {
									const target = e.target as HTMLSelectElement;
									if (target) setResourceType(target.value);
								}}
								required
								className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
							>
								<option value="">Selecciona el origen del recurso</option>
								<option value="recursos-propios">Recursos propios</option>
								<option value="credito-bancario">Crédito bancario</option>
								<option value="infonavit">Infonavit</option>
								<option value="fovissste">Fovissste</option>
							</select>
						</div>

						{/* Campos condicionales para CRÉDITO BANCARIO */}
						{resourceType === 'credito-bancario' && (
							<div className="space-y-5">
								<div>
									<label htmlFor="banco" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
										Banco <span className="text-red-400">*</span>
									</label>
									<select
										id="banco"
										name="banco"
										required
										className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
									>
										<option value="">Selecciona un banco</option>
										<option value="bbva">BBVA</option>
										<option value="banamex">Citibanamex</option>
										<option value="santander">Santander</option>
										<option value="hsbc">HSBC</option>
										<option value="banorte">Banorte</option>
										<option value="scotiabank">Scotiabank</option>
										<option value="banco-azteca">Banco Azteca</option>
										<option value="bancoppel">Bancoppel</option>
										<option value="inbursa">Banco Inbursa</option>
										<option value="banregio">Banregio</option>
										<option value="banco-del-bajio">Banco del Bajío</option>
										<option value="banco-multiva">Banco Multiva</option>
										<option value="otro-banco">Otro banco</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-bold text-white mb-3 uppercase tracking-wide">
										¿Ya cuenta con un crédito preaprobado? <span className="text-red-400 normal-case">*</span>
									</label>
									<div className="grid grid-cols-2 gap-3">
										<label className="group relative flex items-center p-4 border-2 border-slate-600/50 cursor-pointer bg-slate-700/40 backdrop-blur-xl hover:bg-slate-700/60 transition-all shadow-md shadow-black/20 hover:shadow-md hover:shadow-black/25">
											<input
												type="radio"
												name="creditoPreaprobado"
												value="si"
												required
												className="sr-only peer"
											/>
											<div className="flex items-center gap-3 w-full">
												<div className="w-5 h-5 rounded-full border-2 border-slate-500/50 peer-checked:border-[#00a0df] peer-checked:bg-[#00a0df] backdrop-blur-sm flex items-center justify-center transition-all shadow-sm peer-checked:shadow-[#00a0df]/15">
													<div className="w-2 h-2 rounded-full bg-slate-700 peer-checked:bg-white transition-all"></div>
												</div>
												<span className="text-white font-semibold peer-checked:text-[#00a0df] transition-colors uppercase tracking-wide text-xs">Sí</span>
											</div>
										</label>
										<label className="group relative flex items-center p-4 border-2 border-slate-600/50 cursor-pointer bg-slate-700/40 backdrop-blur-xl hover:bg-slate-700/60 transition-all shadow-md shadow-black/20 hover:shadow-md hover:shadow-black/25">
											<input
												type="radio"
												name="creditoPreaprobado"
												value="no"
												required
												className="sr-only peer"
											/>
											<div className="flex items-center gap-3 w-full">
												<div className="w-5 h-5 rounded-full border-2 border-slate-500/50 peer-checked:border-[#00a0df] peer-checked:bg-[#00a0df] backdrop-blur-sm flex items-center justify-center transition-all shadow-sm peer-checked:shadow-[#00a0df]/15">
													<div className="w-2 h-2 rounded-full bg-slate-700 peer-checked:bg-white transition-all"></div>
												</div>
												<span className="text-white font-semibold peer-checked:text-[#00a0df] transition-colors uppercase tracking-wide text-xs">No</span>
											</div>
										</label>
									</div>
								</div>
							</div>
						)}

						{/* Campos condicionales para INFONAVIT */}
						{resourceType === 'infonavit' && (
							<div className="space-y-5">
								<div>
									<label htmlFor="modalidadInfonavit" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
										Modalidad de préstamo <span className="text-red-400">*</span>
									</label>
									<select
										id="modalidadInfonavit"
										name="modalidadInfonavit"
										required
										className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
									>
										<option value="">Selecciona una modalidad</option>
										<option value="tradicional">Tradicional</option>
										<option value="cofinavit">Cofinavit</option>
										<option value="mejoravit">Mejoravit</option>
										<option value="tu-casa">Tu Casa</option>
									</select>
								</div>
								<div>
									<label htmlFor="numeroTrabajadorInfonavit" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
										Número de trabajador Infonavit <span className="text-gray-400 text-xs font-normal normal-case">(opcional)</span>
									</label>
									<input
										type="text"
										id="numeroTrabajadorInfonavit"
										name="numeroTrabajadorInfonavit"
										className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
										placeholder="Ej: 12345678901"
									/>
								</div>
							</div>
						)}

						{/* Campos condicionales para FOVISSSTE */}
						{resourceType === 'fovissste' && (
							<div className="space-y-5">
								<div>
									<label htmlFor="modalidadFovissste" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
										Modalidad de préstamo <span className="text-red-400">*</span>
									</label>
									<select
										id="modalidadFovissste"
										name="modalidadFovissste"
										required
										className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white appearance-none cursor-pointer shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
									>
										<option value="">Selecciona una modalidad</option>
										<option value="tradicional">Tradicional</option>
										<option value="cofinavit">Cofinavit</option>
										<option value="mi-vivienda">Mi Vivienda</option>
									</select>
								</div>
								<div>
									<label htmlFor="numeroTrabajadorFovissste" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
										Número de trabajador Fovissste <span className="text-gray-400 text-xs font-normal normal-case">(opcional)</span>
									</label>
									<input
										type="text"
										id="numeroTrabajadorFovissste"
										name="numeroTrabajadorFovissste"
										className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
										placeholder="Ej: 12345678901"
									/>
								</div>
							</div>
						)}
					</div>
				)}

				<div>
					<label htmlFor="notes" className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">
						Notas adicionales <span className="text-gray-400 text-xs font-normal normal-case">(opcional)</span>
					</label>
					<textarea
						id="notes"
						name="notes"
						rows={4}
						className="w-full px-4 py-3 border-2 border-slate-600/50 focus:ring-2 focus:ring-[#00a0df]/30 focus:border-[#00a0df]/70 outline-none transition-all resize-none bg-slate-700/40 backdrop-blur-xl text-white placeholder-gray-400 shadow-sm shadow-black/15 hover:bg-slate-700/50 font-light"
						placeholder="Cuéntanos sobre el motivo de tu cita o cualquier información adicional que consideres relevante..."
					></textarea>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full bg-[#003d82] backdrop-blur-xl text-white font-bold py-4 px-6 hover:bg-[#004C97] transition-all duration-300 shadow-md shadow-black/25 hover:shadow-md hover:shadow-black/30 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 border-2 border-[#00a0df]/30 hover:border-[#00a0df]/50 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? (
						<span className="flex items-center gap-2">
							<svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Procesando...
						</span>
					) : (
						<>
							<span>Confirmar cita</span>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
							</svg>
						</>
					)}
				</button>
			</form>
		</div>
	);
}

