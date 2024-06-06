require('dotenv').config();
const storeData = require('../services/storeData')
const registerUser = require('../services/registerUser')
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Firestore } = require('@google-cloud/firestore');
const { userInfo } = require('os');


async function postPredict(request, h){

  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return h.response({
        status: 'error',
        message: 'Missing or invalid authorization header'
      }).code(401);
  }

  const token = authorizationHeader.split(' ')[1];

  const JWT_SECRET = process.env.JWT_SECRET;

  const decodedToken = jwt.verify(token, JWT_SECRET)
  const userId = decodedToken.user_id;

  const id = crypto.randomUUID();
  const date = new Date().toISOString();
  const dateCreated = date.slice(0,10);

  const {food_name, carbohydrate, proteins, fat, calories} = request.payload; //harusnya di body
  
  const data = {
    "id": id,
    "user_id": userId, //dari token
    "food_name": food_name,
    "carbohydrate": carbohydrate,
    "proteins": proteins,
    "fat": fat,
    "calories": calories,
    "created_at": date,
    "dateCreated": dateCreated //ga dikeluarin ke response
  }

  await storeData(id, data)

  delete(data.dateCreated);

  const response = h.response({
    status: 'success',
    message: 'Data berhasil ditambahkan',
    data
  })
  response.code(201);
  return response;
};

async function postRegister(request, h){

  const {name, email, password} = request.payload //harusnya request body

  const user_id = crypto.randomUUID();

  const hashedPassword = await bcrypt.hash(password, 10)

  const data_user = { //tambahin token
    "user_id": user_id,
    "name": name,
    "email": email,
    "password": hashedPassword, //harus di hash
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

  const db = new Firestore();
  const {email, password} = request.payload;

  let collectionRef = db.collection('user').where('email', '==', email);
  const snapshot = await collectionRef.get(); 

  if (snapshot.empty) {
    return h.response({ 
      status: 'error',
      message: 'Email atau Password salah' 
    }).code(400);
  }

  let userData
  snapshot.forEach(doc=> {
    userData = doc.data();
    userData.id = doc.id;
  })

  const isValid = await bcrypt.compare(password, userData.password);
  
  if(!isValid){
    return h.response({ 
      status: 'error',
      message: 'Email atau Password salah' 
    }).code(400);
  }

  const token = jwt.sign({user_id: userData.id}, process.env.JWT_SECRET);

  delete userData.password;
  delete userData.id;

  return h.response({ //tambahin token dari db user
    status: 'success',
    message: 'Berhasil Login',
    data: {...userData, token}
  }).code(200);

}

async function fetchNutrients(request, h){
  const {date} = request.query //tambahin header request token //token -> user kemudian whre dengan date

  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return h.response({
        status: 'error',
        message: 'Missing or invalid authorization header'
      }).code(401);
  }

  const token = authorizationHeader.split(' ')[1];

  const JWT_SECRET = process.env.JWT_SECRET;

  const decodedToken = jwt.verify(token, JWT_SECRET);
  const userId = decodedToken.user_id;

  const db = new Firestore();

  let collectionRef = db.collection('prediction').where('user_id', '==', userId);

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