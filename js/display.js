/**********************************************************************************************************
FECHA CREACIÓN: 08-09-2020
AUTOR: CARLOS ALEXIS BRITO 
DESCRIPCIÓN:    ESTE ARCHIVO jS CUMPLIRA CON EL OBJETICO DE mostrar las vistas de cada accion realizada del agente
VERSIÓN: 1.0.0
***********************************************************************************************************/
var con =0;
var estatus = 0;
var display = {
    page: function(page) {
        $('div[data-page]').each(function() {
            $(this).hide();
        });
        $('div[data-page="' + page + '"]').show();
    },
    changeStatus: function(status)
    {
        con ++;
        
        if(status === 'Do Not disturb' || status === 'Invalid Status')
        {
            $("#placePreviewCall").attr('disabled', false);
		estatus = 0;
        }
        else if(status === 'Available' || status != 'Invalid Status')
        {
            $("#placePreviewCall").attr('disabled', true);
        }

        $("#statusDropdownMenuLink").html(status);
        console.log('Display','changeStatus','Status 1 :: ', estatus);
        if(estatus === 0 && status === 'Campaign Call' || status === 'On Call')
        {	
            console.log('Display','changeStatus','Status IF :: ', estatus);
            if(estatus === 0)
    	    {
                console.log('Display','changeStatus','Status IF_1 :: ', estatus);
                events.httpGetAsync();
                //events.rev();
                console.log("window.location.href :: ",window.location.href);
                window.parent.postMessage({event:'NotifyTakeCallEvent',origin: window.location.href},'*');//http://CEN-GT-CSWS-01/clienteICWS/
                //Ext.getCmp('containerPanel').doRefresh();
                console.log("Linea de codigo ejecutada","window.parent.postMessage({event:'NotifyTakeCallEvent',origin: window.location.href},'*');");
                estatus = 1;
            }
            estatus = 1;
        }
        else if (status === 'Do Not Disturb' && estatus === 1)
        {
            console.log('Display','changeStatus','Status ELSE :: ', estatus);
            estatus = 0;
        }
    },
    setAvailableStatusMessages: function (statusMessages) {
        $("#main-page-status-dropdown").html("");
        statusMessages.forEach(function (status) {
            var html = '<a class="dropdown-item" href="#" onclick="user.changeStatus(\'' + status + '\')">' + status + '</a>';
            $("#main-page-status-dropdown").append(html);
        });
    },
    updateCampaigns: function (available, active, loginRight) {
        $("#main-page-available-campaigns").html("");
        $("#main-page-active-campaigns").html("");
        $("#cam-disponibles").html("");
        if(available.length > 0)
        {
            if (!loginRight)
            {
                available.forEach(function (campaign) {

                    config.datosCamp.push({ value: campaign.id, text: campaign.name });

                    $('#main-page-available-campaigns').append($('<option>', { 
                        value: campaign.id,
                        text : campaign.name 
                    }));
                    //alert(campaign.name);
                });
            } 
            else 
            {            
                available.forEach(function (campaign) {

                    config.datosCamp.push({ value: campaign.id, text: campaign.name });

                    $('#main-page-available-campaigns').append($('<option>', { 
                        value: campaign.id,
                        text : campaign.name 
                    }));
                    //alert(campaign.name);
                });
            }
        }
        else
        {
            $('#main-page-available-campaigns').empty();
            $('#main-page-available-campaigns').append('<option value="0">No hay Campañas disponibles</option>');
        }
    },
    showLoadingModal: function() {
        $("#loading-modal").modal("show");
    },
    hideLoadingModal: function() {
        $("#loading-modal").modal("hide");
    },
    showOnDialerBreak: function () {
       /* $("#main-page-break-button").attr('disabled', false);
        //$("#main-page-break-button").html("Terminar Break");
        $("#main-page-break-button").addClass('break-button-hover');*/
    },
    showPendingDialerBreak: function() {
       /* $("#main-page-break-button").attr('disabled', true);
        $("#main-page-break-button").html("Break Pendiente...");
        $("#main-page-break-button").removeClass('break-button-hover');*/
    },
    showDialerRequestBreak: function() {
       /* $("#main-page-break-button").attr('disabled', false);
        $("#main-page-break-button").html("Hang Up");
        //$("#main-page-break-button").html("Solicitar Break");
        $("#main-page-break-button").addClass('break-button-hover');*/
    },
    enableDispositions: function() {
        $("#disposition-buttons").attr('disabled', false);
    },
    disableDispositions: function() {
        $("#disposition-buttons").attr('disabled', true);
    },
    enablePlacePreview: function() {
        $("#placePreviewCall").attr('disabled', false);
    },
    disablePlacePreview: function() {
        $("#placePreviewCall").attr('disabled', true);
    },
    enableSkipPreview: function() {
        $("#skipPreviewCall").attr('disabled', false);
    },
    disableSkipPreview: function() {
        $("#skipPreviewCall").attr('disabled', true);
    },
    enableDisconnect: function () {
        $("#login-submit").attr('disabled', false);
    },
    disableDisconnect: function () {
        $("#login-submit").attr('disabled', true);

    },
    showDataPop: function (data) {
        var attributesHtml = "";
        var dataPopInfoHtml = "";
        var telefono = "";
        var dato  = "";
        Object.keys(data).forEach(function(info) {
            if (info !== "attributes") {
                //dataPopInfoHtml += '<h6><strong>' + info + '</strong>' + ': ' + data[info] + '</h6>';
            }
        });
        Object.keys(data.attributes).forEach(function (attribute) {
            if (data.attributes[attribute] !== "") {
                //attributesHtml += '<h6><strong>' + attribute + '</strong>' + ': ' + data.attributes[attribute] + '</h6>';
            }
        });
        
        //telefono = JSON.stringify(data.attributes.is_attr_Telefono);
        //dato  = JSON.stringify(data.attributes.is_attr_ContactCaseId);

        telefono = JSON.stringify(data.attributes.is_attr_TELEFONO);       
        dato  = JSON.stringify(data.attributes.is_attr_ContactCaseID);
        if (dato !== undefined) {
            dato = dato.replace(/"/g, "").replace(/'/g, "");
            config.contextCode = Number(dato);
        }
        $("#tel").html(telefono);
        $("#telV").show();
    },
    clearDataPop: function() {
        $("#tel").html("");
        $("#telV").hide();
    },
    showErrorModal: function (message) {
        $("#error-modal-message").html(message);
        $("#error-modal").modal('show');
    }
}