var empleadoController = require('./controllers/empleadoController');
var authController = require('./controllers/authController');


exports.endpoints = [{method: 'GET', path: '/', config: {handler: function(request, reply){reply('API Cafe, Cafe')}}},
	{method: 'POST', path: '/cafe/creatempleado', config: empleadoController.createEmpleado},
	{method: 'GET', path: '/cafe/empleado/{username}', config: empleadoController.getEmpleado},
  {method: 'PUT', path: '/cafe/updatempleado/{username}', config: empleadoController.updateEmpleado},
	{method: 'DELETE', path: '/cafe/deletempleado/{username}', config: empleadoController.deleteEmpleado},
	{method: 'GET', path: '/cafe/empleados', config: empleadoController.getAllEmpleado},
	{method: 'POST', path: '/cafe/login', config: authController.login},
	{method: 'GET', path: '/cafe/logout', config: authController.logout},
	{method: 'GET', path: '/cafe/empleadoname/{username}', config: empleadoController.getNameEmpleado},
	{method: 'GET', path: '/cafe/gethoras', config:empleadoController.gethoras},
	{method: 'PUT', path: '/cafe/marcarhora', config:empleadoController.marcarhora}
];
