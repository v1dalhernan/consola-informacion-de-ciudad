const fs = require('fs');
const axios = require('axios');


class Busquedas {
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        this.leerDb();
    }


    async ciudad (lugar = ''){
        try {
            // peticion http 
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/search/geocode/v6/forward`,
                params: {
                    'q': lugar,
                    'proximity': '-73.990593,40.740121',
                    'language': 'es',
                    'access_token': process.env.MAPBOX_KEY || '',
                }
            });
            
            const respuesta = await instance.get();
            
            return respuesta.data.features.map((lugar) => ({
                id: lugar.id,
                nombre: lugar.properties.full_address,
                lng: lugar.properties.coordinates.longitude,
                lat: lugar.properties.coordinates.latitude,
            }));

        

        } catch(err) {
            return [];
        }
       
    }

    async climaPorLugar(lat, long) {
        try {

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {
                    'lon': long,
                    'lat': lat,
                    'appid': process.env.OPEN_WHEATHER,
                    'units': 'metric',
                    'lang': 'es'
                }
            });


            const respuesta = await instance.get();

            const {main, weather } = respuesta.data;            

            return {
                temp: main.temp,
                temp_max: main.temp_max,
                temp_min: main.temp_min,
                description: weather[0].description,
            };



        } catch (err){
            return [];
        }

        
    }

    agregarHistorial(lugar = ''){

        //TODO: prevenir duplicados
        if(this.historial?.includes(lugar.toLocaleLowerCase())){
            return;
        } 

        this.historial.unshift(lugar.toLocaleLowerCase());

        //TODO: grabar en db

        this.guardarDB();
            
    }


    guardarDB() {

        const payload = {
            historial: this.historial,
        };

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));

    }

    leerDb() {

         if(!fs.existsSync(this.dbPath)){
                return null;
            }

            const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
            const data = JSON.parse(info);
            this.historial = data.historial;

    }

    get historialCapitalizado () {
        return this.historial.map(value => {
            let palabras = value.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ');
        })
    }
}

module.exports = Busquedas;