/** @jsxImportSource preact */
import type { JSX } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

// --- TIPOS ---
interface InternalFilterState {
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  maxBedrooms: string;
  minBathrooms: string;
  maxBathrooms: string;
  location: string;
  searchQuery: string;
}

export interface FilterValues {
  minPrice: number | null;
  maxPrice: number | null;
  minBedrooms: number | null;
  maxBedrooms: number | null;
  minBathrooms: number | null;
  maxBathrooms: number | null;
  location: string;
}

interface AdvancedFiltersProps {
  initialFilters?: Partial<FilterValues & { searchQuery: string }>;
  onFiltersChange: (filters: FilterValues) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
}

// --- SUB-COMPONENTES ---
const FilterInput = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  min,
  max,
}: {
  label: string;
  id: keyof InternalFilterState;
  value: string;
  onChange: (key: keyof InternalFilterState, val: string) => void;
  placeholder?: string;
  type?: string;
  icon?: JSX.Element;
  min?: string;
  max?: string;
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-semibold text-gray-700"
    >
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-gray-900 transition-colors">
          {icon}
        </div>
      )}
      <input
        type={type}
        id={id}
        value={value}
        min={min}
        max={max}
        onInput={(e) => onChange(id, (e.target as HTMLInputElement).value)}
        onKeyDown={(e) =>
          e.key === 'Enter' && (e.target as HTMLInputElement).blur()
        }
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200
                    focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10
                    ${icon ? 'pl-10 pr-4' : 'px-4'}`}
      />
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
export function AdvancedFilters({
  initialFilters,
  onFiltersChange,
  onSearchChange,
  onReset,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isApplying = useRef(false);

  const emptyState: InternalFilterState = {
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    minBathrooms: '',
    maxBathrooms: '',
    location: '',
    searchQuery: '',
  };

  const [filters, setFilters] = useState<InternalFilterState>(emptyState);

  // -------------------------------------------------------------------------
  // 🔥 FIX PRINCIPAL: Sincronización Inteligente & Blindada
  // -------------------------------------------------------------------------
  useEffect(() => {
    // 1. Si nosotros acabamos de disparar el cambio, ignoramos el eco inmediato
    if (isApplying.current) {
      console.log(
        '🛡️ useEffect: Ignorando sincronización porque isApplying=true'
      );
      isApplying.current = false;
      return;
    }

    if (initialFilters) {
      console.log('🔄 useEffect: Sincronizando con initialFilters:', {
        searchQuery: initialFilters.searchQuery,
        currentSearchQuery: filters.searchQuery,
      });

      setFilters((prev) => {
        // 🛡️ LÓGICA DE PROTECCIÓN DE BÚSQUEDA
        // Evita que el padre borre el texto mientras escribes o aplicas
        let newSearchQuery = prev.searchQuery;

        // Solo aceptamos el valor del padre si:
        // 1. Está definido
        // 2. Es diferente a lo que ya tenemos
        // 3. NO es una cadena vacía (Aquí está la magia: ignoramos los borrados externos accidentales)
        if (
          initialFilters.searchQuery !== undefined &&
          initialFilters.searchQuery !== prev.searchQuery &&
          initialFilters.searchQuery !== ''
        ) {
          console.log(
            '✅ Aceptando nuevo searchQuery del padre:',
            initialFilters.searchQuery
          );
          newSearchQuery = initialFilters.searchQuery;
        } else if (initialFilters.searchQuery === '') {
          console.log(
            '⚠️ Ignorando searchQuery vacío del padre (protección activa)'
          );
        }

        return {
          ...prev,
          // Aplicamos la misma filosofía conservadora a los demás filtros si lo deseas,
          // o usamos "?? ''" para permitir resets externos si el padre manda null.
          // Aquí uso tu lógica de mantener el valor previo si viene undefined para máxima estabilidad.
          minPrice: initialFilters.minPrice?.toString() ?? prev.minPrice,
          maxPrice: initialFilters.maxPrice?.toString() ?? prev.maxPrice,
          minBedrooms:
            initialFilters.minBedrooms?.toString() ?? prev.minBedrooms,
          maxBedrooms:
            initialFilters.maxBedrooms?.toString() ?? prev.maxBedrooms,
          minBathrooms:
            initialFilters.minBathrooms?.toString() ?? prev.minBathrooms,
          maxBathrooms:
            initialFilters.maxBathrooms?.toString() ?? prev.maxBathrooms,
          location: initialFilters.location ?? prev.location,
          searchQuery: newSearchQuery,
        };
      });
    }
  }, [
    initialFilters?.minPrice,
    initialFilters?.maxPrice,
    initialFilters?.minBedrooms,
    initialFilters?.maxBedrooms,
    initialFilters?.minBathrooms,
    initialFilters?.maxBathrooms,
    initialFilters?.location,
    initialFilters?.searchQuery,
  ]);

  const handleChange = useCallback(
    (key: keyof InternalFilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleApply = () => {
    console.log('🔍 handleApply: Iniciando aplicación de filtros', {
      searchQuery: filters.searchQuery,
      location: filters.location,
    });

    isApplying.current = true; // 🚩 Levantamos bandera de "Yo fui"
    console.log('🚩 isApplying.current = true');

    // 1. Notificar Búsqueda PRIMERO
    const trimmedSearch = filters.searchQuery.trim();
    console.log('📤 Notificando searchQuery al padre:', trimmedSearch);
    onSearchChange(trimmedSearch);

    // 2. Notificar Filtros DESPUÉS
    const parseNum = (val: string) =>
      val && !isNaN(parseFloat(val)) ? parseFloat(val) : null;

    const filterValues = {
      minPrice: parseNum(filters.minPrice),
      maxPrice: parseNum(filters.maxPrice),
      minBedrooms: parseNum(filters.minBedrooms),
      maxBedrooms: parseNum(filters.maxBedrooms),
      minBathrooms: parseNum(filters.minBathrooms),
      maxBathrooms: parseNum(filters.maxBathrooms),
      location: filters.location.trim(),
    };

    console.log('📤 Notificando filtros avanzados al padre:', filterValues);
    onFiltersChange(filterValues);

    console.log('✅ handleApply: Completado');
  };

  const handleReset = () => {
    isApplying.current = true; // También protegemos el reset manual
    setFilters(emptyState);
    onSearchChange('');
    onReset();
  };

  const activeCount = Object.values(filters).filter((val) => val !== '').length;

  // Iconos
  const Icons = {
    Search: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    Dollar: <span className="text-base font-bold">$</span>,
    Filter: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
    ),
    Chevron: (
      <svg
        className={`h-4 w-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    ),
  };

  return (
    <div className="mb-6 w-full">
      {/* Botón Toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1
                        ${
                          isOpen
                            ? 'border-gray-900 bg-gray-50 text-gray-900 ring-1 ring-gray-200'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                        }`}
        >
          <span
            className={
              isOpen
                ? 'text-gray-900'
                : 'text-gray-500 group-hover:text-gray-700'
            }
          >
            {Icons.Filter}
          </span>
          <span>Filtros y Búsqueda</span>

          {activeCount > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gray-900 px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
          <span className="text-gray-400 group-hover:text-gray-600">
            {Icons.Chevron}
          </span>
        </button>
      </div>

      {/* Panel Desplegable */}
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'grid-rows-[1fr] opacity-100 mt-4'
            : 'grid-rows-[0fr] opacity-0 mt-0'
        }`}
      >
        <div className="min-h-0 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50">
          {/* Búsqueda */}
          <div className="mb-8">
            <FilterInput
              id="searchQuery"
              label="Búsqueda Global"
              value={filters.searchQuery}
              onChange={handleChange}
              placeholder="Buscar por título, ID, colonia..."
              icon={Icons.Search}
            />
          </div>

          {/* Grid de Filtros */}
          <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <FilterInput
              id="minPrice"
              label="Precio Mínimo"
              type="number"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="0"
              icon={Icons.Dollar}
            />
            <FilterInput
              id="maxPrice"
              label="Precio Máximo"
              type="number"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="Sin límite"
              icon={Icons.Dollar}
            />

            <div className="sm:col-span-2 lg:col-span-1">
              <FilterInput
                id="location"
                label="Ubicación Específica"
                value={filters.location}
                onChange={handleChange}
                placeholder="Ej: Polanco, Condesa..."
                icon={
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              />
            </div>

            <FilterInput
              id="minBedrooms"
              label="Recámaras (Min)"
              type="number"
              value={filters.minBedrooms}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
            <FilterInput
              id="maxBedrooms"
              label="Recámaras (Max)"
              type="number"
              value={filters.maxBedrooms}
              onChange={handleChange}
              placeholder="Sin límite"
              min="0"
            />
            <FilterInput
              id="minBathrooms"
              label="Baños (Min)"
              type="number"
              value={filters.minBathrooms}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-50 pt-6">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-red-600 focus:outline-none"
              >
                Limpiar filtros
              </button>
            )}
            <button
              type="button"
              onClick={handleApply}
              className="rounded-lg bg-gray-900 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-gray-900/20 transition-all hover:bg-gray-800 hover:shadow-gray-900/30 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 active:scale-95"
            >
              Aplicar Resultados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
