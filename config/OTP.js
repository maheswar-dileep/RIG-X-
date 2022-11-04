module.exports ={
    serviceId : 'VA22dc2df38547df485fc674655fa025d1',
    accountSID: 'ACc627e7161ea5ebc54a72e4b5ee80ead0',
    authToken : '0340e9d9b732dfb111bcccdc2d7a764e'
}


const express = require('express')
const client = require('twilio')("ACc627e7161ea5ebc54a72e4b5ee80ead0", "0340e9d9b732dfb111bcccdc2d7a764e", {
    lazyLoading: true
});


function sendTextMessage() {
    client.message.create({
        body: 'hello',
        to: '+918078179500',
        from: '+18316182069'
    }).then(message => console.log(message))
        .catch(err => console.log(err))

}