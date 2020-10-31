//base level APIs

/* 使い方:
 var syncHelper = new SyncHelper(5);
 for(var i=0 ; i<5 ; i++){
   setTimeout(function(){
     syncHelper.countStep();
   },200);
 }
 syncHelper.onOver(function(){
   alert("sync all over");
 });
 syncHelper.startCount();
*/
var SyncHelper = function(maxCount){
  this.counter = 0;
  this.maxCount = maxCount;
  this.overCallBack = null;
  this.runTimes = 0;
};
SyncHelper.prototype.countStep = function(){
  this.counter ++;
}
SyncHelper.prototype.startCount = function(){
  var me = this;
  me.runTimes ++;
  if(me.runTimes > 2000){
    alert("sync times ovoer 2000.");
    return;
  }
  setTimeout(function(){
    if(me.counter != me.maxCount){
      me.startCount();
    }else{
      if(me.overCallBack){
        me.overCallBack();
      }
    }
  },300);
}
SyncHelper.prototype.onOver = function(callback){
  this.overCallBack = callback;
}

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

                api.LoginInfor = {};
                api.LoginInfor.userName = userName;
                api.LoginInfor.password = password;
                api.LoginInfor.domain = domain;
                api.LoginInfor.organizationId = organizationId;
                api.LoginInfor.sessionId = sessionId;

                ChromeAPI.saveLocalData("LoginInfor", api.LoginInfor);
                if (callBack) callBack(api.LoginInfor);
            } else {
                if (errorCallBack) {
                    errorCallBack(JSON.parse(xhr.responseText));
                }
            }
        }
        xhr.send(sendStr);
    }
    
    // logininfor変数を作成
    api._createLoginInfor = function(cookies){
      var loginInfors = [];
      cookies.forEach(cookie => {
        var loginInfor = {};
        loginInfor.domain = "https://" + cookie.domain + "/";
        loginInfor.sessionId = cookie.value;
        loginInfors.push(loginInfor);
      });
      api.LoginInfors = loginInfors;
    }

    // loginInforをSalesforceに接続して、検証する、接続できないものを削除
    api._validateLoginInfors = function(callback, errorCallback){
      var syncHelper = new SyncHelper(api.LoginInfors.length);
      api.LoginInfors.forEach(loginInfor => {
        api.LoginInfor = loginInfor;
        api.requestRESTApi("services/data/v25.0/", 
          function(d){
            var userId = null;
            syncHelper.countStep();

            d = JSON.parse(d);
            if(d.identity.lastIndexOf("/") > 0){
                userId = d.identity.substring(d.identity.lastIndexOf("/") + 1, d.identity.length);
            }
            if(userId != null){
              loginInfor.userid = userId;
            }
          }, 
          function(d){
              console.log("session invalid:" + cookie.domain + "--" + cookie.value);
          }
        );
      });
      syncHelper.onOver(function(){
        var resultLoginInfor = [];
        api.LoginInfors.forEach(loginInfor => {
          if(loginInfor){
            resultLoginInfor.push(loginInfor);
          }
        });
        api.LoginInfors = resultLoginInfor;
        if(resultLoginInfor.length > 0){
          callback();
        }else{
          errorCallback();
        }
      });
      syncHelper.startCount();
    }

    api.login = function (callBack, errorCallBack) {
      ChromeAPI.searchCookie("salesforce.com","sid",
        function(cookies){
          api._createLoginInfor(cookies);
          api._validateLoginInfors(
            function(){
              api.LoginInfor= api.LoginInfors[0];
              callBack(api.loginInfor, api.loginInfors);
            }, 
            function(){
              alert("session not exists");
              ChromeAPI.clearLocalData();
              window.location.href = "https://login.salesforce.com/";
            }
          );

        }, function(){
          alert("not login session.");
          ChromeAPI.clearLocalData();
          window.location.href = "https://login.salesforce.com/";
        }
      );
    }

    api.requestToolingApi = function (soql, callBack, errorCallBack) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", api.LoginInfor.domain +"services/data/v35.0/tooling/query?q=" + soql.replace(" " + "+"), true);
        
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);
    
        xhr.onload = function () {
        if (xhr.statusText == "OK") {
            callBack(JSON.parse(xhr.responseText));
        } else {
            errorCallBack(JSON.parse(xhr.responseText));
        }
        }
        xhr.send();

        // var xhr = new XMLHttpRequest();
        // xhr.open("POST", api.LoginInfor.domain + "services/Soap/T/43.0", true);
        // xhr.setRequestHeader("Content-Type", "text/xml");
        // xhr.setRequestHeader("soapAction", "Wololo");

        // var sendStr = `<v:Envelope xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:d="http://www.w3.org/2001/XMLSchema" xmlns:c="http://schemas.xmlsoap.org/soap/encoding/" xmlns:v="http://schemas.xmlsoap.org/soap/envelope/">
        // <v:Header>
        //   <n0:SessionHeader xmlns:n0="urn:tooling.soap.sforce.com">
        //     <n0:sessionId>${api.LoginInfor.sessionId}</n0:sessionId>
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
        xhr.open("GET", api.LoginInfor.domain + "services/data/v43.0/query?q=" + soql.replace(" " + "+"), true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);

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
        xhr.open("POST", api.LoginInfor.domain +`services/data/v43.0/sobjects/${objectName}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);
    
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
        xhr.open("GET", api.LoginInfor.domain + url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);

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
        xhr.open("PATCH", `${api.LoginInfor.domain}services/data/v43.0/sobjects/${objectName}/${objectId}`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);

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

    api.getObjIdFromName = function(objName, callback){
      if(objName.endsWith("__c")){
        var searchName = objName.replace("__c","");
        if(searchName.indexOf("__") != -1){
          searchName = searchName.substring(searchName.indexOf("__") + 2 , searchName.length);
        }
        api.requestToolingApi("SELECT Id,DeveloperName FROM CustomObject WHERE DeveloperName='" + searchName + "'" ,function(doc,text){
          var oId = doc.records[0].Id;
          callback(oId);
        });
      }else{
        callback(objName);
      }
    }

    api.getFieldIdFromName = function(objName, fieldName, callback){
      if(fieldName.endsWith("__c")){
        var fieldName = fieldName.replace("__c","");
        api.getObjIdFromName(objName, function(objId){
          api.requestToolingApi(`SELECT Id,DeveloperName,TableEnumOrId FROM CustomField WHERE DeveloperName='${fieldName}' AND TableEnumOrId='${objId}'` ,function(doc,text){
            var fId = doc.records[0].Id;
            callback(fId);
          });
        });
      }else{
        callback(fieldName);
      }
    }

    api.getObjPageUrl = function(objName, callback){

      if(objName.endsWith("__c")){
        var searchName = objName.replace("__c","");
        if(searchName.indexOf("__") != -1){
          searchName = searchName.substring(searchName.indexOf("__") + 2 , searchName.length);
        }
        
        api.getObjIdFromName(objName, function(objId){
          callback(api.LoginInfor.domain + objId + "?setupid=CustomObjects");
        });
      }else{
        callback(api.LoginInfor.domain + "p/setup/layout/LayoutFieldList?type=" + objName);
      }
    }

    api.getFieldPageUrl = function(objName, fieldName, callback){
      
      if(fieldName.endsWith("__c")){
          
        api.getObjIdFromName(objName, function(objId){
          api.getFieldIdFromName(objName, fieldName, function(fieldId){
            callback(api.LoginInfor.domain + fieldId + "?setupid=CustomObjects");
          });
        });

      }else{
        api.getObjIdFromName(objName, function(objId){
          callback(`${api.LoginInfor.domain}_ui/common/config/field/StandardFieldAttributes/d?setupid=UserFields&id=${fieldName}&type=${objId}`);
        });
      }
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
                });
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
