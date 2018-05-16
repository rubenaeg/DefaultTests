'use strict';

const {app} = require('../app/app');
const expect = require('chai').expect;
const getPlatformRequestBuilder = require('jovo-framework').util.getPlatformRequestBuilder;
const {send, addUserData, getUserData, removeUser, removeUserData} = require('jovo-framework').TestSuite;
setDbPath(app.config.db.localDbFilename);

describe('LAUNCH_INTENT', function() {
    for(let requestBuilder of getPlatformRequestBuilder('GoogleActionDialogFlow', 'AlexaSkill')) {
        it('should successfully go into LaunchIntent for ' + requestBuilder.type(), function (done) {
            send(requestBuilder.launch())
                .then((res) => {
                    expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
                    done();
                });
        });
    }
});

describe('HELLO_WORLD_INTENT', function() {
    for(let requestBuilder of getPlatformRequestBuilder('GoogleActionDialogFlow', 'AlexaSkill')) {
        it('should successfully go into HelloWorldIntent for ' + requestBuilder.type(), function(done) {
            send(requestBuilder.intent('HelloWorldIntent'))
                .then((res) => {
                    expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
                    done();
                })
        });
    }
});

describe('MY_NAME_IS_INTENT', function() {
    for(let requestBuilder of getPlatformRequestBuilder('GoogleActionDialogFlow', 'AlexaSkill')) {
        it('should simulate the whole conversation flow and greet the user with the correct name for ' + requestBuilder.type(), function(done) {
            send(requestBuilder.launch())
                .then(() => send(requestBuilder.intent('MyNameIsIntent', {name: 'John'})))
                .then((res) => {
                    expect(res.isTell('Hey John, nice to meet you!')).to.equal(true);
                    done();
                });
        });

        it('should simulate deep invocation and directly go into MyNameIsIntent for ' + requestBuilder.type(), function(done) {
            send(requestBuilder.intent().setIntentName('MyNameIsIntent').addInput('name', 'John'))
                .then((res) => {
                    expect(res.isTell('Hey John, nice to meet you!')).to.equal(true);
                    done();
                });
        });
    }
});

describe('HELP_INTENT', function() {
    for(let requestBuilder of getPlatformRequestBuilder('GoogleActionDialogFlow', 'AlexaSkill')) {
        it('should not throw an error, unless HelpIntent doesn\'t exist for ' + requestBuilder.type(), function(done) {
            send(requestBuilder.intent('HelpIntent'))
                .then((res) => {
                    // expect HelpIntent
                    done();
                });
        });
    }
});

describe('UNHANDLED', function() {
    for(let requestBuilder of getPlatformRequestBuilder('GoogleActionDialogFlow', 'AlexaSkill')) {
        it('should not throw an error, unless Unhandled is not defined for ' + requestBuilder.type(), function(done) {
            send(requestBuilder.intent('Unhandled'))
                .then((res) => {
                    // expect HelpIntent
                    done();
                });
        });
    }
});

