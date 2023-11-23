const {sendResponse} = require('../../responses/index')
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const { nanoid } = require('nanoid');



exports.handler = async(event,context)=>{

    const note = JSON.parse(event.body)

    if (!note.title || !note.text){
        return sendResponse(400,{success: false, 
            message: 'you need to provide a title AND a text'});
    }

    if (Object.keys(note).length > 2) {
        return sendResponse(400, {
            success: false,
            message: 'Only text and title are allowed, inget fuffens'
        });
    }

    const date = new Date().toDateString();
    note.id = nanoid();
    note.createdAt = `${date}`
    note.modifiedAt = ""

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