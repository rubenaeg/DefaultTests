'use strict';

const expect = require('chai').expect;
const getPlatformRequestBuilder = require('jovo-framework').util.getPlatformRequestBuilder;
const {send} = require('jovo-framework').TestSuite;

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

        describe('HELLO_WORLD_INTENT', function () {
            it('should successfully go into HelloWorldIntent for ' + rb.type(), function (done) {
                send(rb.intent('HelloWorldIntent'))
                    .then((res) => {
                        expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
                        done();
                    })
            });
        });

        describe('MY_NAME_IS_INTENT', function () {
            it('should simulate the whole conversation flow and greet the user with the correct name for ' + rb.type(), function (done) {
                send(rb.launch())
                    .then((res) => {
                        expect(res.isAsk('Hello World! What\'s your name?', 'Please tell me your name.')).to.equal(true);
                        return send(rb.intent('MyNameIsIntent', {name: 'John'}))
                    })
                    .then((res) => {
                        expect(res.isTell('Hey John, nice to meet you!')).to.equal(true);
                        done();
                    });
            });

            it('should simulate deep invocation and directly go into MyNameIsIntent for ' + rb.type(), function (done) {
                send(rb.intent().setIntentName('MyNameIsIntent').addInput('name', 'John'))
                    .then((res) => {
                        expect(res.isTell('Hey John, nice to meet you!')).to.equal(true);
                        done();
                    });
            });
        });

        describe('HELP_INTENT', function () {
            it('should not throw an error, unless HelpIntent doesn\'t exist for ' + rb.type(), function (done) {
                send(rb.intent('HelpIntent'))
                    .then((res) => {
                        // expect HelpIntent
                        done();
                    });
            });
        });

        describe('UNHANDLED', function () {
            it('should not throw an error, unless Unhandled is not defined for ' + rb.type(), function (done) {
                send(rb.intent('ShouldNotExistIntent'))
                    .then((res) => {
                        // expect Unhandled
                        done();
                    });
            });
        });
    });
}
