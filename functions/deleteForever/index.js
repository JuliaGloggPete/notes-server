const {sendResponse} = require('../../responses/index')
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');


const deleteForEver = async(event,context)=>{
   
    if(event?.error && event?.error === '401')
    return sendResponse(401, {success: false, message: 'invalid token'});




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

        const noteToDeleteForGood = Items.find((note) => note.id === id);

        if (!noteToDeleteForGood) {
            return sendResponse(404, { success: false, message: "Note not found with the given id" });
        }

        if(noteToDeleteForGood.isActive){
            return sendResponse(404, { success: false, message: "Where did you get this id the note is not in the dustbin " });
        }

        if (event.username != noteToDeleteForGood.username){
            return sendResponse(404, { success: false, 
                message: "You can not kill what you did\'nt create" });
  

        }
      

       


        await db.delete({
            TableName: 'notes-db',
            Key:    { id: noteToDeleteForGood.id}
        }).promise();


        return sendResponse(200, {message: "The note is deleted: " + noteToDeleteForGood.text })
    } catch(error){

        return sendResponse(500, {success: false, message: "could not delete"})

    }
}


const handler = middy(deleteForEver)
.use(validateToken)

module.exports = {handler};