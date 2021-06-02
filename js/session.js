function Session()
{
    var ICWS_CSRFTOKEN = '';
    var ICWS_SESSIONID = '';
    var ICWS_USERID = '';
    var ICWS_SERVER = '';

    var ICWS_station = "";
    var ICWS_username = "";
    var ICWS_password = "";
    var ICWS_application = "";

    var con = 0;

    var _sendRequest = function (server, method, request, payload, hasSession, timeout)
    {
        var deferred = $.Deferred();

        var uri = config.SCHEME + server;

        uri += config.PATH;

        if (hasSession)
        {
            uri += "/" + ICWS_SESSIONID + request;
        }
        else
        {
            uri += request;
        }

        if (typeof payload !== 'string' && !(payload instanceof String))
        {
            payload = JSON.stringify(payload);
        }

        console.warn("payload :: " + payload);
        
        $.ajax(uri, {
            method: method,
            data: payload,
            xhrFields: {
                withCredentials: true
            },
            headers: {
                "ININ-ICWS-CSRF-Token": ICWS_CSRFTOKEN,
                "Content-type": config.TYPE + ";" + config.CHARSET,
            },
            timeout: timeout,
            success: function (data, status, xhr) {
                if (data !== "" && data !== undefined) {
                       data = JSON.parse(data);
                }
                deferred.resolve(data, status, xhr);
            },
            error: function (data, status, xhr) {
                if (data !== "" && data !== undefined)
                {
                    try
                    {
                        data = JSON.parse(data);
                    }
                    catch(e)
                    {
                        //ignore
                    }
                }
                deferred.reject(data, status, xhr);
            },
        });        
        return deferred.promise();
    }

    Object.defineProperties(this, {
        sendRequest: {
            value: function(server, method, request, payload, resultCallback) {
                return _sendRequest(server, method, request, payload, resultCallback);
            }
        },
        user: {
            get: function() {
                return ICWS_USERID;
            },
            set: function(username) {
                ICWS_USERID = username;
            }
        },
        sessionId: {
            get: function () {
                return ICWS_SESSIONID;
            },
            set: function(sessionId) {
                ICWS_SESSIONID = sessionId;
            }
        },
        server: {
            get: function () {
                return ICWS_SERVER;
            },
            set: function(server) {
                ICWS_SERVER = server;
            }
        },
        token: {
            get: function () {
                return ICWS_CSRFTOKEN;
            },
            set: function(token) {
                ICWS_CSRFTOKEN = token;
            }
        },
        station: {
            get : function () {
                return ICWS_station;
            },
            set : function (station) {
                ICWS_station = station;
            }
        },
        username: {
            get : function () {
                return ICWS_username;
            },
            set : function (username) {
                ICWS_username = username;
            }
        },
        password: {
            get : function () {
                return ICWS_password;
            },
            set : function (password) {
                ICWS_password = password;
            }
        },
        application: {
            get : function () {
                return ICWS_application;
            },
            set : function (application) {
                ICWS_application = application;
            }
        }
    });
}