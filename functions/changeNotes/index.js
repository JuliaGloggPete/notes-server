const { sendResponse } = require('../../responses/index')
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const middy = require('@middy/core');
const { validateToken } = require('../middleware/auth');

const changeNotes = async (event, context) => {


    if (event?.error && event?.error === '401')
        return sendResponse(401, { success: false, message: 'invalid token' });



    const requestBody = JSON.parse(event.body);
    const { id, title, text } = requestBody

    //kolla om jag har id
    if (!id || (!title && !text)) {
        return sendResponse(400, {
            success: false,
            message: "Invalid data - need id and a modification fo either your text or the title "
        })
    }

    //felhantera kankse med om man skicka med fler fält

    // nedan funkar ej för tillfället... förstår inte varför

    const allowedInput = ['id', 'text', 'title']

    const extraFields = Object.keys(requestBody).filter(field => !allowedInput.includes(field));

    if (extraFields.length > 0) {
        return sendResponse(400, {
            success: false,
            message: `Invalid data - unexpected fields found: ${extraFields.join(', ')}`
        });
    }


    try {



        const { Items } = await db.scan({
            TableName: 'notes-db'
        }).promise()

        const noteToUpdate = Items.find((note) => note.id === id);

        if (!noteToUpdate) {
            return sendResponse(404, { success: false, message: "Note not found with the given id" });
        }
        if (event.username != noteToUpdate.username) {
            return sendResponse(404, {
                success: false,
                message: "You cannot change what others wrote, you can only change yourself(and your notes)"
            });


        }

        const date = new Date().toISOString();

        const modifiedAt = `${date}`


        await db.update({
            TableName: 'notes-db',
            Key: { id: noteToUpdate.id },
            ReturnValues: 'ALL_NEW',
            UpdateExpression: 'set #notetext = :text, #notetitle = :title, modifiedAt = :modifiedAt',
            ExpressionAttributeValues: {
                ':text': text,
                ':title': title,
                ':modifiedAt': modifiedAt,
            },
            ExpressionAttributeNames: {
                '#notetext': 'text',
                '#notetitle': 'title',
            }
        }).promise();


        return sendResponse(200, { message: "note updatet with: " + text })
    } catch (error) {

        return sendResponse(500, { success: false, message: "could not updaate" })

    }
}



const handler = middy(changeNotes)
    .use(validateToken)

module.exports = { handler };