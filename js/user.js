/**********************************************************************************************************
FECHA CREACIÓN: 08-09-2020
AUTOR: CARLOS ALEXIS BRITO 
DESCRIPCIÓN:    ESTE ARCHIVO jS CUMPLIRA CON EL OBJETICO DE mostrar las vistas de cada accion realizada del agente
VERSIÓN: 1.0.0
**********************************************************************************************************/

var User = function () 
{
    var _hasLogonCampaignRight;
    var _currentStatus;
    var _breakStatus;
    var _availableCampaigns = [];
    var _activeCampaigns = [];
    var _currentCallId;
    var _readyForCallsSent = false;
    var nom="";
    var nombreUsu="";
    var campaniaActiva="";
    var con = 0;
    var camp = [];
    var server = '';
    var banderaSesion = 0;
    var loc = document.location.href;
    var contador_login = 0;

    function _validarform(usr,psw,stn)
    {
        var badera = false;

        if(usr != "")
        {
            if(psw != "")
            {
                if(stn != "")
                {
                    badera = true;
                }
            }  
        }

        return badera;
    }

    var _initialLogin = function()
    {
        console.log($("#login-station").val());
        //session.server = config.SERVER;
        session.station = $("#login-station").val();
        session.username = $("#login-user").val();
        session.password = $("#login-password").val();
        session.application = document.title;
          
        if(!_validarform(session.username,session.password,session.station)) 
        {
            display.showErrorModal("Por favor, especifique su Username, Password y estación.");
            return;
        }                  

        display.showLoadingModal();        

        _icLogin(session.username, session.password , session.server, document.title).done(function (data, status, xhr)
        {
            // Inicie las suscripciones para el estado del usuario y los mensajes de estado disponibles.
            subscriptions.startUserStatusSubscription([session.user]).done(function ()
            {
                subscriptions.getAvailableStatusMessages([session.user]).done(function ()
                {
                    // Determine si el usuario tiene la campaña de inicio de sesión correcta.
                    session.sendRequest(session.server, 'GET', '/configuration/users/' + session.user + '?select=*&rightsFilter=loggedInUser', undefined, true, 6000).done(function (data, status, xhr)
                    {
                        //nombreUsu = data.configurationId.displayName;username
                        nombreUsu = session.username;
                        $('#userName').text(nombreUsu);
                        _hasLogonCampaignRight = data.securityRights.loginCampaign.effectiveValue;
                        
                        // mira los mensajes de eventos del marcador.
                        subscriptions.registerMessageCallback('urn:inin.com:dialer:availableCampaignsMessage', '', events.availableCampaignsMessage);
                        subscriptions.registerMessageCallback('urn:inin.com:dialer:breakStatusMessage', '', events.breakMessage);
                        subscriptions.registerMessageCallback('urn:inin.com:dialer:dataPopMessage', '', events.dataPopMessage);

                        // Inicie sesión en el marcador. Si tiene éxito, muestre la página de campañas.
                        _dialerLogin().done(function ()
                        {
                            config.userCode = nombreUsu;
                            user.changeStatus('Do Not disturb');
                            
                            display.page("campania");
                            setTimeout(function()
                            {
                                display.hideLoadingModal();
                            }, 1000);
                           
                        }).fail(function (data, status, xhr)
                        {
                            display.hideLoadingModal();
                            display.showErrorModal("Error al iniciar sesión. Consulte el registro de la consola para obtener más información.");
                        });
                    }).fail(function (data, status, xhr)
                    {
                        display.hideLoadingModal();
                        display.showErrorModal("Error al iniciar sesión. Consulte el registro de la consola para obtener más información.");
                    });
                }).fail(function (data, status, xhr)
                {
                    display.hideLoadingModal();
                    display.showErrorModal("Error al iniciar sesión. Consulte el registro de la consola para obtener más información.");
                });
            }).fail(function (data, status, xhr)
            {
                display.hideLoadingModal();
                display.showErrorModal("Error al iniciar sesión. Consulte el registro de la consola para obtener más información.");
            });
        }).fail(function (data, status, xhr)
        {
            display.hideLoadingModal();
            display.showErrorModal("Error al iniciar sesión. No se pudo establecer conexión, Consulte el registro de la consola para obtener más información.");           
        });
    }

    var _enter = function (e)
    {
        if (e.keyCode === 13 && !e.shiftKey)
        {
            e.preventDefault();
            document.getElementById("login-submit").click();
        }
    }

    var _icLogin = function(username, password, server, application)
    {
        var deferred = $.Deferred();

        var payload = {
            __type: 'urn:inin.com:connection:icAuthConnectionRequestSettings',
            applicationName: application,
            userID: username,
            password: password
        };

        console.log("Estacion :: 'POST', '/connection' :: ", payload);

        session.sendRequest(server, 'POST', '/connection', payload, false, 6000).done(function (data, status, xhr)
        {
            session.token = data.csrfToken;
            session.sessionId = data.sessionId;
            session.user = data.userID;
            session.server = server;

            for (var i = 0; i < data.alternateHostList.length; i++)
            {
                config.alternateHostList.push(data.alternateHostList[i]);                 
            }

            console.log("USER :: _icLogin :: config.alternateHostList :: ", config.alternateHostList);

            // Comienza a escuchar los mensajes enviados por el servidor
            subscriptions.startMessageProcessing();

            var payload = {
                __type: 'urn:inin.com:connection:workstationSettings',
                supportedMediaTypes: [1],
                readyForInteractions: true,
                workstation: session.station
            }

            console.log("Estacion :: /connection/station :: ", payload, session.server);

            session.sendRequest(session.server, 'PUT', '/connection/station', payload, true, 6000).done(function()
            {
                deferred.resolve();

            }).fail(function(data, status, xhr)
            {
                display.hideLoadingModal();
                display.showErrorModal("Error al iniciar sesión en la estación de trabajo. Consulte el registro de la consola para obtener más información. " + data.responseText);
                console.error("Error al establecer la conexión de la estación. ", data.statusText, data.responseText);
                deferred.reject();
            });

        }).fail(function (data, status, xhr)
        {
           /*if(data.status == 0 || data.status == 503)
           {*/
                if(contador_login <= config.alternateHostList.length - 1)
                {
                    console.log("_icLogin :: alternateHostList :: contador_login", contador_login , config.alternateHostList.length - 1);
                    console.log("_icLogin :: alternateHostList :: config.alternateHostList[contador_login]", config.alternateHostList[contador_login]);
                    session.server = config.alternateHostList[contador_login] + config.PORT;
                    contador_login++;
                    _initialLogin();                    
                }
                else
                {
                    console.error("Error al establecer la conexión en los host alternativos. ", status, data);
                    deferred.reject();
                }
            /*}
            else
            {
                console.error("Error al establecer la conexión. ", status, data);
                deferred.reject();
            }*/
        });

        return deferred.promise();
    }

    var _over = function()
    {
        var deferred = $.Deferred();

        var server = config.SERVER;

        var payload = "";

        console.log("switchover-status :: 'GET', '/connection/switchover-status' :: ", payload);

        session.sendRequest(server, 'GET', '/connection/switchover-status', payload, true, 6000).done(function (data, status, xhr)
        {
           console.log("switchover-status :: data :: ", data);
           console.log("switchover-status :: status :: ", status);
           console.log("switchover-status :: xhr :: ", xhr);

        }).fail(function (data, status, xhr)
        {           
            console.error("Error al establecer la conexión con el switchover-status. ", status, data);
            deferred.reject();            
        });

        return deferred.promise();
    }

    var _reconnecting = function()
    {
        var deferred = $.Deferred();

        var server = config.SERVER;

        var payload = "";

        console.log("switchover-status :: 'GET', '/connection/switchover-status' :: ", payload);

        session.sendRequest(server, 'GET', '/connection/switchover-status', payload, true, 6000).done(function (data, status, xhr)
        {
           console.log("switchover-status :: data :: ", data);
           console.log("switchover-status :: status :: ", status);
           console.log("switchover-status :: xhr :: ", xhr);

        }).fail(function (data, status, xhr)
        {           
            console.error("Error al establecer la conexión con el switchover-status. ", status, data);
            deferred.reject();            
        });

        return deferred.promise();
    }

    var _icLogout = function () {
        var deferred = $.Deferred();

        if (user.currentCallId) {
            display.showErrorModal("Por favor, termine la llamada actual del marcador antes de cerrar la sesión.");
            return;
        }
        user.changeStatus('Do Not disturb');
        _dialerLogout().done(function () {
            subscriptions.stopMessageProcessing().done(function () {
                session.sendRequest(session.server, 'DELETE', '/connection', {}, true, 6000).done(function () {
                    user.activeCampaigns = [];
                    user.availableCampaigns = [];
                    user.currentCallId = undefined;
                    display.page('login-page');
                    deferred.resolve();
                    window.location.reload(true);
                }).fail(function (data, status, xhr) {
                    display.page('login-page');
                    console.log("Error al cerrar la sesión de IC. Error: ", data.statusText, data.responseText);
                    display.showErrorModal("Error al cerrar la sesión de IC. Ver el registro de la consola para más detalles.");
                    deferred.reject(data, status, xhr);
                });
            });
        }).fail(function (data, status, xhr) {
            display.page('login-page');
            display.showErrorModal("Error al cerrar la sesión de Dialer. Ver el registro de la consola para más detalles.");
            deferred.reject(data, status, xhr);
        });
        return deferred.promise();
    }

    var _obtenerCamSelect = function() {
        var campaign = $("#main-page-available-campaigns").val();

        if(campaign !== "0")
        {
            _dialerLogin(campaign);
        }
        else
        {
            display.showErrorModal("Por favor, para continuar seleccione una camapaña");
        }
    }


    var _dialerLogin = function(campaign) {

        var deferred = $.Deferred();
        var payload = campaign ? { campaignId: campaign } : {};

        // Ingrese el agente en el marcador o la campaña especificada
        session.sendRequest(session.server, 'POST', '/dialer/log-in', payload, true, 6000).done(function (data, status, xhr) {

            if (campaign || campaign === 0)
            {
                // El agente inició sesión en la campaña y actualiza las campañas disponibles / activas en la vista
                var campaignData = _availableCampaigns.filter(function (c) { return c.id === campaign })[0];
                _availableCampaigns = _availableCampaigns.filter(function (c) { return c.id !== campaign });
                _activeCampaigns.push(campaignData);

                display.updateCampaigns(_availableCampaigns, _activeCampaigns, _hasLogonCampaignRight);
                
                // Listo para el envio de llamadas
                session.sendRequest(session.server, 'POST', '/dialer/ready-for-calls', payload, true, 6000).done(function () {
                    setTimeout(function() {
                            display.hideLoadingModal();
                        }, 1000);
                    if (!_currentCallId && _breakStatus !== 2)
                    {
                        $('#userName2').text(nombreUsu);
                        $('#userCam').text(nom);
                        campaniaActiva= campaign;
                        display.page("main-page");
                    }else{
                        display.page("main-page");
                    }
                    _readyForCallsSent = true;
                    deferred.resolve();
                    setTimeout(function() {
                            display.hideLoadingModal();
                        }, 1000);
                }).fail(function (data, status, xhr) {
                    display.showErrorModal('Se inició sesión correctamente en la campaña, pero falló para las llamadas listas. Ver el registro de la consola para más detalles.');
                    console.error('Se conectó a la campaña, pero falló para las llamadas listas. Error: ', data.statusText, data.responseText);
                    deferred.reject();
                });
            }
            else if (!_hasLogonCampaignRight)
            {
                session.sendRequest(session.server, 'POST', '/dialer/ready-for-calls', payload, true, 6000).done(function () {
                    if (!_currentCallId && _breakStatus !== 2) {                        
                    }
                    _readyForCallsSent = true;
                    deferred.resolve();
                }).fail(function (data, status, xhr) {
                    display.showErrorModal('Se conectó correctamente a Dialer, pero falló para las llamadas listas. Ver el registro de la consola para más detalles.');
                    console.error('Se conectó a la campaña, pero falló para las llamadas listas. Error: ', data.statusText, data.responseText);
                    deferred.reject();
                });
            }
            else
            {
               deferred.resolve();
            }
        }).fail(function (data, status, xhr) {
            var message = campaign ? "Error al iniciar sesión en la campaña: " + campaign + " Error: " + data.statusText + " " + data.responseText : "Error al iniciar sesión en el marcador. Error: " + data.statusText + " " + data.responseText;
            console.error(message);
            deferred.reject();
        });

        return deferred.promise();
    }

    var _dialerLogout = function (campaigns) {

        var deferred = $.Deferred();

        var payload = campaigns ? { campaignIds: campaigns } : {};

        session.sendRequest(session.server, 'POST', '/dialer/log-off', payload, true, 6000).done(function (data, status, xhr)
            {
                deferred.resolve();
                // Si el usuario se desconectó de una campaña, elimínela de la lista de campañas activas y actualice la vista.
                if (campaigns)
                {
                    campaigns.forEach(function (campaign) {
                        var campaignData = _activeCampaigns.filter(function (c) { return c.id === campaign })[0];
                        _activeCampaigns = _activeCampaigns.filter(function (c) { return c.id !== campaign });
                        _availableCampaigns.push(campaignData);
                        display.updateCampaigns(_availableCampaigns, _activeCampaigns, _hasLogonCampaignRight);
                    });

                    if (_activeCampaigns.length < 1 && !_currentCallId && _breakStatus !== 2) {
    
                    }
                }
        }).fail(function (data, status, xhr) {
            var message = campaigns ? "Error al cerrar la sesión de la campaña: " + campaigns + " Error: " + data.statusText + " " + data.responseText : "Error logging out of dialer. Error: " + data.statusText + " " + data.responseText;
            console.error(message);
            deferred.reject();
        });

        return deferred.promise();
    }

    var _dialerLogout2 = function (campaigns) {
        console.log(JSON.stringify(campaigns));

        var deferred = $.Deferred();

        var payload = campaigns ? { campaignIds: campaigns } : {};

        session.sendRequest(server, 'POST', '/dialer/log-off', payload, true, 6000).done(function (data, status, xhr)
        {
                deferred.resolve();
                
        }).fail(function (data, status, xhr) {
            var message = "Error al cerrar la sesión de la campaña:  Error: " + data.statusText + " " + data.responseText + "Error logging out of dialer. Error: " + data.statusText + " " + data.responseText;
            console.error(message);
            deferred.reject();
        });

        return deferred.promise();
    }

    var _hasAvailableCampaign = function (campaign) {
        _availableCampaigns.forEach(function(c) {
            if (c.id === campaign) {
                return true;
            }
        });
        return false;
    }

    var _hasActiveCampaign = function(campaign) {
        _activeCampaigns.forEach(function (c) {
            if (c.id === campaign) {
                return true;
            }
        });
        return false;
    }

    var _changeStatus = function(status)
    {
        var payload = {
            statusId: status
        };

        session.sendRequest(session.server, 'PUT', '/status/user-statuses/' + session.user, payload, true, 6000).fail(function (data, status, xhr)
        {
            console.error("Error al cambiar el estado. Error: ", data.statusText, data.responseText);
            display.showErrorModal("Error al cambiar el estado. Ver el registro de la consola para más detalles.");
        });
    }

    var _requestBreak = function () {
        // Not on break
        if (user.currentCallId) {
            display.showErrorModal("Por favor, termine la llamada actual del marcador para continuar.");
            return;
        }else{
            events.hangUp();
        }
        
        /*if (_breakStatus === 0) {
            var payload = {};
            session.sendRequest(session.server, 'POST', '/dialer/request-break/', payload, true, 6000).fail(function (data, status, xhr) {
                console.error("Solicitud de Break fallida. Error: ", data.statusText, data.responseText);
                display.showErrorModal("La solicitud de Break falló. Ver el registro de la consola para más detalles.")
            });
        }
        // Pending Break
        if (_breakStatus === 1) {
            // ignore
        }
        // On Break
        if (_breakStatus === 2) {
            var payload = {};
            session.sendRequest(session.server, 'POST', '/dialer/end-break/', payload, true, 6000).fail(function (data, status, xhr) {
                console.error("Solicitud de Break fallida. Error: ", data.statusText, data.responseText);
                display.showErrorModal("La solicitud de Break falló. Ver el registro de la consola para más detalles.")
            });
        }*/
    }
    
    var _sendDisposition = function ()
    {
        var disposition = config.disposicion;

        _disconnectCall().done(function()
        {
            var payload = {
                label: disposition
            }

            session.sendRequest(session.server, 'POST', '/dialer/disposition', payload, true, 6000).done(function()
            {
                display.disableDispositions();
                display.disableDisconnect();
                display.clearDataPop();

                window.parent.postMessage({event:'NotifyHangUpEvent',origin:'http://CEN-GT-CSWS-01/clienteICWS/'},'*');
                _changeStatus('Do Not disturb');
                $("#tel").html("");
                $("#telV").hide();
                _currentCallId = undefined;
            }).fail(function(data, status, xhr) {
                console.error("La solicitud de disposición falló. Error: ", data.statusText, data.responseText);
                display.showErrorModal("La solicitud de disposición falló. Ver el registro de la consola para más detalles.");
            });
        }).fail(function(data, status, xhr) {
            console.error("Error al desconectar la llamada. No procede con la solicitud de disposición. Error: ", data.statusText, data.responseText);
            display.showErrorModal("Error al deshacerse de la llamada. Ver el registro de la consola para más detalles.");
        });
    }

    var _placePreviewCall = function() {
        var payload = {
        }
        session.sendRequest(session.server, 'POST', '/dialer/place-preview-call', payload, true, 6000).done(function() {
            display.disablePlacePrevie
        }).fail(function(data, status, xhr) {
            console.error("Error al realizar una llamada de vista previa. Error: ", data.statusText, data.responseText);
            display.showErrorModal("Error al realizar una llamada de vista previa. Ver el registro de la consola para más detalles.");
        });
    }

    var _disconnectCall = function () {
        var deferred = $.Deferred();
        var payload = {
        }
        session.sendRequest(session.server, 'POST', '/interactions/' + _currentCallId + '/disconnect', payload, true, 6000).done(function() {
            display.disableDisconnect();
            deferred.resolve();
        }).fail(function(data, status, xhr) {
            console.error("Error al desconectar la llamada. Error: ", data.statusText, data.responseText);
            display.showErrorModal("Error al desconectar la llamada actual. Ver el registro de la consola para más detalles.");
            deferred.reject();
        });
        return deferred.promise();
    }

    Object.defineProperties(this, {
        validarStacion: {
            value: function() {
                return _validarStacion();
            }
        },
        initialLogin: {
            value: function() {
                return _initialLogin();
            }
        },
        initialLogin2: {
            value: function() {
                return _initialLogin2();
            }
        },
        icLogin: {
            value: function (username, password, server, application) {
                return _icLogin(username, password, server, application);
            }
        },
        icLogout: {
            value: function () {
                return _icLogout();
            }
        },
        obtenerCamSelect: {
            value: function () {
                return _obtenerCamSelect();
            }
        },
        dialerLogin: {
            value: function (campaignId) {
                return _dialerLogin(campaignId);
            }
        },
        dialerLogout: {
            value: function (campaigns) {
                return _dialerLogout(campaigns);
            }
        },
        hasLogonCampaignRight: {
            get: function () {
                return _hasLogonCampaignRight;
            },
            set: function (right) {
                _hasLogonCampaignRight = right;
            }
        },
        currentStatus: {
            get: function () {
                return _currentStatus;
            },
            set: function (status) {
                _currentStatus = status;
            }
        },
        currentCallId: {
            get: function () {
                return _currentCallId;
            },
            set: function (callId) {
                _currentCallId = callId;
            }
        },
        breakStatus: {
            get: function () {
                return _breakStatus;
            },
            set: function (status) {
                _breakStatus = status;
            }
        },
        availableCampaigns: {
            get: function () {
                return _availableCampaigns;
            },
            set: function (campaigns) {
                _availableCampaigns = campaigns;
            }
        },
        activeCampaigns: {
            get: function () {
                return _activeCampaigns;
            },
            set: function (campaigns) {
                _activeCampaigns = campaigns;
            }
        },
        readyForCallsSent: {
            get: function () {
                return _readyForCallsSent;
            }
        },
        hasAvailableCampaign: {
            value: function (campaignId) {
                return _hasAvailableCampaign(campaignId);
            }
        },
        hasActiveCampaign: {
            value: function (campaignId) {
                return _hasActiveCampaign(campaignId);
            }
        },
        changeStatus: {
            value: function (status) {
                return _changeStatus(status);
            }
        },
        requestBreak: {
            value: function() {
                return _requestBreak();
            }
        },
        sendDisposition: {
            value: function (disposition) {
                return _sendDisposition(disposition);
            }
        },
        placePreviewCall: {
            value: function() {
                return _placePreviewCall();
            }
        },
        disconnectCall: {
            value: function() {
                return _disconnectCall();
            }
        },
        enter: {
            value: function(event) {
                return _enter(event);
            }
        },
        over: {
            value: function()
            {
                return _over();
            }
        },
        reconnecting: {
            value: function()
            {
                return _reconnecting();
            }
        }
    });
}