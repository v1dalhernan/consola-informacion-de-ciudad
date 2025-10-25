const inquirer = require('inquirer');
require('colors');

const menuOptions = [
    {
        type: 'list',
        name: 'option',
        message: '¿Qué desea hacer?',
        choices: [
            {
                value: '1',
                name: `${'1.'.green } Buscar ciudad`
            },
            {
                value: '2',
                name: `${'2.'.green } Historial`
            },
            {
                value: '0',
                name: `${'0.'.green } Salir`
            },

        ]
    }
];

const inquirerMenu = async () => {
    console.clear();

    console.log('===================================='.green);
    console.log('       Seleccione una opción        '.white);
    console.log('====================================\n'.green);

    const { option } = await inquirer.prompt(menuOptions);

    return option;
}


const pausa = async () => {
    
    console.log('\n');
    const { value } = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message: `Presiona ${'ENTER'.green} para continuar`,
        }
    ]);

    return value;
}


const leerImput = async (mensaje) => {
    const question  =  [
        {
            type: 'input',
            name: 'description',
            mensaje,
            validate (value) {
                if(value.length === 0){
                    return 'por facor ingreso un valor'
                }
                return true;
            }
        }
    ];

    const { description } = await inquirer.prompt(question);

    return description;
}


const listarLugares = async (lugares = []) => {
    const choices = lugares.map((lugar, i)=> {
        const idx = `${i + 1}`.green
        return {
            value: lugar.id,
            name: `${idx}. ${lugar.nombre}`
        }
    });

    choices.unshift({
        value: '0',
        name: `${'0'.green}. Cancelar`
    });
    
    const preguntas = [{
        type: 'list',
        name: 'id',
        message: 'Seleccione lugar: ',
        choices,
    }];

    const { id } = await inquirer.prompt(preguntas);

    return id;

}

const mostrarListadoCheckList = async (tareas = []) => {
    const choices = tareas.map((tarea, i)=> {
        const idx = `${i + 1}`.green
        return {
            value: tarea.id,
            name: `${idx}. ${tarea.descripcion}`,
            checked: tarea.completadoEn? true: false,
        }
    });

    
    const preguntas = [{
        type: 'checkbox',
        name: 'ids',
        message: 'Selecciones',
        choices,
    }];

    const { ids } = await inquirer.prompt(preguntas);

    return ids;

}

const confirmar = async (mensaje) => {

    const question = [
        {
            type: 'confirm',
            name: 'ok',
            menssage: mensaje,
        }
    ];

    const { ok } = await inquirer.prompt(question);

    return ok;
}




module.exports = {
    inquirerMenu,
    pausa,
    listarLugares,
    leerImput,
    confirmar,
    mostrarListadoCheckList,
}