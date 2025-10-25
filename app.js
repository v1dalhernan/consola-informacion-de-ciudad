const { inquirerMenu, pausa, leerImput, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');
require('colors');
require('dotenv').config();


const main = async () => {

    let opt = '';
    const busquedas = new Busquedas();

    do {

        opt = await inquirerMenu();

        switch(opt) {
            case '1':
                // mostar mensaje 
                const termino_de_busqueda = await leerImput('Ciudad: ');

                // buscar los lugares
                const lugares = await busquedas.ciudad(termino_de_busqueda);

                // seleccionar el lugar 
                const id = await listarLugares(lugares);

                

                // clima 
                if(id != '0'){

                    const lugarSeleccionado = lugares.find(l => l.id === id);

                    busquedas.agregarHistorial(lugarSeleccionado.nombre);


                    const clima = await busquedas.climaPorLugar(lugarSeleccionado.lat, lugarSeleccionado.lng);

                    // mostar resultados 
                    console.clear();
                    console.log('\nInformación de la ciudad\n'.green);
                    console.log('Ciudad:', lugarSeleccionado.nombre.green);
                    console.log('Lat:', lugarSeleccionado.lat);
                    console.log('Lng:',lugarSeleccionado.lng);
                    console.log('Temperatura:', clima.temp + ' °C');
                    console.log('Mínima:', clima.temp_max + ' °C');
                    console.log('Máxima:', clima.temp_min + ' °C');
                    console.log('El clima se ve:', clima.description.green);
                }
                


                

                break;
            case '2':
                busquedas.historialCapitalizado.forEach((element, i )=> {
                    const idx = `${i + 1}.`.green
                    console.log(idx + element);
                });
            break;
            case '0':
            break;
        }

        if(opt !== '0') await pausa();

    }while (opt !== '0');

}

main();