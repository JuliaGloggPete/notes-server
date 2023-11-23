const {sendResponse} = require('../../responses/index')
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();


exports.handler = async(event,context)=>{

    const note = JSON.parse(event.body)

    //ändrar sen till nano db

    const timestamp = new Date().getTime();
    note.id = `${timestamp}`;

    try{

    await db.put({
        TableName: 'notes-db',
        Item: note
    }).promise()

    return sendResponse(200, {success: true, note})
} catch (error){
    return sendResponse(400, {success: false, message: "Bad request - please send in a note"})
}
    
    
    }