const axios = require('axios');

class Busquedas {
    historial = [];

    constructor() {
        //TODO: leer DB si existe 
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
            // const { description } = respuesta.data.weather[0];
            

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
}

module.exports = Busquedas;