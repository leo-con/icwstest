/**********************************************************************************************************
FECHA CREACIÓN: 08-09-2020
AUTOR: CARLOS BRITO
VERSIÓN: 1.0.0
***********************************************************************************************************/
var Subscriptions = function () {
    var icwsMessageCallbacks = [];
    var eventSource;
    var messageProcessingTimerId;

    var _startUserStatusSubscription = function (usersList) {
        var deferred = $.Deferred();

        payload = {
             userIds: usersList
        };

        _registerMessageCallback('urn:inin.com:status:userStatusMessage', '/messaging/subscriptions/status/user-statuses', events.userStatusChanged);

        session.sendRequest(session.server, 'PUT', '/messaging/subscriptions/status/user-statuses', payload, true, 6000).done(function (data, status, xhr) {
            deferred.resolve();
        }).fail(function (data, status, xhr) {
            console.error("Error requesting the users's status. Error: ", data.statusText, data.responseText);
            deferred.reject();
        });

        return deferred.promise();
    }

    var _getAvailableStatusMessages = function(usersList) {
        var deferred = $.Deferred();

        payload = {
            userIds: usersList
        };

        _registerMessageCallback('urn:inin.com:status:statusMessagesUserAccessMessage', '/messaging/subscriptions/status/status-messages-user-access', events.availableStatusMessagesChanged);

        session.sendRequest(session.server, 'PUT', '/messaging/subscriptions/status/status-messages-user-access', payload, true, 6000).done(function (data, status, xhr) {
            deferred.resolve();
        }).fail(function (data, status, xhr) {
            console.error("Error requesting available status messages for user. Error: ", data.statusText, data.responseText);
            deferred.reject();
        });

        return deferred.promise();
    }

    var _startMessageProcessing = function ()
    {
        if (typeof EventSource !== 'undefined')
        {
            if (!eventSource || eventSource.readyState === EventSource.CLOSED)
            {
                var messagingUrl = 'https://' + session.server + '/icws/' + session.sessionId + '/messaging/messages';
                eventSource = new EventSource(messagingUrl, { withCredentials: true });
                eventSource.onmessage = _onServerSentMessage;
            }
        }
        else
        {
            function runTimerInstance()
            {
                messageProcessingTimerCallback();
                messageProcessingTimerId = setTimeout(runTimerInstance, 1000);
            }

            if (!messageProcessingTimerId)
            {
                runTimerInstance();
            }
        }
    }

    var messageProcessingTimerCallback = function() {
        var payload, messageIndex, messageCount, jsonMessage, messageType, messageCallback;

        // The messaging GET request does not take any payload values.
        payload = {};

        session.sendRequest(session.server, 'GET', '/messaging/messages', '', true, 6000).done(function (data, status, xhr) {
            //console.log(data, status, xhr);
            if ((xhr.status >= 200) && (xhr.status <= 299)) {
                // Process retrieved messages.
                messageCount = data.length;
                for (messageIndex = 0; messageIndex < messageCount; messageIndex++) {
                    jsonMessage = data[messageIndex];
                    messageType = jsonMessage.__type;

                    // For each message, invoke a registered message callback if there is one.
                    icwsMessageCallbacks.forEach(function (callback) {
                        if (messageType === callback.type) {
                            callback.callback(jsonMessage);
                        }
                    });
                }
            }
        }).fail(function(data, status, xhr) {
            console.error("Short polling message processing failed. Error: ", data.statusText, data.responseText)
        });
    }

    var _stopMessageProcessing = function () {
        var deferred = $.Deferred();

        if (eventSource) {
            icwsMessageCallbacks.forEach(function(callback) {
                var payload = {};
                if (callback.request !== '') {
                    session.sendRequest(config.SERVER, 'DELETE', callback.request, payload, true, 6000).done(function() {
                        var newIcwsMessageCallbacks = icwsMessageCallbacks.filter(function(cb) { return cb.type != callback.type });
                        icwsMessageCallbacks = newIcwsMessageCallbacks;
                        if (icwsMessageCallbacks.length === 0) {
                            deferred.resolve();
                        }
                    });
                } else {
                    var newIcwsMessageCallbacks = icwsMessageCallbacks.filter(function(cb) { return cb.type != callback.type });
                    icwsMessageCallbacks = newIcwsMessageCallbacks;
                    if (icwsMessageCallbacks.length === 0) {
                        deferred.resolve();
                    }
                }
            });
        } else if (!!messageProcessingTimerId) {
            clearTimeout(messageProcessingTimerId);
            messageProcessingTimerId = null;
            deferred.resolve();
        }

        return deferred.promise();
    }

    var _onServerSentMessage = function(event) {
        var message, messageType, messageCallback;
        try {
            message = JSON.parse(event.data);
            messageType = message.__type;

            icwsMessageCallbacks.forEach(function(callback) {
                if (messageType === callback.type) {
                    callback.callback(message);
                }
            });
        } catch (error) {
            console.error("Failed to process server sent message. Error: ", error);
        }
    }

    var _registerMessageCallback = function (messageType, messageRequest, messageCallback) {
        var alreadyRegistered = false;
        icwsMessageCallbacks.forEach(function(callback) {
            if (callback.type === messageType) {
                alreadyRegistered = true;
            }
        });

        if (!alreadyRegistered) {
            var callback = { type: messageType, request: messageRequest, callback: messageCallback };
            icwsMessageCallbacks.push(callback);
        }
    }

    Object.defineProperties(this, {
        startMessageProcessing: {
            value: function () {
                return _startMessageProcessing();
            }
        },
        stopMessageProcessing: {
            value: function() {
                return _stopMessageProcessing();
            }
        },
        startUserStatusSubscription: {
            value: function(usersList) {
                return _startUserStatusSubscription(usersList);
            }
        },
        getAvailableStatusMessages: {
            value: function(usersList) {
                return _getAvailableStatusMessages(usersList);
            }
        },
        registerMessageCallback: {
            value: function (messageType, messageRequest, messageCallback) {
                return _registerMessageCallback(messageType, messageRequest, messageCallback);
            }
        }
    });
}