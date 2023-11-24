const { sendResponse } = require("../../responses")
const bycrypt = require('bcryptjs');
const { nanoid } = require("nanoid");

const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();




async function createAccount(username, hashedPassword, userId, firstname, lastname){

    try{

await db.put({
    TableName:'notes-accounts',
    Item:{
        username: username,
        password: hashedPassword,
        firstname: firstname,
        lastname: lastname,
        userId: userId

    }
}).promise();

return {success:true, userId}
}catch(error){
    console.log(error);
   return {success:false, message: 'Could not create account'}
}


}

async function signUp(username, password, firstname, lastname){
    // check om den redan finns...

    const hashedPassword = await bycrypt.hash(password, 10);
    const userId = nanoid();

    const result = await createAccount(username, 
        hashedPassword, userId, firstname,lastname)

        return result;

    
}




exports.handler = async(event,context)=>{

   const {username, password, firstname, lastname} = JSON.parse(event.body)

   const result = await signUp(username, password, firstname, lastname)

   if(result.success)

   return sendResponse(200, result);
   else
   return sendResponse(400, result)
 
 }
 
 