/**********************************************************************************************************
FECHA CREACIÓN: 08-09-2020
AUTOR: CARLOS ALEXIS BRITO 
DESCRIPCIÓN:    ESTE ARCHIVO jS CUMPLIRA CON EL OBJETICO DE REALIZAR LA CONFIGURACIÓN
                DE LAS VARIBALES PARA LA CONEXION
***********************************************************************************************************/
var version = "1.0.0";

var now = new Date().getFullYear();

var six = "Sixbell " + now;

$(function()
{
    $("#version1, #version2, #version3, #version4").attr("title", six + " - V."+version);
});

function Config()
{
    var  ICWS_URI_PORT = ':8019';
    var _ICWS_URI_SCHEME = 'https://';
    var _ICWS_URI_PATH = '/icws';
    var _ICWS_MEDIA_TYPE = 'application/vnd.inin.icws+JSON';
    var _ICWS_MEDIA_CHARSET = 'charset=utf-8';
    var _alternateHostList = ['132.130.150.212'];
    //var _alternateHostList = ['IC1'];
    /**************SERVIDOR PRINCIPAL***************/
    var _ICWS_URI_SERVER = '132.130.150.210'+ ICWS_URI_PORT;
    //var _ICWS_URI_SERVER = '172.16.11.188'+ ICWS_URI_PORT;
    session.server = _ICWS_URI_SERVER;
    /***************ESTACIÓN DE TRABAJO ****************************/

    var _disposicion = 'Success';

    var _station = "";

    var _datosCamp = [];
    var _statusCampana = '';

    var _username = '';
    var _password = '';
    var _campaign = '';

    Object.defineProperties(this, {
        SCHEME: {
            get: function () {
                return _ICWS_URI_SCHEME;
            },  
            set: function (SCHEME) {
                _ICWS_URI_SCHEME = SCHEME;
            }
        },
        PATH: {
            get: function () {
                return _ICWS_URI_PATH;
            },
            set: function (PATH) {
                _ICWS_URI_PATH = PATH ;
            }
        },
        TYPE: {
            get: function () {
                return _ICWS_MEDIA_TYPE;
            },
            set: function (TYPE) {
                _ICWS_MEDIA_TYPE = TYPE;
            }
        },
        CHARSET: {
            get: function () {
                return _ICWS_MEDIA_CHARSET;
            },
            set: function (CHARSET) {
                _ICWS_MEDIA_CHARSET = CHARSET;
            }
        },
        SERVER: {
            get: function () {
                return _ICWS_URI_SERVER;
            },
            set: function (SERVER) {
                _ICWS_URI_SERVER = SERVER;
            }
        },
        PORT: {
            get: function () {
                return ICWS_URI_PORT;
            },
            set: function (PORT) {
                ICWS_URI_PORT = PORT;
            }
        },
        station: {
            get: function () {
                return _station;
            },
            set: function (station) {
                _station = station;
            }
        },
        alternateHostList: {
            get: function () {
                return _alternateHostList;
            },
            set: function (alternateHostList) {
                _alternateHostList = alternateHostList;
            }
        },
        datosCamp: {
            get: function () {
                return _datosCamp;
            },
            set: function (datosCamp) {
                _datosCamp = datosCamp;
            }
        },
        campaign: {
            get: function () {
                return _campaign;
            },
            set: function (campaign) {
                _campaign = campaign;
            }
        },
        statusCampana: {
            get: function () {
                return _statusCampana;
            },
            set: function (statusCampana) {
                _statusCampana = statusCampana;
            }
        }        ,
        username: {
            get: function () {
                return _username;
            },
            set: function (username) {
                _username = username;
            }
        },
        password: {
            get: function () {
                return _password;
            },
            set: function (password) {
                _password = password;
            }
        },
        disposicion: {
            get: function () {
                return _disposicion;
            },
            set: function (disposicion) {
                _disposicion = disposicion;
            }
        }
    });
}