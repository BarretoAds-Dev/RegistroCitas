/**
 * Componentes Globales - Barrel Export
 *
 * Exporta todos los componentes reutilizables del sistema
 * Incluye: atoms, molecules y componentes globales (LoginForm, AppointmentFormFields)
 *
 * Nota: FormField y ErrorMessage son componentes estáticos optimizados (sin estado, sin hooks).
 * Aunque son TSX, son equivalentes a componentes Astro en rendimiento ya que no tienen
 * estado interno ni efectos secundarios.
 *
 * @example
 * ```ts
 * import { Button, Input, FormField, ErrorMessage, LoginForm } from '@/components';
 * ```
 */

// ============================================================================
// UI Components (Todos los componentes UI)
// ============================================================================

export * from './ui';
