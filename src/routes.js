const { 
  postPredict, 
  postRegister,
} = require('../src/handler')

const routes = [
  {
    method: 'POST',
    path: '/predict',
    handler: postPredict,
  },
  {
    method: 'GET',
    path: '/fetch-nutrients',
    handler: (request, h) => {
        return 'API akan memberikan data nutrisi ke client';
    },
  },
  {
    method: 'POST',
    path: '/register',
    handler: postRegister,
  },
  {
    method: '*',
    path: '/{any*}',
    handler: (request, h) => {
        return 'Halaman belum dibuat';
    },
  }
];

module.exports = routes;