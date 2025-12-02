import type { EasyBrokerProperty } from '../types/easybroker';

/**
 * Construye la URL pública de la ficha de Easy Broker para una propiedad
 * Formato: https://www.easybroker.com/{country}/listing/{agency_slug}/{property_slug}
 *
 * Ejemplo: https://www.easybroker.com/mx/listing/coldwellb_2/revolucion-san-angel-inn-alvaro-obregon
 *
 * @param property - Propiedad de Easy Broker
 * @param agencySlug - Slug de la agencia (requerido si no viene en la propiedad)
 * @param country - Código de país (default: 'mx')
 * @returns URL completa de la ficha en Easy Broker
 */
export function getEasyBrokerPropertyUrl(
	property: EasyBrokerProperty,
	agencySlug?: string,
	country: string = 'mx'
): string {
	// 1. Si la propiedad ya tiene public_url, usarla directamente (más confiable)
	if (property.public_url) {
		console.log('✅ Usando public_url de la propiedad:', property.public_url);
		return property.public_url;
	}

	// 2. Intentar obtener slug de la propiedad desde la API
	const propertySlug = property.slug;

	// 3. Obtener slug de la agencia (de la propiedad o del parámetro)
	const agency = property.agency_slug || agencySlug;

	console.log('🔍 Construyendo URL para propiedad:', {
		public_id: property.public_id,
		hasPublicUrl: !!property.public_url,
		hasSlug: !!propertySlug,
		hasAgency: !!agency,
		agencySlug: agency,
	});

	// 4. Si tenemos slug de propiedad y agencia, construir la URL
	if (propertySlug && agency) {
		const url = `https://www.easybroker.com/${country}/listing/${agency}/${propertySlug}`;
		console.log('✅ URL construida con slug:', url);
		return url;
	}

	// 5. Si no tenemos slug, usar public_id directamente
	// EasyBroker permite acceder a propiedades por public_id en algunos casos
	if (agency) {
		// Intentar con public_id como slug (algunas agencias lo permiten)
		const url = `https://www.easybroker.com/${country}/listing/${agency}/${property.public_id}`;
		console.log('⚠️ Usando public_id como slug:', url);
		return url;
	}

	// 6. Último fallback: URL genérica (probablemente no funcionará, pero es mejor que nada)
	console.warn(
		`⚠️ No se pudo construir URL completa para propiedad ${property.public_id}. Usando fallback genérico.`
	);
	return `https://www.easybroker.com/${country}/listing/${agencySlug || 'agency'}/${property.public_id}`;
}

