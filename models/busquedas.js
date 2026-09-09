const fs = require('fs');
const path = require('path');
const {
    agregarAlHistorial,
    capitalizarCiudad,
    mapearClima,
    mapearLugares,
} = require('./transformaciones');

const REQUEST_TIMEOUT_MS = 10_000;

const mensajeDeErrorHTTP = (servicio, error) => {
    const estado = error.response?.status;

    if (estado === 401 || estado === 403) {
        return `La clave de ${servicio} no fue aceptada.`;
    }

    if (estado === 429) {
        return `${servicio} alcanzó su límite de solicitudes. Inténtalo más tarde.`;
    }

    if (error.code === 'ECONNABORTED') {
        return `La solicitud a ${servicio} tardó demasiado.`;
    }

    return `No se pudo consultar ${servicio}. Revisa tu conexión e inténtalo de nuevo.`;
};

class Busquedas {
    constructor({
        dbPath = path.join(__dirname, '..', 'db', 'database.json'),
        fsModule = fs,
        httpClient,
    } = {}) {
        this.historial = [];
        this.dbPath = dbPath;
        this.fs = fsModule;
        this.httpClient = httpClient;
        this.errorDePersistencia = null;
        this.leerDb();
    }

    get clienteHTTP() {
        return this.httpClient ?? require('axios');
    }

    async ciudad(lugar = '') {
        if (!process.env.MAPBOX_KEY) {
            throw new Error('Falta la variable de entorno MAPBOX_KEY.');
        }

        try {
            const instance = this.clienteHTTP.create({
                baseURL: 'https://api.mapbox.com/search/geocode/v6/forward',
                timeout: REQUEST_TIMEOUT_MS,
                params: {
                    q: lugar,
                    proximity: '-73.990593,40.740121',
                    language: 'es',
                    access_token: process.env.MAPBOX_KEY,
                },
            });
            const respuesta = await instance.get();

            return mapearLugares(respuesta.data);
        } catch (error) {
            throw new Error(mensajeDeErrorHTTP('Mapbox', error));
        }
    }

    async climaPorLugar(lat, lng) {
        if (!process.env.OPEN_WHEATHER) {
            throw new Error('Falta la variable de entorno OPEN_WHEATHER.');
        }

        try {
            const instance = this.clienteHTTP.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                timeout: REQUEST_TIMEOUT_MS,
                params: {
                    lon: lng,
                    lat,
                    appid: process.env.OPEN_WHEATHER,
                    units: 'metric',
                    lang: 'es',
                },
            });
            const respuesta = await instance.get();
            const clima = mapearClima(respuesta.data);

            if (!clima) {
                throw new Error('La respuesta de OpenWeather no contiene datos completos.');
            }

            return clima;
        } catch (error) {
            if (error.message === 'La respuesta de OpenWeather no contiene datos completos.') {
                throw error;
            }

            throw new Error(mensajeDeErrorHTTP('OpenWeather', error));
        }
    }

    agregarHistorial(termino = '') {
        this.historial = agregarAlHistorial(this.historial, termino);

        try {
            this.guardarDB();
            return { ok: true };
        } catch (error) {
            return { ok: false, error: error.message };
        }
    }

    guardarDB() {
        if (this.errorDePersistencia) {
            throw new Error(this.errorDePersistencia);
        }

        const payload = { historial: this.historial };

        try {
            this.fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
            this.fs.writeFileSync(this.dbPath, JSON.stringify(payload, null, 2));
        } catch {
            throw new Error('No se pudo guardar el historial local.');
        }
    }

    leerDb() {
        if (!this.fs.existsSync(this.dbPath)) {
            return;
        }

        try {
            const info = this.fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
            const data = JSON.parse(info);

            if (!Array.isArray(data.historial)) {
                throw new Error('Formato inválido');
            }

            this.historial = data.historial.filter(item => typeof item === 'string');
        } catch {
            this.historial = [];
            this.errorDePersistencia = 'El historial local está dañado y no se modificó. Repara o elimina el archivo para continuar guardando.';
        }
    }

    get historialCapitalizado() {
        return this.historial.map(capitalizarCiudad);
    }
}

module.exports = { Busquedas, REQUEST_TIMEOUT_MS };
