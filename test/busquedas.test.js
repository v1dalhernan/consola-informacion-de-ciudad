const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { Busquedas, REQUEST_TIMEOUT_MS } = require('../models/busquedas');

const withEnv = async (values, action) => {
    const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
    Object.assign(process.env, values);

    try {
        await action();
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
    }
};

const crearClienteFalso = get => {
    const configuraciones = [];

    return {
        configuraciones,
        create(configuracion) {
            configuraciones.push(configuracion);
            return { get };
        },
    };
};

const crearDbTemporal = () => fs.mkdtempSync(path.join(os.tmpdir(), 'ciudad-cli-'));

test('persiste el término escrito en una ruta independiente del directorio de trabajo', () => {
    const directory = crearDbTemporal();
    const dbPath = path.join(directory, 'datos', 'historial.json');

    try {
        const busquedas = new Busquedas({ dbPath });
        const resultado = busquedas.agregarHistorial('  Ciudad de Panamá ');

        assert.deepEqual(resultado, { ok: true });
        assert.deepEqual(JSON.parse(fs.readFileSync(dbPath, 'utf8')), {
            historial: ['ciudad de panamá'],
        });
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('no sobrescribe un historial dañado', () => {
    const directory = crearDbTemporal();
    const dbPath = path.join(directory, 'database.json');
    fs.writeFileSync(dbPath, '{historial roto');

    try {
        const busquedas = new Busquedas({ dbPath });
        const resultado = busquedas.agregarHistorial('Madrid');

        assert.equal(resultado.ok, false);
        assert.match(resultado.error, /historial local está dañado/);
        assert.equal(fs.readFileSync(dbPath, 'utf8'), '{historial roto');
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
});

test('informa un fallo de escritura sin interrumpir la sesión', () => {
    const fsConFallo = {
        existsSync: () => false,
        mkdirSync: () => {
            throw new Error('sin permisos');
        },
    };
    const busquedas = new Busquedas({ dbPath: '/ruta/sin-permiso/database.json', fsModule: fsConFallo });

    const resultado = busquedas.agregarHistorial('Lima');

    assert.deepEqual(resultado, { ok: false, error: 'No se pudo guardar el historial local.' });
});

test('configura timeout y transforma una respuesta válida de Mapbox', async () => {
    const cliente = crearClienteFalso(async () => ({
        data: {
            features: [{
                id: 'lugar-1',
                geometry: { coordinates: [-79.52, 8.98] },
                properties: { full_address: 'Panamá, Panamá' },
            }],
        },
    }));
    const busquedas = new Busquedas({ httpClient: cliente, dbPath: path.join(os.tmpdir(), 'no-usar.json') });

    await withEnv({ MAPBOX_KEY: 'clave-de-prueba' }, async () => {
        const lugares = await busquedas.ciudad('Panamá');

        assert.deepEqual(lugares, [{ id: 'lugar-1', nombre: 'Panamá, Panamá', lng: -79.52, lat: 8.98 }]);
        assert.equal(cliente.configuraciones[0].timeout, REQUEST_TIMEOUT_MS);
    });
});

test('distingue credenciales, cuota y tiempo de espera de servicios externos', async () => {
    const escenarios = [
        [{ response: { status: 401 } }, /clave de Mapbox no fue aceptada/],
        [{ response: { status: 429 } }, /Mapbox alcanzó su límite/],
        [{ code: 'ECONNABORTED' }, /solicitud a Mapbox tardó demasiado/],
    ];

    await withEnv({ MAPBOX_KEY: 'clave-de-prueba' }, async () => {
        for (const [error, mensaje] of escenarios) {
            const cliente = crearClienteFalso(async () => {
                throw error;
            });
            const busquedas = new Busquedas({ httpClient: cliente, dbPath: path.join(os.tmpdir(), 'no-usar.json') });

            await assert.rejects(busquedas.ciudad('Quito'), mensaje);
        }
    });
});

test('rechaza una respuesta incompleta de OpenWeather', async () => {
    const cliente = crearClienteFalso(async () => ({
        data: { main: { temp: 20, temp_min: 18, temp_max: 22 }, weather: [] },
    }));
    const busquedas = new Busquedas({ httpClient: cliente, dbPath: path.join(os.tmpdir(), 'no-usar.json') });

    await withEnv({ OPEN_WHEATHER: 'clave-de-prueba' }, async () => {
        await assert.rejects(busquedas.climaPorLugar(8.98, -79.52), /datos completos/);
        assert.equal(cliente.configuraciones[0].timeout, REQUEST_TIMEOUT_MS);
    });
});
