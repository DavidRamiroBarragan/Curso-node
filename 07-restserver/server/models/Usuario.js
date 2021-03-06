const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}
const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de usuario es necesario']
    },
    email: {
        type: String,
        require: [true, 'El correo del usuario es necesario'],
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

usuarioSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
}
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });
module.exports = mongoose.model('Usuario', usuarioSchema);
