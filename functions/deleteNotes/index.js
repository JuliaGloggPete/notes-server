const {sendResponse} = require('../../responses/index')
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();



exports.handler = async(event,context)=>{



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

        const noteToDelete = Items.find((note) => note.id === id);

        if (!noteToDelete) {
            return sendResponse(404, { success: false, message: "Note not found with the given id" });
        }



       


        await db.delete({
            TableName: 'notes-db',
            Key:    { id: noteToDelete.id}
        }).promise();

        
        return sendResponse(200, {message: "note deleted id: " + noteToDelete.id })
    } catch(error){

        return sendResponse(500, {success: false, message: "could not delete"})

    }
}