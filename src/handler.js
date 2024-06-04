const storeData = require('../services/storeData')
const registerUser = require('../services/registerUser')
const crypto = require('crypto');

async function postPredict(request, h){

  const id = crypto.randomUUID();
  const date = new Date().toISOString();

  const data = {
    "id": id,
    "user_id": 'percobaan user_id pertama',
    "food_name": 'percobaan makanan pertama',
    "carbohydrate": 'percobaan karbo pertama',
    "proteins": 'percobaan protein pertama',
    "fat": 'percobaan lemak pertama',
    "calories": 'percobaan kalori pertama',
    "created_at": date
  }

  await storeData(id, data)

  const response = h.response({
    status: 'success',
    message: 'Data berhasil ditambahkan',
    data
  })
  response.code(201);
  return response;
};

async function postRegister(request, h){

  const id = crypto.randomUUID();

  const data = {
    name: 'isi nama user',
    email: 'isi email user',
    password: 'isi password user'
  }

  await registerUser(id, data)

  const response = h.response({
    status: 'success',
    message: 'Registrasi user berhasil, data berhasil ditambahkan',
    data
  })
  response.code(201);
  return response;
};


/*const fetchNutrients = () => ({
  status: 'success',
  data: {

  }
});*/

module.exports = postPredict, postRegister;