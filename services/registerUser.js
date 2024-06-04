const { Firestore } = require('@google-cloud/firestore');

async function registerUser(user_id, data_user) {
  const db = new Firestore();
 
  const userCollection = db.collection('user');
  return userCollection.doc(user_id).set(data_user);
}
 
module.exports = registerUser;