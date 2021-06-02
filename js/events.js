/**********************************************************************************************************
FECHA CREACIÓN: 08-09-2020
AUTOR: CARLOS BRITO
DESCRIPCIÓN:    ESTE ARCHIVO jS CUMPLIRA EL OBJETIVO DE EJECUCIÓN DE LOS VENTOS 
                Y CAMBIO DE ESTADOS PARA EL AGENTE, CUANDO ESTA EN LLAMADA, BREAK.
VERSIÓN: 1.0.0
***********************************************************************************************************/
var Events = function () {

    var _userStatusChanged = function (message) {
        user.currentStatus = message.userStatusList[0].statusId;
        display.changeStatus(message.userStatusList[0].statusId);
        if (message.userStatusList[0].statusId === "Follow Up") {
            display.disablePlacePreview();
            display.disableSkipPreview();
            display.enableDisconnect();
        }
        if (message.userStatusList[0].statusId === "Available" && user.activeCampaigns.length > 0 && user.breakStatus !== 2) {
        }
        if (message.userStatusList[0].statusId === "Available" && user.activeCampaigns.length < 1) {
        }
    }
    
    var _availableStatusMessagesChanged = function(message) { // es para cambiar de esatatus al agente 
        //display.setAvailableStatusMessages(message.statusMessagesUserAccessChanges[0].statusMessagesAdded);
    }

    var _availableCampaignsMessage = function(message) {
        if (message.campaignsAdded) {
            
            message.campaignsAdded.forEach(function (campaign) {
                if (campaign.isLoggedIn || !user.hasLogonCampaignRight) {
                    if (!user.hasActiveCampaign(campaign.id)) {
                        user.availableCampaigns.push(campaign);
                        if (user.readyForCallsSent && !user.currentCallId && user.breakStatus !== 2) {            
                        }
                    }
                } else {
                    if (!user.hasAvailableCampaign(campaign.id)) {
                        user.availableCampaigns.push(campaign);
                    }
                }
            });
        }
       
        if (message.campaignsRemoved) {
            message.campaignsRemoved.forEach(function(campaign) {
                user.activeCampaigns = user.activeCampaigns.filter(function (c) { return campaign.id !== c.id });;
                user.availableCampaigns = user.availableCampaigns.filter(function (c) { return campaign.id !== c.id });
            });
        }

        display.updateCampaigns(user.availableCampaigns, user.activeCampaigns, user.hasLogonCampaignRight);

        if (user.activeCampaigns < 1 && !user.currentCallId && user.breakMessage !== 2) {
        }
    }

    var _dataPopMessage = function (message) {
        user.currentCallId = message.call.interactionId;

        if (message.call.__type === "urn:inin.com:dialer:previewPop" && !message.call.callPlaced && message.call.dialingMode === 0) {
            display.enablePlacePreview();
            display.enableSkipPreview();
            display.disableDisconnect();
            display.showDataPop(message.call);
            return;
        }
        if (message.call.__type === "urn:inin.com:dialer:previewPop" && message.call.callPlaced && message.call.dialingMode === 0) {
            display.disableSkipPreview();
            display.enableDisconnect();
            display.enableDispositions();
            display.showDataPop(message.call);
            return;
        }
        if (message.__type === "urn:inin.com:dialer:dataPopMessage") {
            display.enableDispositions();
            display.enableDisconnect();
            display.showDataPop(message.call);
            return;
        }
    }

    var _rev = function(){
		var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
		var eventer = window[eventMethod];
		var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

		// Listen to message from child window
		eventer(messageEvent,function(e) {
			//console.log('parent received message!:  ',e.data);
		},false);
	}

    var _breakMessage = function (message) {
        user.breakStatus = message.breakStatus;
        if (message.breakStatus === 0) {
            if (user.currentStatus === "Do Not Disturb" || user.currentStatus === "Invalid Status") {
                $("#ultimo").html("<strong>Del Ultimo Break</strong>");
                user.changeStatus("Do Not Disturb");
            }
            display.showDialerRequestBreak();
        }
        if (message.breakStatus === 1) {
            display.showPendingDialerBreak();
        }
        if (message.breakStatus === 2) {
            display.showOnDialerBreak();
            display.disableDisconnect();
            user.changeStatus('Do Not Disturb');
        }
    }

    
var _httpGetAsync = function () {
    var status = $('#statusDropdownMenuLink').text();;
    var baseURL = config.baseURL;

    if(status != 'AcdAgentNotAnswering')
    {
        if(status === 'Campaign Call')
        {
            baseURL += '&externalUserCode=' + config.userCode;
            baseURL += '&externalContextCode=' + config.contextCode;
            baseURL = baseURL.replace(/"/g, "").replace(/'/g, "");
            console.log(baseURL);
            if(estatus === 0)
            {
                var request = new XMLHttpRequest();
                
                request.withCredentials = true;

                request.open('GET', baseURL, false);
                request.send(null);

                if (request.status == 200 && request.readyState == 4) 
                {
                    console.log(request);
                    console.log(request.response);
                }
                else
                {
                    console.log(request);
                }
            }
        }else{
            console.log('No se envio la peticion por que el agente no se encuentra en el estatus de "Campaign call". ' + status);
        }
    }else{
        console.log('No se envio la peticion por que el agente se encuentra en estatus de "No contesto" o "AcdAgentNotAnswering". ' + status);
    }
}

               

    $(window).bind('beforeunload', function() {
        subscriptions.stopMessageProcessing();
        user.activeCampaigns = [];
        user.availableCampaigns = [];
        user.currentCallId = undefined;
    });

    Object.defineProperties(this, {
        userStatusChanged: {
            value: function(message) {
                return _userStatusChanged(message);
            }
        },
        availableStatusMessagesChanged: {
            value: function(message) {
                return _availableStatusMessagesChanged(message);
            }
        },
        availableCampaignsMessage: {
            value: function (message) {
                return _availableCampaignsMessage(message);
            }
        },
        dataPopMessage: {
            value: function (message) {
                return _dataPopMessage(message);
            }
        },
        breakMessage: {
            value: function(message) {
                return _breakMessage(message);
            }
        },
        takeCall: {
            value: function() {
                return _takeCall();
            }
        },
        hangUp: {
            value: function() {
                return _hangUp();
            }
        },
        httpGetAsync: {
            value: function() {
                return _httpGetAsync();
            }
        },
        rev: {
            value: function() {
                return _rev();
            }
        },
        prender: {
            value: function() {
                return _prender();
            }
        }
    });

}