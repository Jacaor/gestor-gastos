const mongoose = require('mongoose');

const CATEGORIAS = ['Comida', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Educacion', 'Otro'];

const gastoSchema = new mongoose.Schema(
  {
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0.01, 'El monto debe ser mayor a 0']
    },
    categoria: {
      type: String,
      required: [true, 'La categoria es obligatoria'],
      enum: {
        values: CATEGORIAS,
        message: 'Categoria invalida. Valores permitidos: ' + CATEGORIAS.join(', ')
      }
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
      default: Date.now
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripcion no puede superar los 200 caracteres']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gasto', gastoSchema);
module.exports.CATEGORIAS = CATEGORIAS;
