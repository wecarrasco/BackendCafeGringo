var empleado = require('../schemas/empleado');
var mongoose = require('mongoose');
var moment = require('moment');
var SHA3 = require("crypto-js/sha3");
var boom = require("boom");

exports.createEmpleado = {
  auth: {
    mode:'try',
    strategy:'session'
  },
  handler: function(request, reply){
    var empleados = new empleado({
      Nombre: request.payload.Nombre,
      celular: request.payload.celular,
      email: request.payload.email,
      genero: request.payload.genero,
      username : request.payload.username,
      pass: String(SHA3(request.payload.pass)),
      date: request.payload.date,
      hrIn: request.payload.hrIn,
      hrOut: request.payload.hrOut,
      scope: request.payload.scope,
    });
    empleados.save(function(err){
      if(!err){
        return reply({
          success: true
        })
      }else{
        return reply({
          success: false
        })
      }
    });
  }
}

exports.getEmpleado = {
  handler: function(request, reply){
    var empleados = empleado.find({username: request.params.username});
    reply(empleados);
  }
}

exports.updateEmpleado = {
  handler: function(request, reply){
    empleado.update({username: request.params.username},
        {
          Nombre: request.payload.Nombre,
          celular: request.payload.celular,
          email: request.payload.email,
          genero: request.payload.genero,
          username : request.payload.username,
          pass: String(SHA3(request.payload.pass)),
          date: request.payload.date,
          hrIn: request.payload.hrIn,
          hrOut: request.payload.hrOut,
          scope: request.payload.scope,
        }).exec();
      //   ,
      // // function(err){
      // //   if(err){
      // //     return reply(boom.wrap(err, 'Empleado no encontrado'));
      // //   }else{
      // //     return reply('Actualizado con exito!!');
      // //   }
      // // }
    // );
  }
}

exports.deleteEmpleado = {
  handler: function(request, reply){
    empleado.find({username: request.params.username}).remove().exec();
    return reply('Empleado borrado con exito!!');
  }
}

exports.getAllEmpleado = {
  handler: function(request, reply){
    var empleados = empleado.find({});
    reply(empleados);
  }
}

exports.getNameEmpleado = {
  handler: function(request, reply){
    var empleados = empleado.find({username: request.params.username},{Nombre:1});
    reply(empleados);
  }
}

function imprimir(a){
  console.log(a);
}

exports.marcarhora ={
  handler: function(request, reply){
    var hora = request.payload.hora;
    var datesEmpleado = [];
    var boolDate = false;
    empleado.findOne({username:request.payload.username}, function(err, Empleado){
      if (Empleado.date.length != 0) {
        datesEmpleado = Empleado.date;
      }
    });

    if (datesEmpleado.length != 0) {
      for (var i = 0; i < datesEmpleado.length; i++) {
        if (moment(req.query.hora).isSame(datesEmpleado[i], 'year') && moment(req.query.hora).isSame(datesEmpleado[i], 'month') && moment(req.query.hora).isSame(datesEmpleado[i], 'day')) {
          boolDate = true;
        }
      }
    }else{
      boolDate = false;
    }
    if (request.payload.message === "entrada" && boolDate === false) {
      empleado.update({username: request.payload.username},
        {$push:
          {
            hrIn: hora,
            date: hora
          }
        }, function(err){
          if (err) {
            console.log(err);
            return reply({message:"Empleado no encontrado!", success: false});
          }else{
            return reply({message: "Actualizado con exito!", success: true});
          }
        }
      )
    }else if (request.payload.message === "entrada" && boolDate === true) {
      empleado.update({username: request.payload.username},
        {$push:
          {
            hrIn: hora
          }
        }, function(err){
          if (err) {
            console.log(err);
            return reply({message:"Empleado no encontrado!", success: false});
          }else{
            return reply({message: "Actualizado con exito!", success: true});
          }
        }
      )
    }else if (request.payload.message === "salida") {
      empleado.update({username: request.payload.username},
        {$push:
          {
            hrOut: hora
          }
        }, function(err){
          if (err) {
            return reply({message: "Empleado no encontrado!", success: false});
          }else{
            return reply({message: "Actualizado con exito!", success: true});
          }
        }
      )
    }
  }
}

