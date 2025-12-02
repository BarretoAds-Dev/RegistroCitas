#!/usr/bin/env node

/**
 * 🏥 Health Check Completo del Sistema
 * Verifica que todos los componentes estén funcionando correctamente
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
  }[type];

  console.log(`${prefix} ${message}`);
}

async function checkEndpoint(
  endpoint,
  expectedStatus = 200,
  description,
  options = {}
) {
  try {
    // Para detectar redirects, usar redirect: 'manual'
    const fetchOptions = {
      redirect: options.allowRedirect ? 'follow' : 'manual',
      ...options,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);
    const status = response.status;

    // Si es un redirect (3xx) y esperamos un redirect, verificar Location header
    if (
      status >= 300 &&
      status < 400 &&
      Array.isArray(expectedStatus) &&
      expectedStatus.includes(status)
    ) {
      const location = response.headers.get('location');
      if (location) {
        log(`${description} - Status: ${status} → ${location}`, 'success');
        checks.passed++;
        return { success: true, status, redirect: location };
      }
    }

    const isOk = Array.isArray(expectedStatus)
      ? expectedStatus.includes(status)
      : status === expectedStatus;

    if (isOk) {
      log(`${description} - Status: ${status}`, 'success');
      checks.passed++;
      let data = null;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch {
        // Ignorar errores de parsing
      }
      return { success: true, status, data };
    } else {
      log(
        `${description} - Expected: ${expectedStatus}, Got: ${status}`,
        'error'
      );
      checks.failed++;
      return { success: false, status };
    }
  } catch (error) {
    log(`${description} - Error: ${error.message}`, 'error');
    checks.failed++;
    return { success: false, error: error.message };
  }
}

async function checkService(serviceName, checkFn) {
  try {
    const result = await checkFn();
    if (result) {
      log(`${serviceName}: OK`, 'success');
      checks.passed++;
    } else {
      log(`${serviceName}: FAILED`, 'error');
      checks.failed++;
    }
    return result;
  } catch (error) {
    log(`${serviceName}: ERROR - ${error.message}`, 'error');
    checks.failed++;
    return false;
  }
}

async function runHealthCheck() {
  console.log(
    `${colors.blue}╔════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.blue}║   🏥 Health Check del Sistema        ║${colors.reset}`
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`
  );
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  // 1. Check básico - Home (verificar redirect)
  console.log(
    `${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.blue}1. Verificación de Rutas Básicas${colors.reset}`);
  console.log(
    `${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  const homeCheck = await checkEndpoint(
    '/',
    [301, 302, 307, 308],
    'Home redirect',
    { redirect: 'manual' }
  );

  // Si el redirect funciona, verificar que redirige a la página correcta
  if (homeCheck.success && homeCheck.redirect) {
    if (homeCheck.redirect.includes('/citas')) {
      log('Redirect apunta a la página correcta', 'success');
    } else {
      log(
        `Redirect apunta a: ${homeCheck.redirect} (esperado: /citas)`,
        'warning'
      );
      checks.warnings++;
    }
  }

  // 2. Check APIs principales
  console.log(
    `\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.blue}2. Verificación de APIs${colors.reset}`);
  console.log(
    `${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );

  const today = new Date().toISOString().split('T')[0];
  const slotsCheck = await checkEndpoint(
    `/api/appointments/available?start=${today}`,
    200,
    'API: Get available slots'
  );

  await checkEndpoint('/api/properties', 200, 'API: Get properties');
  await checkEndpoint('/api/auth/check-session', [200, 401], 'API: Auth check');

  // 3. Verificar datos en slots
  if (slotsCheck.success && slotsCheck.data) {
    const slots = Array.isArray(slotsCheck.data) ? slotsCheck.data : [];
    if (slots.length > 0) {
      log(`Slots disponibles encontrados: ${slots.length}`, 'success');
      const totalSlots = slots.reduce(
        (acc, day) => acc + (day.slots?.length || 0),
        0
      );
      log(`Total slots en próximos días: ${totalSlots}`, 'info');
    } else {
      log(
        'No hay slots disponibles (puede ser normal si no se han generado)',
        'warning'
      );
      checks.warnings++;
    }
  }

  // 4. Check servicios unificados (indirecto)
  console.log(
    `\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.blue}3. Verificación de Servicios${colors.reset}`);
  console.log(
    `${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );

  // Verificar que AvailabilityService funciona
  await checkService('AvailabilityService', async () => {
    const response = await fetch(
      `${BASE_URL}/api/appointments/available?start=${today}`
    );
    return response.ok;
  });

  // Verificar que AppointmentsService funciona (check-slot)
  await checkService('AppointmentsService', async () => {
    const response = await fetch(
      `${BASE_URL}/api/appointments/check-slot?slotId=test`
    );
    // Esperamos 404 o 400 (slot no existe), pero no 500 (error del servidor)
    return response.status !== 500;
  });

  // 5. Check de estructura
  console.log(
    `\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.blue}4. Verificación de Estructura${colors.reset}`);
  console.log(
    `${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );

  // Verificar rutas importantes
  const routes = [
    { path: '/citas/CitasDashboard', status: 200, desc: 'Página de citas' },
    {
      path: '/crm/crmdashboard',
      status: [200, 401, 302],
      desc: 'Dashboard CRM',
    },
    { path: '/propiedades', status: 200, desc: 'Página de propiedades' },
    { path: '/login', status: 200, desc: 'Página de login' },
  ];

  for (const route of routes) {
    await checkEndpoint(route.path, route.status, route.desc);
  }

  // Resumen
  console.log(
    `\n${colors.blue}╔════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.blue}║   📊 Resumen del Health Check          ║${colors.reset}`
  );
  console.log(
    `${colors.blue}╚════════════════════════════════════════╝${colors.reset}`
  );
  console.log(`  ${colors.green}✓ Passed: ${checks.passed}${colors.reset}`);
  console.log(`  ${colors.red}✗ Failed: ${checks.failed}${colors.reset}`);
  if (checks.warnings > 0) {
    console.log(
      `  ${colors.yellow}⚠ Warnings: ${checks.warnings}${colors.reset}`
    );
  }
  console.log('');

  if (checks.failed === 0) {
    console.log(
      `${colors.green}✅ Sistema saludable - Todo funcionando correctamente!${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}❌ Sistema con problemas - Revisa los errores arriba${colors.reset}`
    );
    process.exit(1);
  }
}

// Ejecutar health check
runHealthCheck().catch((error) => {
  console.error(
    `${colors.red}❌ Error fatal en health check:${colors.reset}`,
    error
  );
  process.exit(1);
});
