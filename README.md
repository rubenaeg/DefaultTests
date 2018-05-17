# Test Suite

## Basic Concept

The TestSuite is heavily based on mocha tests and the expect() method from the Chai Assertion Library.
```javascript
for (let rb of getPlatformRequestBuilder('AlexaSkill', 'GoogleActionDialogFlow')) {
    describe(rb.type(), function() {
        describe('LAUNCH_INTENT', function () {
            it('should successfully go into LaunchIntent for ' + rb.type(), function (done) {
                send(rb.launch())
                    .then((res) => {
                        expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
                        done();
                    });
            });
        });
    });
}
```
Since Jovo allows to build voice apps for both Alexa and Google Assistant, you have the possibility to nest your tests in a loop and iterate through the respective platform you built your application for. To do this you can pass the name as an argument to getPlatformRequestBuilder, which will return you an array of RequestBuilders, that offer you certain methods to simulate requests. To access the type of platform the current RequestBuilder can be used for, use ```rb.type()```.

## send

The main component of the TestSuite is the function ```send()```. With it, the user is able to send specific requests to the running Jovo App.

```javascript
it('should successfully go into LaunchIntent for ' + rb.type(), function (done) {
    send(rb.launch())
        .then((res) => {
            expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
            done();
        });
});
```

```send()``` returns a Promise, which means that you can nest multiple requests for a whole simulated conversation flow according to the Promise concept.

```javascript
send(rb.launch())                                                               // send launch request
    .then((res) => {
        expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
        return send(rb.intent('MyNameIsIntent', {name: 'John'}))                // send intent request with slot name=John
    })
    .then((res) => {
        expect(res.isTell('Hey John, nice to meet you!')).to.equal(true);
        done();
    });
```

Apart from using the RequestBuilder for defining request intents, you can also build your own JSON request object and pass it to ```send()```. Be careful with this though, as an invalid request object will fail. Alternatively, you can pass the object as an argument to ```requestBuilder.intent(object)``` to access the requestbuilder functions on your own object. Keep in mind, that you cannot pass an AlexaRequest into the GoogleActionRequestBuilder and vice versa. Passing your own object as the parameter works for every request option that the RequestBuilder offers.
```javascript
let requestObj = {
    'version': '1.0',
    'session': {
        ...
    },
    ...
};
send(rb.intent(requestObj));
```

## RequestBuilder
The RequestBuilder can be used to build intentRequests easily with respective functions.

### Launch
This sends a basic LaunchRequest to your voice app, hence simulates the start of your voice application.
```javascript
send(rb.launch());
```

### Intent
```javascript
send(rb.intent());
```
This sends a default intentRequest with the intentName 'HelpIntent'. You can specify the intentName by passing it into ```intent('intentName')``` as the first parameter or by calling ```intent().setIntentName('intentName')```. Slots/Parameters can be added as well by passing them as an object as the second parameter in ```intent('intentName', {key: 'value'})``` or by using the method ```intent().addInput('key', 'value')```.

#### Session Attributes
Although session attributes are applied automatically, you may want to go straight to a specific intent without calling the whole conversation flow before. For this situation, you can call ```rb.intent().setSessionAttribute('key', 'value')``` to specify session attributes. As a shortcut for only setting a specific state, you have the option to use ```setState('stateName')```. If you want to add multiple session attributes at once, you can pass them as an object:
```javascript
let sessionAttributes = {
    'STATE': 'TestState',
    'key': 'value',
};
send(rb.intent().setSessionAttributes(sessionAttributes)
    .then((res) => {
        ...
    });
```

#### setSessionNew
To simulate a new session, you can call ```rb.intent().setSessionNew(true)```. Per default, ```requestBuilder.intent()``` won't represent a new session.

#### setType
To alter the type of a request, use ```rb.intent().setType('type')```. This only works for Alexa.

### Alexa Specifics
#### AudioPlayer Directives
To send AudioPlayer Directives to your voice app, you can build the request object with ```rb.audio()```. You can specify the directive by passing it as the parameter ```rb.audio('PlaybackStopped')``` or by calling ```setType('AudioPlayer.PlaybackStopped')```.

#### Error
To simulate an error sent to your application, you can call ```rb.error()```.

#### SkillEvent
If your skill is for instance disabled, a SkillEventRequest is sent to let your app know about it. To simulate that, use ```rb.skillEvent()```. To alter the type of the skillEvent, pass it as a parameter or call ```setType('AlexaSKillEvent.SkillDisabled')``` like shown above for AudioPlayer Directives.

#### DisplayRequest
To simulate a display event, that occurres when for example a user touches the display of an Echo Show. Simply call ```rb.touch()```. To alter the type of the skillEvent, pass it as a parameter or call ```setType('Display.ElementSelected)``` like shown above for AudioPlayer Directives.


## UserData
For accessing data across sessions, you can add user data to your user.
```javascript
addUserData(rb.intent().getUserId(), 'key', 'value');
```
This method expects a userId as the first parameter, to identify the user. For the default id, that comes with the default intent ```rb.intent()```, you can simply call ```rb.intent().getUserId()``` or pass it as a string. If you built your own intent request, you can pass it to ```rb.intent()``` like shown above and call ```getUserId()```:

```javascript
let requestObj = {
    'version': '1.0',
    'session': {
        ...
    },
    ...
}
let intentRequest = rb.intent(requestObj);
addUserData(intentRequest.getUserId(), 'key', 'value');
send(intentRequest)
    .then((res) => {
        ...
    });
``` 
To set the userId, call ```rb.intent().setUserId('userId');```.

If you want to add user data between two requests, you can nest ```addUserData()``` with ```send()```.

```javascript
 send(rb.launch())
    .then(() => {
        addUserData(rb.intent().getUserId(), 'key', 'value');              // get the default user id
        return send(rb.intent('CheckForUserDataIntent'));                  // return the send promise
    })
    .then((res) => {
        expect(res.isTell('value')).to.equal(true);
        done();
    })
```

You can also add a new user by passing a user object to ```addUser(userObject)```.

If you want to check if some data is stored for a specific user, use ```getUserData('userId', 'key')``` to receive the value or ```getUserData('userId')``` to get all data for the specified user.

It is recommended to delete the user or remove specific user data after your test. This way you can assure, that the next test runs independently.
If you want to remove specific user data, call ```removeUserData('userId', 'key')``` or just ```removeUserData('userId')``` to remove all data for the specified user. If you want to remove a whole user, you can use ```removeUser('userId')```, or ```removeUser()``` to delete all users.

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

## Record
We offer you the possibility to record your requests and responses while testing your app in the console or per voice. For that, add the following parameter to your cli command:
jovo run --record {name of the recording} or -r to use the session id as the name.
To access these files, you can use the ```require()``` function:
```javascript
send(require('./recordings/Hello/AlexaSkill/01_req_LAUNCH'))
	.then((res) => {
    	...
    });
```
