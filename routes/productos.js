const express = require('express');
const Joi = require('joi');
const ruta = express.Router();

const productos = [
    {id:1, nombre:'Ratón inalámbrico'},
    {id:2, nombre:'Teclado mecánico'},
    {id:3, nombre:'Monitor 24"'},
    {id:4, nombre:'Cable HDMI 6ft'}
];

ruta.get('/', (req, res) => {
    res.send(productos);
});

ruta.get('/:id', (req, res) => {
    const id = req.params.id;
    let producto = existeProducto(id);
    if (!producto){
        res.status(404).send(`El producto ${id} no se encuentra!`);
        // Devuelve el estado HTTP 404
        return;
    }
    res.send(producto);
    return;
});

ruta.post('/', (req, res) => {
    // El objeto request tiene la propiedad body
    // que va a venir en formato JSON
    // Creación del schema con Joi
    const {error, value} = validarProducto(req.body.nombre);
    if (!error){
        const producto = {
            id: productos.length + 1,
            nombre: req.body.nombre
        };
        productos.push(producto);
        res.send(producto);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    return;
});


ruta.put('/:id', (req, res) => {
    const id = req.params.id;
    let producto = existeProducto(id);
    if (!producto){
        res.status(404).send(`El producto ${id} no se encuentra`); // Devuelve el estado HTTP
        return;
    }
    // Validar si el dato recibido es correcto
    const {error, value} = validarProducto(req.body.nombre);
    if(!error){
        // Actualiza el nombre
        producto.nombre = value.nombre;
        res.send(producto);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    return;
});

ruta.delete('/:id', (req, res) => {
    const id = req.params.id;
    let producto = existeProducto(id);
    if (!producto){
        res.status(404).send(`El producto ${id} no se encuentra`); // Devuelve el estado HTTP
        return;
    }
    // Encontrar el índice del producto dentro del arreglo
    const index = productos.indexOf(producto);
    productos.splice(index, 1); // Elimina el producto en el índice
    res.send(producto); // Se responde con el producto eliminado
    return;
});

function existeProducto(id){
    return (productos.find(p => p.id === parseInt(id)));
}

function validarProducto(nom){
    const schema = Joi.object({
        nombre: Joi.string()
                .min(3)
                .required()
    });
    return (schema.validate({nombre:nom}));
}

module.exports = ruta;