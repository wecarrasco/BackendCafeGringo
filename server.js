// hapi es el framework y node es el lenguaje
var hapi = require('hapi');
var inert = require('inert');
var mongoose = require('mongoose');
var routes = require('./routes');
var auth = require('hapi-auth-cookie');

var server = new hapi.Server();
server.connection({
    port: ~~process.env.PORT || 8000,
    // cross-origin request service === cros
    routes: { cors: {
                    credentials: true,
                    origin: ["*"]
                }
              }
});

// si se quiere localhost seria "mongoose.connect('mongodb://localhost:27017/nombre');"
mongoose.connect('mongodb://admin:admin@ds161121.mlab.com:61121/empleadodb');
// mongoose es object relational mapper....nos ayuda a despreocuparnos del uso de mongo
var db = mongoose.connection;
// callback es cuando se le envia una promes es la funcion que se hara cunado regrese
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log("Connection with database succeeded.");
});
//registrar plugins
server.register([inert, auth], function(err){
  server.auth.strategy('session', 'cookie', {
    password: 'secretpasswordforencryption',
    cookie: 'cafe-el-gringo-cookie',
    ttl: 24 * 60 * 60 * 1000, // Set session to 1 day
    isSecure: false
  });
	server.route(
      // metodos disponibles create(post) body:{...},read(get)  queryString,params,update(put)  body:{...},delete(delete)  queryString,params
    routes.endpoints

  );

	server.start(function () {
	    console.log('Server running at:', server.info.uri);
	});
});
