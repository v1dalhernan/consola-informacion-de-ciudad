# Consola de información de ciudad

Aplicación de línea de comandos para buscar una ciudad, consultar su clima actual y conservar un historial local de las últimas seis búsquedas.

## Funcionalidades

- Busca ubicaciones con Mapbox Geocoding.
- Permite escoger una ubicación entre los resultados.
- Consulta temperatura actual, mínima, máxima y descripción con OpenWeather.
- Guarda un historial local, normalizado y sin duplicados.
- Muestra mensajes cuando faltan claves, no hay resultados o un servicio no responde.

## Tecnologías

- Node.js y CommonJS
- Inquirer para el menú interactivo
- Axios para solicitudes HTTP
- dotenv para configuración local
- Node Test Runner para pruebas unitarias

## Requisitos

- Node.js 18 o posterior.
- Una clave de Mapbox Geocoding y una clave de OpenWeather.

## Instalación y configuración

```bash
npm ci
cp example.env .env
```

Completa las variables en `.env` con tus propias claves:

```env
MAPBOX_KEY=tu_clave_de_mapbox
OPEN_WHEATHER=tu_clave_de_openweather
```

`.env` está ignorado por Git. Nunca incluyas claves reales en el repositorio.

## Uso

```bash
npm start
```

Elige **Buscar ciudad**, escribe el nombre de una ciudad y selecciona una coincidencia. La aplicación muestra las coordenadas y el clima. La opción **Historial** enseña las seis búsquedas más recientes.

## Pruebas

```bash
npm test
```

Las pruebas cubren la normalización y el límite del historial, respuestas incompletas, errores HTTP, tiempo de espera y la persistencia local. Usan clientes simulados y no hacen solicitudes a Mapbox ni OpenWeather.

## Limitaciones

- Requiere conectividad y claves válidas de servicios externos.
- Las cuotas, disponibilidad y condiciones de Mapbox y OpenWeather dependen de cada cuenta.
- El historial se guarda únicamente en `db/database.json` en el equipo local y está ignorado por Git. `db/database.example.json` documenta el formato vacío.
- La aplicación guarda el texto de búsqueda introducido por la persona, no el resultado temporal devuelto por Mapbox.
- Las consultas tienen un tiempo máximo de 10 segundos y distinguen claves rechazadas, límite de solicitudes y tiempo de espera. Aun así, la disponibilidad y cuotas dependen de cada cuenta de Mapbox y OpenWeather.
- Si el historial está dañado, la aplicación lo deja intacto y muestra un aviso; hay que repararlo o borrarlo manualmente para volver a persistir búsquedas.

## Autor

Jhonathan Vidal
