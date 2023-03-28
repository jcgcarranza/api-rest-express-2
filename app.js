const inicioDebug = require('debug')('app:inicio'); // Importar el paquete debug
                                // el parámetro indica el archivo y el entorno
                                // de depuración.
const dbDebug = require('debug')('app:db');
const express = require('express'); // Importa el paquete express
const config = require('config'); // Importa el paquete config
const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('joi');
const app = express(); // Crea una instancia de express

// Cuáles son los métodos a implementar
// con su ruta
// app.get(); // Consulta
// app.post(); // Envío de datos al servidor (insertar datos en la base)
// app.put(); // Actualización
// app.delete(); // Eliminación

app.use(express.json()); // Le decimos a Express que use este
                        // middleware.
app.use(express.urlencoded({extended:true})); // Nuevo middleware
                                        // Define el uso de la libreria qs para
                                        // separar la información codificada en
                                        // el url
app.use(express.static('public')); // Nombre de la carpeta que tendrá los archivos
                                    // (recursos estáticos)

console.log(`Aplicación: ${config.get('nombre')}`);
console.log(`BD server: ${config.get('configDB.host')}`);

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    // console.log('Morgan habilitado...');
    // Muestra el mensaje de depuración
    inicioDebug('Morgan está habilitado');
}

dbDebug('Conectando con la base de datos....');

// app.use(logger); // logger ya hace referencia a la función log de logger.js
//                 // debido al exports


// app.use(function(req, res, next){
//     console.log('Autenticando...');
//     next();
// });

// Los tres app.use() son middlewares y se llaman antes de 
// las funciones de ruta GET, POST, PUT, DELETE
// para que éstas puedan trabajar

const usuarios = [
    {id:1, nombre:'Juan'},
    {id:2, nombre:'Karen'},
    {id:3, nombre:'Diego'},
    {id:4, nombre:'María'}
];

function existeUsuario(id){
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string()
                .min(3)
                .required()
    });
    return (schema.validate({nombre:nom}));
}

// Consulta en la ruta raíz del sitio
// Toda petición siempre va a recibir dos parámetros (objetos)
// req: la información que recibe el servidor desde el cliente
// res: la información que el servidor va a responder al cliente
// Vamos a utilizar el método send del objeto res
app.get('/', (req, res) => {
    res.send('Hola mundo desde Express!');
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios);
});

// Con los : delante del id
// Express sabe que es un parámetro a recibir en la ruta
app.get('/api/usuarios/:id', (req, res) => {
    const id = req.params.id;
    let usuario = existeUsuario(id);
    if (!usuario){
        res.status(404).send(`El usuario ${id} no se encuentra!`);
        // Devuelve el estado HTTP 404
        return;
    }
    res.send(usuario);
    return;
});

// Recibiendo varios parámetros
// Se pasan dos parámetros year y month
// Query string
// localhost:5000/api/usuarios/1990/2/?nombre=xxxx&single=y
app.get('/api/usuarios/:year/:month', (req, res) => {
    // En el cuerpo de req está la propiedad
    // query, que guarda los parámetros Query String.
    res.send(req.query);
});

// La ruta tiene el mismo nombre que la petición GET
// Express hace la diferencia dependiendo del tipo
// de petición
// La petición POST la vamos a utilizar para insertar
// un nuevo usuario en nuestro arreglo.
app.post('/api/usuarios', (req, res) => {
    // El objeto request tiene la propiedad body
    // que va a venir en formato JSON
    // Creación del schema con Joi
    const {error, value} = validarUsuario(req.body.nombre);
    if (!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: req.body.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    return;
});

// Petición para modificar datos existentes
// Este método debe recibir un parámetro
// id para saber qué usuario modificar
app.put('/api/usuarios/:id', (req, res) => {
    // Encontrar si existe el usuario a modificar
    let usuario = existeUsuario(req.params.id);
    if (!usuario){
        res.status(404).send('El usuario no se encuentra'); // Devuelve el estado HTTP
        return;
    }
    // Validar si el dato recibido es correcto
    const {error, value} = validarUsuario(req.body.nombre);
    if(!error){
        // Actualiza el nombre
        usuario.nombre = value.nombre;
        res.send(usuario);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    return;
});

// Recibe como parámetro el id del usuario
// que se va a eliminar
app.delete('/api/usuarios/:id', (req, res) => {
    const usuario = existeUsuario(req.params.id);
    if (!usuario){
        res.status(404).send('El usuario no se encuentra'); //Devuelve el estado HTTP
        return;
    }
    // Encontrar el índice del usuario dentro del arreglo
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1); // Elimina el usuario en el índice
    res.send(usuario); // Se responde con el usuario eliminado
    return;
});


app.get('/api/productos', (req, res) => {
    res.send(['mouse', 'teclado', 'bocinas']);
})

// El módulo process, contiene información del sistema
// El objeto env contiene información de las variables
// de entorno.
// Si la variable PORT no existe, que tome un valor
// fijo definido por nosotros (3000)
const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`);
});


// --------- Funciones middleware ---------
// El middleware es un bloque de código que se ejecuta
// entre las peticiones del usuario (request) y la petición
// que llega al servidor. Es un enlace entre la petición
// del usuario y el servidor, antes de que éste pueda
// dar una respuesta.

// Las funciones de middleware son funciones que tienen acceso
// al objeto de solicitud (req), al objeto de respuesta (res)
// y a la siguiente función de middleware en el ciclo de 
// solicitud/respuestas de la aplicación. La siguiente
// función de middleware se denota normalmente con una
// variable denomina next.

// Las funciones de middleware pueden realizar las siguientes
// tareas:

//  - Ejecutar cualquier código.
//  - Realizar cambior en la solicitud y los objetos de respuesta
//  - Finalizar el ciclo de solicitud/respuestas
//  - Invoca la siguiente función de middleware en la pila

// Express es un framework de direccionamiento y uso de middleware
// que permite que la aplicación tenga funcionalidad mínima propia.

// Ya hemos utilizado algunos middleware como son express.json()
// que transforma el dody del req a formato JSON

//             -------------------------
// request  --|--> json() --> route() --|--> response
//             -------------------------

// route() --> Función GET, POST, PUT, DELETE

// Una aplicación Express puede utilizar los siguientes tipos
// de middleware
//      - Middleware de nivel de aplicación
//      - Middleware de nivel de direccionador
//      - Middleware de manejo de errores
//      - Middleware incorporado
//      - Middleware de terceros


// --------- Recursos estáticos ---------
// Los recursos estáticos hacen referencia a archivos,
// imágenes, documentos que se ubican en el servidor.
// Vamos a usar un middleware para poder acceder a esos
// recursos.
