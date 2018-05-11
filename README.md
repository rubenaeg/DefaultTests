# Test Suite

## Basic Concept

The TestSuite is heavily based on mocha tests and the expect() method from the Chai Assertion Library. (for those not familiar with mocha tests -> link). 
```javascript
describe('LaunchIntent', function () {
    for (let requestBuilder of [alexaRequestBuilder, googleActionRequestBuilder]) {
        it('should go successfully into LaunchIntent for ' + requestBuilder.type(), function (done) {
            send(requestBuilder.launch())
                .then((res) => {
                    expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
                    done();
                });
        });
    }
});
```

## send

The main component of the TestSuite is the function ```send()```. With it, the user is able to send specific requests to the running Jovo App. To build these requests, we offer you RequestBuilders for both Alexa and GoogleAction.

```javascript
for (let req of [alexaRequestBuilder, googleActionRequestBuilder]) {
    it('should go successfully into LaunchIntent for ' + req.type(), function (done) {
        send(req.launch())
            .then((res) => {
                expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
                done();
            });
    });
}
```
 If you want to test requests for both platforms Alexa and GoogleAction, you can define a ```for-of``` loop to test both of them. Alternatively, if you want to test only one platform or have some platform-specific intents, you have the option to define only one RequestBuilder in the array or to work without a loop and only take your intended RequestBuilder into play.

```javascript
send(alexaRequestBuilder.launch())
    .then((res) => {
        expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
        done();
    });
```

```send()``` returns a Promise, which means that you can nest multiple requests for a whole simulated conversation flow according to the Promise concept.

```javascript
send(requestBuilder.launch())                                                      // send launch request
    .then(() => send(requestBuilder.intent('MyNameIsIntent', {name: 'John'})))     // send intent request 
    .then((res) => {
        expect(res.isTell('Hey John, nice to meet you!')).to.equal(true);
        done();
    });
```

Apart from using the RequestBuilder for defining request intents, you can also build your own JSON request object and pass it to ```send()```. Be careful with this though, as an invalid request object will fail. Alternatively, you can pass the object as an argument to ```requestBuilder.intent(object)``` to access the requestbuilder functions on your own object. Keep in mind, that you cannot pass a AlexaRequest into the GoogleActionRequestBuilder and vice versa.
```javascript
let requestObj = {
    'version': '1.0',
    'session': {
        ...
    },
    ...
};
send(requestBuilder.intent(requestObj));
```

## RequestBuilder
The RequestBuilder can be used to build intentRequests easily with respective functions.

### Launch
This sends a basic LaunchRequest to your voice app, hence simulates the start of your voice application.
```javascript
send(requestBuilder.launch());
```

### Intent
```javascript
send(requestBuilder.intent());
```
This sends a default intentRequest with the intentName 'HelpIntent'. You can specify the intentName by passing it into ```intent('')``` as the first parameter or by calling ```intent().setIntentName('')```. Slots/Parameters can be added as well by passing them as an object as the second parameter in ```intent('', {name: 'John'})``` or by using the method ```intent().addInput('', '')```.

#### Session Attributes
Although session attributes are applied automatically, you may want to go straight to a specific intent without calling the whole conversation flow before. For this situation, you can call ```requestBuilder.intent().setSessionAttribute('', '')``` to specify session attributes. As a shortcut for only setting a specific state, you have the option to use ```setState('')```. If you want to add multiple session attributes at once, use ```setSessionAttributes(object)```.

#### setSessionNew
To simulate a new session, you can call ```requestBuilder.intent().setSessionNew(true)```.

#### setType
To alter the type of a request, use ```requestBuilder.intent().setType('type');``` This only works for Alexa.

### AudioPlayer Directives
To send AudioPlayer Directives to your voice app, you can build the request object with ```requestBuilder.audio()```. You can specify the directive by passing it as the parameter (```requestBuilder.audio('PlaybackStopped')```) or by calling ```setType('directiveType');```.

## UserData
For accessing data across sessions, you can add user data to your user.
```javascript
addUserData(requestBuilder.intent().getUserId(), 'key', 'value');
```
This method expects a userId as the first parameter, to identify the user. For the default id, that comes with the default intent ```requestBuilder.intent()```, you can simply call ```requestBuilder.intent().getUserId()``` or pass it as a string. If you built your own intent request, you can pass it to ```requestBuilder.intent()``` like shown above and call ```getUserId()```:

```javascript
let requestObj = {
    'version': '1.0',
    'session': {
        ...
    },
    ...
}
let intentRequest = requestBuilder.intent(requestObj);
addUserData(intentRequest.getUserId(), 'key', 'value');
send(intentRequest.setIntentName(''))
    .then(() => {
        ...
    });
``` 
To set the userId, call ```requestBuilder.intent().setUserId('userId');```.

If you want to add user data between two requests, you can nest ```addUserData()``` with ```send()```.

```javascript
 send(req.launch())
    .then(() => {
        addUserData(req.intent().getUserId(), 'key', 'value');              // get the default user id
        return send(req.intent('CheckForUserDataIntent'));
    })
    .then((res) => {
        expect(res.isTell('value')).to.equal(true);
        done();
    })
```

You can also add a new user by passing a user object to ```addUser(user)```.

If you want to check if some data is stored for a specific user, use ```getUserData('userId', 'key')``` or ```getUserData('userId')``` to get all data for the specified user.

It is recommended to delete the user or remove specific user data after your test. This way you can assure, that the next test runs independently.
If you want to remove specific user data, call ```removeUserData('userId', 'key')``` or just ```removeUserData('userId')``` to remove all data for the specified user. If you want to remove a whole user, you can use ```removeUser('userId')```, or ```removeUser()``` to remove all users.

```javascript

```

## Response
If you want to access the final response object from your workflow, ```send()``` returns a variable ```res```, presenting a ResponseObject with respective functions. You can call these and expect a certain value from them, using expect from the Chai Assertion Library per default. Of course, you are free to use any other assertion methods. 
```javascript
send(req.launch())
    .then((res) => {
        expect(res.isTell('value')).to.equal(true);
        done();
    });
```
### isTell
This method checks, if the response is a tell and compares the given parameter with the actual value, returning true if this is the case.

```javascript
expect(res.isTell('Hello World')).to.equal(true);
```  
If you have dynamic values in your code (e.g. ```this.tell(['Hello World', 'Hey World']);```), you can check for these values by passing the same array in ```isTell()```.
```javascript
expect(res.isTell(['Hello World', 'Hey World'])).to.equal(true);
```
### isAsk
```isAsk()``` functions in the same way as ```isTell()```, except with 2 parameters instead of just one (for reprompt).
```javascript
expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
```  
This works with dynamic values as well.

### hasSessionAttribute
Check if a specific session attribute has been delivered with the response.
```javascript
expect(res.hasSessionAttribute('key', 'value')).to.equal(true);
````
Alternatively, if you just want to check if the response includes any session attributes, use ```res.hasSessionAttributes()```.

Again, a shortcut to check if your response contains a specific state would be ```res.hasState('state')```.

### getShouldEndSession
Checks if the session should end.
```javascript
expect(res.getShouldEndSession()).to.equal(true);
```


<!--[metadata]: {"title": "App Logic", 
                "description": "Find out how to build voice app logic with the Jovo Framework",
                "activeSections": ["logic", "logic_index"],
                "expandedSections": "logic",
                "inSections": "logic",
                "breadCrumbs": {"Docs": "framework/docs",
				"App Logic": ""
                                },
		"commentsID": "framework/docs/app-logic"
                }-->
