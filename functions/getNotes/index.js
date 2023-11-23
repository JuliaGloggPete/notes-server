const {sendResponse} = require('../../responses/index')


var notes =[
{
    id: 1,
    note: "Iam awesome, I can do this"
},
{
    id: 2,
    note: "lets say 2 days"
},
{
    id: 3,
    note: "maybe 3"
},

];

exports.handler = async(event,context)=>{



return sendResponse(200, {notes})


}

