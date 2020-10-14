//base level APIs


var ChromeAPI = (function () {
    var api = function () { }
    api.saveLocalData = function (keyVal, saveVal, callback) {
        var v = {};
        v[keyVal] = saveVal;
        chrome.storage.local.set(v);
    }

    api.getLocalData = function (keyVal, callback) {
        var paramKey = keyVal;
        chrome.storage.local.get([keyVal], callback);
    }

    api.removeLocalData = function (keyVal, callback) {
        chrome.storage.local.remove([keyVal], function () {
            if (callback) {
                callback();
            }
        });
    }

    api.clearLocalData = function (callback) {
        chrome.storage.local.clear(function(){
            if(callback){
                callback();
            }
        });
    }

    api.searchCookie = function(domain, cookieName , callback, errorCallback){
        chrome.cookies.getAll({}, function(cookies) {
            var findedCookies = [];
            cookies.forEach(cookie => {
                if(cookie.domain.endsWith(domain)
                   && cookie.name == cookieName){
                        findedCookies.push(cookie);
                   }
            });
            if(findedCookies.length>0){
                callback(findedCookies);
            }else{
                errorCallback("not found");
            }
        });
    }

    return api;
})();

var SalesforceAPI = (function () {

    var api = function () {

    }
    api.loginForOption = function (userName, password, domain, organizationId, callBack, errorCallBack){

        if(!domain.startsWith("https://")){
            domain = "https://" + domain;
        }
        if(!domain.endsWith("/")){
            domain = domain + "/";
        }
        var xhr = new XMLHttpRequest();
        xhr.open("POST", `${domain}services/Soap/c/43.0/`, true);
        xhr.setRequestHeader("Content-Type", "text/xml");
        xhr.setRequestHeader("soapAction", "Wololo");

        var sendStr = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:enterprise.soap.sforce.com">
        <soapenv:Header>
          <urn:LoginScopeHeader>
            <urn:organizationId>${organizationId}</urn:organizationId>
          </urn:LoginScopeHeader>
        </soapenv:Header>
        <soapenv:Body>
          <urn:login>
            <urn:username>${userName}</urn:username>
            <urn:password>${password}</urn:password>
          </urn:login>
        </soapenv:Body>
      </soapenv:Envelope>`;

        xhr.onload = function () {
            if (xhr.status == 200) {
                var xmlDoc = xhr.responseXML;

                var sessionIdEl = $(xmlDoc).find("sessionId");
                var serverUrl = $(xmlDoc).find("serverUrl")[0].innerHTML;
                var domain = serverUrl.substring(0, serverUrl.indexOf("salesforce.com/") + "salesforce.com/".length);
                var sessionId = sessionIdEl[0].innerHTML;

                api.LoginInfo = {};
                api.LoginInfo.userName = userName;
                api.LoginInfo.password = password;
                api.LoginInfo.domain = domain;
                api.LoginInfo.organizationId = organizationId;
                api.LoginInfo.sessionId = sessionId;

                ChromeAPI.saveLocalData("LoginInfo", api.LoginInfo);
                if (callBack) callBack(api.LoginInfo);
            } else {
                if (errorCallBack) {
                    errorCallBack(JSON.parse(xhr.responseText));
                }
            }
        }
        xhr.send(sendStr);
    }
    api.login = function (callBack, errorCallBack) {

        ChromeAPI.searchCookie("salesforce.com","sid",
            function(cookies){
                api.userId = null;

                cookies.forEach(cookie => {
                   if(api.userId == null) {
                        api.LoginInfo = {};
                        api.LoginInfo.domain = "https://" + cookie.domain + "/";
                        api.LoginInfo.sessionId = cookie.value;
                        api.requestRESTApi("services/data/v25.0/", 
                            function(d){
                                d = JSON.parse(d);
                                if(d.identity.lastIndexOf("/") > 0){
                                    api.userId = d.identity.substring(d.identity.lastIndexOf("/") + 1, d.identity.length);
                                }
                                if(api.userId != null){
                                    if (callBack) callBack(api.LoginInfo);
                                }
                            }, 
                            function(d){
                                console.log("session invalid:" + cookie.domain + "--" + cookie.value);
                            });
                   }
                });

                setTimeout(function(){
                    if(api.userId == null){
                        alert("session invalid");
                        ChromeAPI.clearLocalData();
                        window.location.href = "https://login.salesforce.com/";
                    }
                }, 5000);
            }, function(){
                alert("not login session.");
                ChromeAPI.clearLocalData();
                window.location.href = "https://login.salesforce.com/";
            });

        // ChromeAPI.getLocalData("LoginInfo", function(d){
        //     if(d.LoginInfo){

        //         var xhr = new XMLHttpRequest();
        //         xhr.open("POST", d.LoginInfo.domain + `services/Soap/c/43.0/`, true);
        //         xhr.setRequestHeader("Content-Type", "text/xml");
        //         xhr.setRequestHeader("soapAction", "Wololo");
                
        //             var sendStr = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:enterprise.soap.sforce.com">
        //             <soapenv:Header>
        //             <urn:LoginScopeHeader>
        //                 <urn:organizationId>${d.LoginInfo.organizationId}</urn:organizationId>
        //             </urn:LoginScopeHeader>
        //             </soapenv:Header>
        //             <soapenv:Body>
        //             <urn:login>
        //                 <urn:username>${d.LoginInfo.userName}</urn:username>
        //                 <urn:password>${d.LoginInfo.password}</urn:password>
        //             </urn:login>
        //             </soapenv:Body>
        //         </soapenv:Envelope>`;
        
        //         xhr.onload = function () {
        //             if (xhr.status == 200) {
        //                 var xmlDoc = xhr.responseXML;
        
        //                 var sessionIdEl = $(xmlDoc).find("sessionId");
        //                 var serverUrl = $(xmlDoc).find("serverUrl")[0].innerHTML;
        //                 var domain = serverUrl.substring(0, serverUrl.indexOf("salesforce.com/") + "salesforce.com/".length);
        //                 var sessionId = sessionIdEl[0].innerHTML;
        
        //                 api.LoginInfo = {};
        //                 api.LoginInfo.userName = d.LoginInfo.userName;
        //                 api.LoginInfo.password = d.LoginInfo.password;
        //                 api.LoginInfo.domain = d.LoginInfo.domain;
        //                 api.LoginInfo.organizationId = d.LoginInfo.organizationId;
        //                 api.LoginInfo.sessionId = sessionId;
        
        //                 ChromeAPI.saveLocalData("LoginInfo", api.LoginInfo);
        //                 if (callBack) callBack(api.LoginInfo);
        //             } else {
        //                 if (errorCallBack) {
        //                     errorCallBack(JSON.parse(xhr.responseText));
        //                 }
        //             }
        //         }
        //         xhr.send(sendStr);
        //     }else{
        //         errorCallBack("No optionData.");
        //     }
        // })

    }

    api.requestToolingApi = function (soql, callBack, errorCallBack) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", api.LoginInfo.domain +"services/data/v35.0/tooling/query?q=" + soql.replace(" " + "+"), true);
        
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfo.sessionId);
    
        xhr.onload = function () {
        if (xhr.statusText == "OK") {
            callBack(JSON.parse(xhr.responseText));
        } else {
            errorCallBack(JSON.parse(xhr.responseText));
        }
        }
        xhr.send();

        // var xhr = new XMLHttpRequest();
        // xhr.open("POST", api.LoginInfo.domain + "services/Soap/T/43.0", true);
        // xhr.setRequestHeader("Content-Type", "text/xml");
        // xhr.setRequestHeader("soapAction", "Wololo");

        // var sendStr = `<v:Envelope xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:d="http://www.w3.org/2001/XMLSchema" xmlns:c="http://schemas.xmlsoap.org/soap/encoding/" xmlns:v="http://schemas.xmlsoap.org/soap/envelope/">
        // <v:Header>
        //   <n0:SessionHeader xmlns:n0="urn:tooling.soap.sforce.com">
        //     <n0:sessionId>${api.LoginInfo.sessionId}</n0:sessionId>
        //   </n0:SessionHeader>
        // </v:Header>
        // <v:Body>
        //   <n1:query id="o0" c:root="1" xmlns:n1="urn:tooling.soap.sforce.com">
        //     <parameters>
        //     ${soql}
        //   </parameters>
        //   </n1:query>
        // </v:Body>
        // </v:Envelope>`;
        // xhr.onload = function () {
        //     if (xhr.status == 200) {
        //         var xmlDoc = xhr.responseXML;

        //         callBack(xmlDoc, xhr.responseText);
        //     } else {
        //         if (errorCallBack) {
        //             errorCallBack(JSON.parse(xhr.responseText));
        //         }
        //     }
        // }
        // xhr.send(sendStr);
    }

    api.requestData = function (soql, callBack, errorCallBack) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", api.LoginInfo.domain + "services/data/v43.0/query?q=" + soql.replace(" " + "+"), true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfo.sessionId);

        xhr.onload = function () {
            if (xhr.status == 200) {
                callBack(JSON.parse(xhr.responseText));
            } else {
                if (errorCallBack) {
                    errorCallBack(JSON.parse(xhr.responseText));
                }
            }
        }
        xhr.send();
    }

    
    api.requestCreateData = function(objectName, data, callBack, errorCallBack) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", api.LoginInfo.domain +`services/data/v43.0/sobjects/${objectName}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfo.sessionId);
    
        xhr.onload = function () {
        if (xhr.status == 201) {
            callBack(JSON.parse(xhr.responseText));
        } else {
            errorCallBack(JSON.parse(xhr.responseText));
        }
        }
        xhr.send(data);
    }

    api.requestRESTApi = function (url, callBack, errorCallBack) {

        var xhr = new XMLHttpRequest();
        xhr.open("GET", api.LoginInfo.domain + url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfo.sessionId);

        xhr.onload = function () {
            if (xhr.status == 200) {
                callBack(xhr.response);
            } else {
                if (errorCallBack) {
                    errorCallBack(JSON.parse(xhr.responseText));
                }
            }
        }
        xhr.send();
    }

    api.requestSaveData = function (objectName, objectId, data, callBack, errorCallBack) {
        var xhr = new XMLHttpRequest();
        xhr.open("PATCH", `${api.LoginInfo.domain}services/data/v43.0/sobjects/${objectName}/${objectId}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfo.sessionId);

        xhr.onload = function () {
            if (xhr.status == 200) {
                callBack();
            } else {
                if (errorCallBack) {
                    errorCallBack(JSON.parse(xhr.responseText));
                }
            }
        }
        xhr.send(data);
    }

    function requestCreateData(objectName, data, callBack, errorCallBack) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", `${api.LoginInfo.domain}services/data/v43.0/sobjects/${objectName}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfo.sessionId);

        xhr.onload = function () {
            if (xhr.status == 201) {
                callBack(JSON.parse(xhr.responseText));
            } else {
                errorCallBack(JSON.parse(xhr.responseText));
            }
        }
        xhr.send(data);
    }

    return api;
})();

