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

exports.reporte={
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

exports.updateEmpleado2 = {
  handler: function(req, res){
    console.log("entra a la funcion");
    empleado.findOne({username: req.params.username}, function(err, Empleado){
      console.log("Nombre: "+Empleado.Nombre);
      console.log("Param: "+req.params.username);
      console.log("Payload: "+req.payload.Nombre);
      if (err) {
        return res("error...:(");
      }else{
        Empleado.Nombre = req.payload.Nombre || Empleado.Nombre;
        Empleado.celular = req.payload.celular || Empleado.celular;
        Empleado.email = req.payload.email || Empleado.email;
        Empleado.genero = req.payload.genero || Empleado.genero;
        Empleado.username = req.payload.username || Empleado.username;
        Empleado.pass = String(SHA3(req.payload.pass)) || Empleado.pass;


        Empleado.save(function(err, Empleado){
          if (err) {
            return res("error 2... :(");
          }
          return res({Empleado: Empleado, success:true});
        });
      }
    });
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
    console.log("hora: "+request.payload.hora);
    var datesEmpleado = [];
    var boolDate = false;
    empleado.findOne({username:request.payload.username}, function(err, Empleado){
      if (Empleado.date.length != 0) {
        datesEmpleado = Empleado.date;
        console.log("datesEmpleado: "+datesEmpleado);
      }
    });
    var fecha2 = moment(hora).utcOffset("-0600").format();
    console.log("fecha2: "+fecha2);

    if (datesEmpleado.length != 0) {
      for (var i = 0; i < datesEmpleado.length; i++) {
        var fechai = moment(datesEmpleado[i]).utcOffset("-0600").format();
        if (moment(hora).isSame(fechai, 'year') && moment(hora).isSame(fechai, 'month') && moment(hora).isSame(fechai, 'day')) {
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
            var fechaDates = moment(dates[i]).utcOffset("-0600").format();
            if (moment(req.query.date).isSame(fechaDates, 'year') && moment(req.query.date).isSame(fechaDates, 'month') && moment(req.query.date).isSame(fechaDates, 'day')) {
              index = i;
            }
          }
          if (index == -1) { //No encuentra la fecha
            dates.push(req.query.date);
            return res({empleado: Empleado, message:"entra", horaEntrada: "nada", horaSalida:"nada"});
          }else{ //Si encuentra la fecha
            var fecha = moment(dates[index]).utcOffset("-0600").format();
            var horaEntrada = moment(hrIns[index]).utcOffset("-0600").format();
            var mandarEntrada = false;
            var mandarSalida = false;
            if (hrIns.length != 0) {
              if (moment(fecha).isSame(horaEntrada, 'year') && moment(fecha).isSame(horaEntrada, 'month') && moment(fecha).isSame(horaEntrada, 'day')) {
                mandarEntrada = true;
              }
            }
            var horaSalida;
            if (index <= hrOuts.length-1) {
              console.log("index: "+index+" length: "+hrOuts.length);
              console.log("hrOuts[index] "+hrOuts[index]);
              horaSalida = moment(hrOuts[index]).utcOffset("-0600").format();
              if (hrOuts.length != 0) {
                if (moment(fecha).isSame(horaSalida, 'year') && moment(fecha).isSame(horaSalida, 'month') && moment(fecha).isSame(horaSalida, 'day')) {
                  mandarSalida = true;
                  console.log("entra "+horaSalida);
                }
              }
            }



            if (!mandarEntrada) {
              for (var i = 0; i < hrIns.length; i++) {
                var fechahrIn = moment(hrIns[i]).utcOffset("-0600").format();
                if (moment(fecha).isSame(fechahrIn, 'year') && moment(fecha).isSame(fechahrIn, 'month') && moment(fecha).isSame(fechahrIn, 'day')) {
                  horaEntrada = fechahrIn;
                  mandarEntrada = true;
                }
              }
            }
            if (!mandarSalida) {
              for (var i = 0; i < hrOuts.length; i++) {
                var fechahrOut = moment(hrOuts[i]).utcOffset("-0600").format();
                if (moment(fecha).isSame(fechahrOut, 'year') && moment(fecha).isSame(fechahrOut, 'month') && moment(fecha).isSame(fechahrOut, 'day')) {
                  horaSalida = fechahrOut;
                  mandarSalida = true;

                }
              }
            }

            if (mandarEntrada && !mandarSalida) {
              console.log("horaEntrada: "+horaEntrada);
              return res({empleado: Empleado, message:"sale", horaEntrada: horaEntrada, horaSalida:"nada"});
            }else if (mandarEntrada && mandarSalida) {
              console.log("horaEntrada: "+horaEntrada+" horaSalida: "+horaSalida);
              return res({empleado: Empleado, message:"YaSalio", horaEntrada: horaEntrada, horaSalida:horaSalida});
            }else if (!mandarEntrada && !mandarSalida) {
              console.log("No hay hora entrada y salida");
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