exports.gethoras ={
  handler: function(req, res){
    //console.log("Query: "+req.query.username+" Date: "+req.query.date);
    var username = req.query.username;
    empleado.findOne({username: username}, function(err, Empleado){
      if (!err && Empleado) {
        //console.log(Empleado.Nombre);

        var dates = Empleado.date;
        var hrIns = Empleado.hrIn;
        var hrOuts = Empleado.hrOut;
        //console.log(hrOuts);
        if (dates.length < 0) { //Primera vez que ingresa
          dates.push(req.query.date);
          return res({empleado: Empleado, message:"entra", horaEntrada: "nada", horaSalida:"nada"});
        }else{ //Ya existen datos de fechas
          var index = -1;
          for (var i = 0; i < dates.length; i++) {
            if (moment(req.query.date).isSame(dates[i], 'year') && moment(req.query.date).isSame(dates[i], 'month') && moment(req.query.date).isSame(dates[i], 'day')) {
              index = i;
            }
          }
          if (index == -1) { //No encuentra la fecha
            dates.push(req.query.date);
            return res({empleado: Empleado, message:"entra", horaEntrada: "nada", horaSalida:"nada"});
          }else{ //Si encuentra la fecha
            var fecha = dates[index];
            var horaEntrada = hrIns[index];
            var mandarEntrada = false;
            var mandarSalida = false;
            if (hrIns.length != 0) {
              if (moment(fecha).isSame(horaEntrada, 'year') && moment(fecha).isSame(horaEntrada, 'month') && moment(fecha).isSame(horaEntrada, 'day')) {
                mandarEntrada = true;
              }
            }


            var horaSalida = hrOuts[index];
            if (hrOuts.length != 0) {
              if (moment(fecha).isSame(horaSalida, 'year') && moment(fecha).isSame(horaSalida, 'month') && moment(fecha).isSame(horaSalida, 'day')) {
                console.log("Fecha: "+fecha+"\nhoraSalida: "+horaSalida);
                mandarSalida = true;
              }
            }


            if (!mandarEntrada) {
              for (var i = 0; i < hrIns.length; i++) {
                if (moment(fecha).isSame(hrIns[i], 'year') && moment(fecha).isSame(hrIns[i], 'month') && moment(fecha).isSame(hrIns[i], 'day')) {
                  horaEntrada = hrIns[i];
                  mandarEntrada = true;
                }
              }
            }
            if (!mandarSalida) {
              for (var i = 0; i < hrOuts.length; i++) {
                if (moment(fecha).isSame(hrOuts[i], 'year') && moment(fecha).isSame(hrOuts[i], 'month') && moment(fecha).isSame(hrOuts[i], 'day')) {
                  console.log("fecha: "+fecha+"\nhrOuts["+i+"]: "+hrOuts[i]);
                  horaSalida = hrOuts[i];
                  mandarSalida = true;
                }
              }
            }

            if (mandarEntrada && !mandarSalida) {
              return res({empleado: Empleado, message:"sale", horaEntrada: horaEntrada, horaSalida:"nada"});
            }else if (mandarEntrada && mandarSalida) {
              return res({empleado: Empleado, message:"YaSalio", horaEntrada: horaEntrada, horaSalida:horaSalida});
            }else if (!mandarEntrada && !mandarSalida) {
              return res({empleado: Empleado, message:"entra", horaEntrada: "nada", horaSalida:"nada"});
            }
          }
        }
      }else if (!err) {
        return res(boom.notFound());
      }else if (err) {
        return res(boom.wrap(err, "Usuario no encontrado"));
      }
    });
  }
}
