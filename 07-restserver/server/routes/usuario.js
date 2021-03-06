const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/Usuario');
const {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion')
const app = express();

app.get('/usuario',verificaToken, (req, res) => {
    //Parametros opcionales para paginar registros
    const desde = +req.query.desde || 0; // con el más me aseguro que es un número
    const hasta = +req.query.hasta || 5;
    // Para recuperar todos los usuarios
    Usuario.find({estado: true}, 'nombre email role estado _id google img') // el segundo parmetro es para los campos que quiero enviar
        .skip(desde)
        .limit(hasta)
        .exec((error, arrayUsuarios) => {
        if (error) {
            return res.status(400).json({ ok: false, error }); // 400 BAD REQUEST
        }
            Usuario.countDocuments({estado: true}, (error, conteo) => { // el primer parametro {} tiene que ser igual que el del find
                res.json({ok: true, usuarios: arrayUsuarios, totalUsuarios: conteo});
        })
        });
});

app.post('/usuario',[verificaToken, verificaAdminRole], (req, res) => {

    const body = req.body;
    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        role: body.role
    });

    usuario.save((error, usuarioDB) => {
        if (error) {
            return res.status(400).json({ ok: false, error }); // 400 BAD REQUEST
        }

        res.json({
            ok: true,
            usuario: {usuarioDB}
        })
    });

});

app.put('/usuario/:id',[verificaToken, verificaAdminRole], (req, res) => {
    const body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    const id = req.params.id;

    Usuario.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (error, usuarioDB) => {
        if (error) {
            return res.status(400).json({ ok: false, error }); // 400 BAD REQUEST
        }
        res.json({ok: true, usuario: usuarioDB});
    })
});

app.delete('/usuario/:id',[verificaToken, verificaAdminRole], (req, res) => {
    const id = req.params.id;
    // Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(
        id,
        { estado: false },
        { new: true },
        (error, usuarioBorrado) => {
        if (error) {
            return res.status(400).json({ ok: false, error }); // 400 BAD REQUEST
        }
        if (!usuarioBorrado) {
            return res.status(400).json({ ok: false, message: 'Usuario no encontrado' }); // 400 BAD REQUEST
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        })

    });
});

module.exports = app;
