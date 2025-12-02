/** @jsxImportSource preact */
import { validatePassword as validatePasswordHibp } from '@/1-app-global-core/services';
import { useState } from 'preact/hooks';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [hibpWarning, setHibpWarning] = useState<string | null>(null);
  const [isCheckingHibp, setIsCheckingHibp] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    if (password.length < 8) {
      return null; // Permitimos pero recomendamos más
    }

    const commonPasswords = [
      'password',
      '123456',
      '12345678',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
    ];

    if (
      commonPasswords.some((common) => password.toLowerCase().includes(common))
    ) {
      return 'Esta contraseña es muy común. Por favor usa una más segura';
    }

    if (/^\d+$/.test(password)) {
      return 'La contraseña no debe contener solo números';
    }

    if (/^[a-zA-Z]+$/.test(password)) {
      return 'La contraseña debe contener números o caracteres especiales';
    }

    return null;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Por favor ingresa un correo electrónico válido');
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validationError = validatePassword(value);
    setPasswordError(validationError);
    setHibpWarning(null);

    // Validar confirmación si ya hay valor
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
    } else if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError(null);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && value !== password) {
      setConfirmPasswordError('Las contraseñas no coinciden');
    } else {
      setConfirmPasswordError(null);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value && value.trim().length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
    } else {
      setNameError(null);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Validaciones
    if (!validateEmail(email)) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!name || name.trim().length < 2) {
      setNameError('El nombre es requerido (mínimo 2 caracteres)');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setNameError(null);
    setHibpWarning(null);
    setIsSuccess(false);

    // Validar contraseña con HIBP
    if (password.length >= 8) {
      setIsCheckingHibp(true);
      try {
        const hibpValidation = await validatePasswordHibp(password);
        if (hibpValidation && hibpValidation.pwned === true) {
          setHibpWarning(
            '⚠️ Esta contraseña ha aparecido en una filtración de datos. ' +
              'Por seguridad, te recomendamos usar una contraseña diferente.'
          );
          setIsCheckingHibp(false);
          setIsLoading(false);
          return; // Bloquear registro si la contraseña está comprometida
        }
      } catch (hibpError) {
        console.warn('⚠️ No se pudo verificar la contraseña con HIBP:', hibpError);
      } finally {
        setIsCheckingHibp(false);
      }
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          user_metadata: {
            name: name.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || 'Error al crear la cuenta');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      // Redirigir al login después de un breve delay
      setTimeout(() => {
        window.location.replace('/login?registered=true');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div class="max-w-md w-full">
        {/* Logo y título */}
        <div class="text-center mb-6 sm:mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-900 mb-3 sm:mb-4 shadow-sm">
            <svg
              class="w-7 h-7 sm:w-8 sm:h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">
            Barreto Realtor
          </h1>
          <p class="text-xs sm:text-sm text-gray-500">
            Crea tu cuenta para acceder al panel de asesores
          </p>
        </div>

        {/* Formulario */}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} class="space-y-4">
            {/* Mensaje de error */}
            {error && (
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Warning HIBP */}
            {hibpWarning && (
              <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
                <div class="flex items-start">
                  <svg
                    class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p>{hibpWarning}</p>
                </div>
              </div>
            )}

            {/* Mensaje de éxito */}
            {isSuccess && (
              <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                Cuenta creada exitosamente. Redirigiendo al login...
              </div>
            )}

            {/* Nombre */}
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onInput={(e) =>
                  handleNameChange((e.target as HTMLInputElement).value)
                }
                required
                disabled={isLoading}
                class={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                  nameError
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-gray-900'
                }`}
                placeholder="Juan Pérez"
              />
              {nameError && (
                <p class="mt-1 text-xs text-red-600">{nameError}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onInput={(e) =>
                  handleEmailChange((e.target as HTMLInputElement).value)
                }
                required
                disabled={isLoading}
                class={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                  emailError
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-gray-900'
                }`}
                placeholder="asesor@ejemplo.com"
              />
              {emailError && (
                <p class="mt-1 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onInput={(e) =>
                  handlePasswordChange((e.target as HTMLInputElement).value)
                }
                required
                disabled={isLoading}
                class={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                  passwordError
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-gray-900'
                }`}
                placeholder="••••••••"
              />
              {passwordError && (
                <p class="mt-1 text-xs text-red-600">{passwordError}</p>
              )}
              {password && !passwordError && password.length >= 6 && (
                <p class="mt-1 text-xs text-gray-500">
                  {password.length < 8
                    ? '💡 Recomendamos usar al menos 8 caracteres para mayor seguridad'
                    : '✓ Contraseña válida'}
                </p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label
                for="confirm-password"
                class="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onInput={(e) =>
                  handleConfirmPasswordChange((e.target as HTMLInputElement).value)
                }
                required
                disabled={isLoading}
                class={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                  confirmPasswordError
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-gray-900'
                }`}
                placeholder="••••••••"
              />
              {confirmPasswordError && (
                <p class="mt-1 text-xs text-red-600">{confirmPasswordError}</p>
              )}
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading || isCheckingHibp}
              class="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isCheckingHibp ? (
                <span class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isCheckingHibp
                    ? 'Verificando seguridad...'
                    : 'Creando cuenta...'}
                </span>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>
        </div>

        {/* Footer con link a login */}
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <a
              href="/login"
              class="text-gray-900 font-medium hover:text-gray-700 underline"
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

