const {sendResponse} = require('../../responses/index')
const AWS = require('aws-sdk');
const { validateToken } = require('../middleware/auth');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core')




const getNotes = async(event,context)=>{

    if(event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'invalid token'});
    const username = event.username


   const{Items} = await db.scan({
        TableName: 'notes-db',
        FilterExpression: "#username = :username",
        ExpressionAttributeNames:{
            "#username": "username"
        },
        ExpressionAttributeValues:{
            ":username": username
        }
        
    }).promise()



return sendResponse(200, {success: true, notes: Items})


}


const handler = middy(getNotes)
.use(validateToken)

module.exports = {handler};
