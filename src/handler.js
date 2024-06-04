const storeData = require('../services/storeData')
const registerUser = require('../services/registerUser')
const crypto = require('crypto');
const { Firestore } = require('@google-cloud/firestore');

async function postPredict(request, h){

  const id = crypto.randomUUID();
  const date = new Date().toISOString();
  const dateCreated = date.slice(0,10);

  const {food_name, carbohydrate, proteins, fat, calories} = request.query;


  const data = {
    "id": id,
    "user_id": 'user_id',
    "food_name": food_name,
    "carbohydrate": carbohydrate,
    "proteins": proteins,
    "fat": fat,
    "calories": calories,
    "created_at": date,
    "dateCreated": dateCreated
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

  const {name, email, password} = request.query

  const user_id = crypto.randomUUID();

  const data_user = {
    "user_id": user_id,
    "name": name,
    "email": email,
    "password": password
  }

  await registerUser(user_id, data_user)

  const response = h.response({
    status: 'success',
    message: 'Registrasi user berhasil, data berhasil ditambahkan',
  })
  response.code(201);
  return response;
};

async function loginUser(request, h){
  const token = crypto.randomUUID();

  const db = new Firestore();

  const {email, password} = request.query;

  let collectionRef = db.collection('user');

  if (email) {
    collectionRef = collectionRef.where('email', '==', email)
  }

  if (password) {
    collectionRef = collectionRef.where('password', '==', password)
  }

  const snapshot = await collectionRef.get(); 

  if (snapshot.empty) {
    return h.response({ 
      status: 'error',
      message: 'Email atau Password salah' 
    }).code(400);
  }

  snapshot.forEach(doc => {
      data = {user_id: doc.id, ...doc.data(), token};
      delete(data.password)
  });


  return h.response({
    status: 'success',
    message: 'Berhasil Login',
    data
  }).code(200);

}

async function fetchNutrients(request, h){
  const {date} = request.query

  const db = new Firestore();

  let collectionRef = db.collection('prediction');

  if (date) {
    collectionRef = collectionRef.where('dateCreated', 'in', [date])
  }

  const snapshot = await collectionRef.get();

  if (snapshot.empty) {
    return h.response({ 
      status: 'error',
      message: 'Data tidak ditemukan' 
    }).code(400);
  }

  const data = [];

  snapshot.forEach(doc => {
    data.push({id: doc.id, ...doc.data()});
  });

  return h.response({
    status: 'success',
    message: 'Berhasil mengambil data',
    data
  }).code(200);

}

module.exports = {postPredict, postRegister, loginUser, fetchNutrients};