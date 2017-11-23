var request = require('request'); //node module for http post requests

exports.retreiveMessage = function (session){

    request.post({
        url: 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/20d133f8-e522-4854-ae7e-47afb8d6baa7/url?iterationId=4c7952fa-34f5-4bc1-b6a8-5711c04e4163',
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Prediction-Key': '0c1fe7a71c62415684f9bd5d37d7541a'
        },
        body: { 'Url': session.message.text }
    }, function(error, response, body){
        console.log(validResponse(body));
        session.send(validResponse(body));
    });
}

function validResponse(body){
    if (body && body.Predictions && body.Predictions[0].Tag){
        return "This is " + body.Predictions[0].Tag
    } else{
        console.log('Oops, please try again!');
    }
}