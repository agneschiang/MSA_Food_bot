var builder = require('botbuilder');
var food = require("./FavouriteFoods");
var restaurant = require("./RestaurantCard");
var nutrition = require('./NutritionCard');
var qna = require('./QnAMaker');
var cognitive = require('./CognitiveDialog');


exports.startDialog = function (bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/9f807c57-85d5-4cd1-af6a-0188add62d20?subscription-key=5d65b5a6c5b749548b818b417b32c9d6&verbose=true&timezoneOffset=0&q=');

    bot.recognizer(recognizer);

    bot.dialog('WantFood', function (session, args) {
        
                if (!isAttachment(session)) {
                    // Pulls out the food entity from the session if it exists
                    var foodEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'food');
        
                    // Checks if the for entity was found
                    if (foodEntity) {
                        session.send('Looking for restaurants which sell %s...', foodEntity.entity);
                        restaurant.displayRestaurantCards(foodEntity.entity, "auckland", session);
                    } else {
                        session.send("No food identified! Please try again");
                    }
               }
        
            }).triggerAction({
                matches: 'WantFood'
            });


    bot.dialog('DeleteFavourite', [function (session, args, next) {

            session.dialogData.args = args || {};
            if (!session.conversationData["username"]) {
                builder.Prompts.text(session, "Enter a username to setup your account.");
            } else {
                next(); // Skip if we already have this info.
            }
        },
        function (session, results,next) {
                if (!isAttachment(session)) {
                    if (results.response){
                        session.conversationData['username'] = results.response;
                    }

                    session.send("You want to delete one of your favourite foods.");

                    // Pulls out the food entity from the session if it exists
                    var foodEntity = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'food');

                    // Checks if the for entity was found
                    if (foodEntity) {
                        session.send('Deleting \'%s\'...', foodEntity.entity);
                        food.deleteFavouriteFood(session,session.conversationData['username'],foodEntity.entity); //<--- CALLL WE WANT
                    } else {
                        session.send("No food identified! Please try again");
                    }
                }

    }
        // Insert delete logic here later
    ]).triggerAction({
        matches: 'DeleteFavourite'

    });

    bot.dialog('GetCalories', function (session, args) {
        if (!isAttachment(session)) {

            // Pulls out the food entity from the session if it exists
            var foodEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'food');

            // Checks if the for entity was found
            if (foodEntity) {
                session.send('Calculating calories in %s...', foodEntity.entity);
                // Insert logic here later
                nutrition.displayNutritionCards(foodEntity.entity, session);
                

            } else {
                session.send("No food identified! Please try again");
            }
        }
    }).triggerAction({
        matches: 'GetCalories'
    });

    bot.dialog('GetFavouriteFood', [
        function (session, args, next) {
            session.dialogData.args = args || {};        
            if (!session.conversationData["username"]) {
                builder.Prompts.text(session, "Enter a username to setup your account.");                
            } else {
                next(); // Skip if we already have this info.
            }
        },
        function (session, results, next) {
            if (!isAttachment(session)) {
                if (results.response) {
                    session.conversationData["username"] = results.response;
                }

                session.send("Retrieving your favourite foods");
                food.displayFavouriteFood(session, session.conversationData["username"]);  // <---- THIS LINE HERE IS WHAT WE NEED 
            }
        }
    ]).triggerAction({
        matches: 'GetFavouriteFood'
    });

    bot.dialog('LookForFavourite', [
        function (session, args, next) {
            session.dialogData.args = args || {};        
            if (!session.conversationData["username"]) {
                builder.Prompts.text(session, "Enter a username to setup your account.");                
            } else {
                next(); // Skip if we already have this info.
            }
        },
        function (session, results, next) {
            
            if (!isAttachment(session)) {

                if (results.response) {
                    session.conversationData["username"] = results.response;
                }
                // Pulls out the food entity from the session if it exists
                var foodEntity = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'food');
    
                // Checks if the food entity was found
                if (foodEntity) {
                    session.send('Thanks for telling me that \'%s\' is your favourite food', foodEntity.entity);
                    food.sendFavouriteFood(session, session.conversationData["username"], foodEntity.entity); // <-- LINE WE WANT
    
                } else {
                    session.send("No food identified!!!");
                }
            }
        }
        
    ]).triggerAction({
        matches: 'LookForFavourite'
    });
    

    bot.dialog('WelcomeIntent', function (session, args){
        // Insert logic here later
        if(!isAttachment(session)){
            
                        //Pull out the food entity from the session if it exists
                        var foodEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'food');
            
                        // Checks if the for entity was foud
                        session.send("Hi, how can I help you")
                    }
    }).triggerAction({
        matches: 'WelcomeIntent'
    });

    bot.dialog('QnA', [function (session, args, next) {
            session.dialogData.args = args || {};
            builder.Prompts.text(session, "What is your question?");
        },
        function (session, results, next) {
            qna.talkToQnA(session, results.response);
        }
    ]).triggerAction({
        matches: 'QnA'
    });


// Function is called when the user inputs an attachment
function isAttachment(session) { 
    var msg = session.message.text;
    if ((session.message.attachments && session.message.attachments.length > 0) || msg.includes("http")) {
        cognitive.retreiveMessage(session);
        //call custom vision here later
        return true;
    }
    else {
        return false;
    }
}

}