var BaseAPI = (function () {
    var api = function () {

    }

    api.loadObjMap = function (callBack) {
        ChromeAPI.getLocalData("objMap", function (d) {
            if (d.objMap) {
                callBack(d.objMap);
            } else {
                api._requestObjects(function (objMap) {
                    callBack(objMap);
                })
            }
        });
    }

    api.getObjDef = function(objName , callBack){
        SalesforceAPI.requestRESTApi("services/data/v37.0/sobjects/" + objName + "/describe", function (json) {
            callBack(JSON.parse(json));
        });
    }

    api._requestObjects = function (callBack) {

        SalesforceAPI.requestRESTApi("services/data/v37.0/sobjects/", function (json) {
            var r = JSON.parse(json);

            var objs = [];

            r.sobjects.forEach(obj => {
                if (obj.queryable && obj.retrieveable && obj.updateable && obj.name.indexOf("__Share") == -1) {
                    objs.push(obj);
                }
            });

            BaseAPI._requestFields(objs, function (list) {

                console.log(list);

                var objMap = {};

                list.forEach(obj => {
                    obj.showField = false;
                    objMap[obj.name] = BaseAPI._formatObject(obj);
                });

                ChromeAPI.saveLocalData("objMap", objMap);

                if (callBack) {
                    callBack(objMap);
                }

            });
        });

    }

    api._requestFields = function (objs, callBack) {

        var totoalCount = objs.length;
        var counter = 0;

        var objList = [];
        objs.forEach(obj => {
            SalesforceAPI.requestRESTApi(obj.urls.describe, function (json) {
                var r = JSON.parse(json);
                objList.push(r);

                counter++;
                if (counter >= totoalCount) {
                    callBack(objList);
                }

            });

        });
    }

    api._formatObject = function (obj) {
        var r = {};
        r.label = obj.label;
        r.name = obj.name;
        r.custom = obj.custom;
        r.keyPrefix = obj.keyPrefix;
        r.fields = [];
        r.childRelationships = obj.childRelationships;
        obj.fields.forEach(f => {
          var ff = {};
          ff.name = f.name;
          ff.label = f.label;
          ff.custom = f.custom;
          ff.type = f.type;
          ff.updateable = f.updateable;
          ff.nillable = f.nillable;
          r.fields.push(ff);
        });
      
        return r;
    }

    return api;

})();

// SalesforceAPI.login(
//     function(){
//         BaseAPI.loadObjMap(function(){

//         });
//     }
// );
