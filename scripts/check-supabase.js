#!/usr/bin/env node
/**
 * Script para verificar la configuración de Supabase
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Verificando configuración de Supabase...\n');

// Verificar archivo .env
const envPath = join(rootDir, '.env');
const envExamplePath = join(rootDir, '.env.example');

if (!existsSync(envPath)) {
  console.log('❌ Archivo .env no encontrado');
  console.log('📝 Creando archivo .env desde .env.example...\n');
  
  if (existsSync(envExamplePath)) {
    const exampleContent = readFileSync(envExamplePath, 'utf-8');
    require('fs').writeFileSync(envPath, exampleContent);
    console.log('✅ Archivo .env creado');
    console.log('⚠️  IMPORTANTE: Edita .env y agrega tus credenciales de Supabase\n');
  } else {
    console.log('❌ Archivo .env.example no encontrado');
    process.exit(1);
  }
} else {
  console.log('✅ Archivo .env existe');
}

// Leer y verificar variables
try {
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  let hasUrl = false;
  let hasKey = false;
  
  lines.forEach(line => {
    if (line.startsWith('PUBLIC_SUPABASE_URL=') && !line.includes('your-project')) {
      hasUrl = true;
      const url = line.split('=')[1].trim();
      console.log(`✅ PUBLIC_SUPABASE_URL configurado: ${url.substring(0, 30)}...`);
    }
    if (line.startsWith('PUBLIC_SUPABASE_ANON_KEY=') && !line.includes('your-anon-key')) {
      hasKey = true;
      const key = line.split('=')[1].trim();
      console.log(`✅ PUBLIC_SUPABASE_ANON_KEY configurado: ${key.substring(0, 20)}...`);
    }
  });
  
  if (!hasUrl) {
    console.log('❌ PUBLIC_SUPABASE_URL no configurado o tiene valor por defecto');
  }
  
  if (!hasKey) {
    console.log('❌ PUBLIC_SUPABASE_ANON_KEY no configurado o tiene valor por defecto');
  }
  
  if (hasUrl && hasKey) {
    console.log('\n✅ Configuración completa!');
    console.log('📋 Próximos pasos:');
    console.log('   1. Ejecuta las migraciones SQL en Supabase Dashboard');
    console.log('   2. Reinicia el servidor de desarrollo (pnpm dev)');
    console.log('   3. Verifica que los slots se cargan correctamente\n');
  } else {
    console.log('\n⚠️  Configuración incompleta');
    console.log('📝 Edita el archivo .env con tus credenciales de Supabase');
    console.log('   Obtén las credenciales desde: https://app.supabase.com/project/_/settings/api\n');
  }
  
} catch (error) {
  console.error('❌ Error al leer .env:', error.message);
  process.exit(1);
}

