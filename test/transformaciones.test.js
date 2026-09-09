const test = require('node:test');
const assert = require('node:assert/strict');
const {
    MAX_HISTORIAL,
    agregarAlHistorial,
    capitalizarCiudad,
    mapearClima,
    mapearLugares,
} = require('../models/transformaciones');

test('agregarAlHistorial normaliza, evita duplicados y respeta el límite', () => {
    const historial = ['madrid', 'parís', 'lima', 'roma', 'tokio', 'bogotá'];
    const actualizado = agregarAlHistorial(historial, '  MADRID ');

    assert.equal(actualizado.length, MAX_HISTORIAL);
    assert.deepEqual(actualizado, ['madrid', 'parís', 'lima', 'roma', 'tokio', 'bogotá']);
});

test('agregarAlHistorial conserva la búsqueda más reciente y descarta la más antigua', () => {
    const actualizado = agregarAlHistorial(
        ['madrid', 'parís', 'lima', 'roma', 'tokio', 'bogotá'],
        'Quito'
    );

    assert.deepEqual(actualizado, ['quito', 'madrid', 'parís', 'lima', 'roma', 'tokio']);
});

test('capitalizarCiudad presenta las entradas del historial', () => {
    assert.equal(capitalizarCiudad('san josé, costa rica'), 'San José, Costa Rica');
});

test('mapearLugares acepta coordenadas de properties o geometry', () => {
    const lugares = mapearLugares({
        features: [
            {
                id: 'uno',
                properties: {
                    full_address: 'Panamá, Panamá',
                    coordinates: { longitude: -79.52, latitude: 8.98 },
                },
            },
            {
                id: 'dos',
                full_address: 'Madrid, España',
                properties: { coordinates: {} },
                geometry: { coordinates: [-3.7, 40.4] },
            },
        ],
    });

    assert.deepEqual(lugares, [
        { id: 'uno', nombre: 'Panamá, Panamá', lng: -79.52, lat: 8.98 },
        { id: 'dos', nombre: 'Madrid, España', lng: -3.7, lat: 40.4 },
    ]);
});

test('mapearLugares descarta respuestas sin datos utilizables', () => {
    assert.deepEqual(mapearLugares({ features: null }), []);
    assert.deepEqual(mapearLugares({
        features: [{
            id: 'sin-coordenadas',
            properties: { full_address: 'Ciudad incompleta' },
        }],
    }), []);
});

test('mapearClima transforma una respuesta válida y rechaza una incompleta', () => {
    assert.deepEqual(mapearClima({
        main: { temp: 25, temp_min: 22, temp_max: 28 },
        weather: [{ description: 'nubes dispersas' }],
    }), {
        temp: 25,
        temp_min: 22,
        temp_max: 28,
        description: 'nubes dispersas',
    });
    assert.equal(mapearClima({}), null);
    assert.equal(mapearClima({ main: {}, weather: [{ description: 'nubes' }] }), null);
    assert.equal(mapearClima({
        main: { temp: 25, temp_min: 22, temp_max: 28 },
        weather: [],
    }), null);
});
