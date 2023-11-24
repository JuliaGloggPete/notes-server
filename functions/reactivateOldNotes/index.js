const {sendResponse} = require('../../responses/index')
const AWS = require('aws-sdk');
const { validateToken } = require('../middleware/auth');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core')




const reactivateOldNotes = async(event,context)=>{

    if(event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'invalid token'});
    const username = event.username

    const requestBody = JSON.parse(event.body);
    const {id} = requestBody


    //kolla om jag har id
    if(!id){
        return sendResponse(400, {success:false, message:"Invalid data - need id!"})
    }


    try{


        const {Items} = await db.scan({
            TableName: 'notes-db'
        }).promise()

        const noteToReactivate = Items.find((note) => note.id === id);

        if (!noteToReactivate) {
            return sendResponse(404, { success: false, message: "Note not found with the given id" });
        }

        if(noteToReactivate.isActive){
            return sendResponse(404, { success: false, message: "Note is already active" });
        }
        if (username != noteToReactivate.username){
            return sendResponse(404, { success: false, 
                message: "You can not recreate anothers note" });
  

        }
        const date = new Date().toISOString();

        const modifiedAt = `${date}`


        await db.update({
            TableName: 'notes-db',
            Key: { id: noteToReactivate.id },
            ReturnValues: 'ALL_NEW',
            UpdateExpression: "SET #isActive = :isActive, #modifiedAt = :modifiedAt",

            ExpressionAttributeValues: {
                ":isActive": true,
                ":modifiedAt": modifiedAt
            },
            ExpressionAttributeNames: {
                "#isActive": "isActive",
                "#modifiedAt": "modifiedAt"
            }
        }).promise();


        return sendResponse(200, {message: "The note is active again: " + noteToReactivate.title})
    } catch(error){

        return sendResponse(500, {success: false, message: "could not reactivte"})

    }
}



const handler = middy(reactivateOldNotes)
.use(validateToken)

module.exports = {handler};
