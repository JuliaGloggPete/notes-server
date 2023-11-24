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

    if (note.title.length > 50){
        return sendResponse(400, {
            success: false, message: 'title can\'t be longer than 50 chars '


        })
    }
    if (note.text.length > 400){
        return sendResponse(400, {
            success: false, 
            message: 'text can\'t be longer than 400 chars please send it in two notes'


        })
    }

    const date = new Date().toISOString();
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