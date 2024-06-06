const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({
      port: 8000,
      host: 'localhost',
  });

  server.route(routes)

  server.ext('onPreResponse', function (request, h) {
    const response = request.response;

    if (response.isBoom) {
        const newResponse = h.response({
            status: 'error',
            message: response.message
        })
        newResponse.code(400)
        return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
}

init();