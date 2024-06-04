const { 
  postPredict, 
  postRegister,
  loginUser,
  fetchNutrients,
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
    handler: fetchNutrients
  },
  {
    method: 'POST',
    path: '/register',
    handler: postRegister,
  },
  {
    method: 'POST',
    path: '/login',
    handler: loginUser,
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