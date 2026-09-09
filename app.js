const { inquirerMenu, pausa, leerImput, listarLugares } = require('./helpers/inquirer');
const { Busquedas } = require('./models/busquedas');
require('colors');
require('dotenv').config();

const main = async () => {
    let opt = '';
    const busquedas = new Busquedas();

    do {
        opt = await inquirerMenu();

        switch (opt) {
            case '1':
                try {
                    const terminoDeBusqueda = await leerImput('Ciudad: ');
                    const lugares = await busquedas.ciudad(terminoDeBusqueda);

                    if (!lugares.length) {
                        console.log('No se encontraron ciudades para esa búsqueda.'.yellow);
                        break;
                    }

                    const id = await listarLugares(lugares);

                    if (id !== '0') {
                        const lugarSeleccionado = lugares.find(lugar => lugar.id === id);
                        const clima = await busquedas.climaPorLugar(lugarSeleccionado.lat, lugarSeleccionado.lng);

                        if (!clima) {
                            console.log('No se recibieron datos de clima para la ubicación seleccionada.'.yellow);
                            break;
                        }

                        const resultadoPersistencia = busquedas.agregarHistorial(terminoDeBusqueda);

                        console.clear();
                        console.log('\nInformación de la ciudad\n'.green);
                        console.log('Ciudad:', lugarSeleccionado.nombre.green);
                        console.log('Lat:', lugarSeleccionado.lat);
                        console.log('Lng:', lugarSeleccionado.lng);
                        console.log('Temperatura:', clima.temp + ' °C');
                        console.log('Mínima:', clima.temp_min + ' °C');
                        console.log('Máxima:', clima.temp_max + ' °C');
                        console.log('El clima se ve:', clima.description.green);

                        if (!resultadoPersistencia.ok) {
                            console.log(`Aviso: ${resultadoPersistencia.error}`.yellow);
                        }
                    }
                } catch (error) {
                    console.log(`Error: ${error.message}`.red);
                }
                break;
            case '2':
                busquedas.historialCapitalizado.forEach((element, i) => {
                    const idx = `${i + 1}.`.green;
                    console.log(idx + element);
                });
                break;
            case '0':
                break;
        }

        if (opt !== '0') await pausa();
    } while (opt !== '0');
};

main();
