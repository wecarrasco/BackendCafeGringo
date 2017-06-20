var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var EmpleadoSchema = new mongoose.Schema({

  Nombre: String,
  celular: String,
  email: String,
  genero: String,
  username : {type: String, unique: true, required: true},
  pass: String,
  date: [Date],
  hrIn: [Date],
  hrOut: [Date],
  scope: String,

});

EmpleadoSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Empleado', EmpleadoSchema);
