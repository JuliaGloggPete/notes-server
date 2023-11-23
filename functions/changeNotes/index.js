const {sendResponse} = require('../../responses/index')
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async(event,context)=>{



        const requestBody = JSON.parse(event.body);
        const {id, note} = requestBody

        //kolla om jag har id
        if(!id||!note){
            return sendResponse(400, {success:false, message:"Invalid data - need id and a new note!"})
        }


        try{



        const {Items} = await db.scan({
            TableName: 'notes-db'
        }).promise()

        const noteToUpdate = Items.find((note) => note.id === id);

        if (!noteToUpdate) {
            return sendResponse(404, { success: false, message: "Note not found with the given id" });
        }

        await db.update({
            TableName: 'notes-db',
            Key:    { id: noteToUpdate.id},
            ReturnValues: 'ALL_NEW',
            UpdateExpression:'set note = :note',
            ExpressionAttributeValues:{
                ':note' :note
            }
        }).promise();

        
        return sendResponse(200, {message: "note updatet with: " + note })
    } catch(error){

        return sendResponse(500, {success: false, message: "could not updaate"})

    }
}