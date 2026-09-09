const MAX_HISTORIAL = 6;

const normalizarCiudad = (ciudad = '') => ciudad.trim().toLocaleLowerCase();

const agregarAlHistorial = (historial = [], ciudad = '') => {
    const ciudadNormalizada = normalizarCiudad(ciudad);

    if (!ciudadNormalizada) {
        return historial.slice(0, MAX_HISTORIAL);
    }

    const sinDuplicado = historial.filter(item => item !== ciudadNormalizada);
    return [ciudadNormalizada, ...sinDuplicado].slice(0, MAX_HISTORIAL);
};

const capitalizarCiudad = (ciudad = '') => ciudad
    .split(' ')
    .filter(Boolean)
    .map(palabra => palabra[0].toUpperCase() + palabra.substring(1))
    .join(' ');

const esCoordenadaValida = coordenada => Number.isFinite(coordenada);

const mapearLugares = ({ features } = {}) => {
    if (!Array.isArray(features)) {
        return [];
    }

    return features.flatMap(lugar => {
        const coordenadasDePropiedades = lugar.properties?.coordinates;
        const coordenadasDeGeometria = lugar.geometry?.coordinates;
        const lng = coordenadasDePropiedades?.longitude ?? coordenadasDePropiedades?.[0] ?? coordenadasDeGeometria?.[0];
        const lat = coordenadasDePropiedades?.latitude ?? coordenadasDePropiedades?.[1] ?? coordenadasDeGeometria?.[1];
        const nombre = lugar.properties?.full_address ?? lugar.properties?.name ?? lugar.full_address ?? lugar.place_name;

        if (!lugar.id || !nombre || !esCoordenadaValida(lng) || !esCoordenadaValida(lat)) {
            return [];
        }

        return [{ id: lugar.id, nombre, lng, lat }];
    });
};

const mapearClima = ({ main, weather } = {}) => {
    const descripcion = weather?.[0]?.description?.trim();

    if (
        !main ||
        !esCoordenadaValida(main.temp) ||
        !esCoordenadaValida(main.temp_max) ||
        !esCoordenadaValida(main.temp_min) ||
        !descripcion
    ) {
        return null;
    }

    return {
        temp: main.temp,
        temp_max: main.temp_max,
        temp_min: main.temp_min,
        description: descripcion,
    };
};

module.exports = {
    MAX_HISTORIAL,
    agregarAlHistorial,
    capitalizarCiudad,
    mapearClima,
    mapearLugares,
};
