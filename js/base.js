//base level APIs

Date.prototype.getYYMMDDHHMMSS = function(){
  return `${this.getFullYear()}/${this.getMonth()+1}/${this.getDate()} ${this.getHours()}:${this.getMinutes()}:${this.getSeconds()}`;
}


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
      chrome.storage.local.set(v, callback);
    }

    api.getLocalData = function (keyVal, callback) {
      chrome.storage.local.get(keyVal == null ? null: [keyVal], callback);
    }

    api.getAllLocalData = function(callback){
      chrome.storage.local.get(null, callback);
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
        if(cookie.domain.startsWith('.')) return;
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
        api.requestRESTApi("services/data/v46.0/", 
          function(d){
            var userId = null;
            d = JSON.parse(d);
            if(d.identity.lastIndexOf("/") > 0){
                userId = d.identity.substring(d.identity.lastIndexOf("/") + 1, d.identity.length);
            }
            if(userId != null){
              loginInfor.userId = userId;
            }

            api.LoginInfor = loginInfor;
            api.queryData(`SELECT Id,UserName FROM User WHERE Id='${userId}'`
              ,(d)=>{
                if(d.records.length > 0 && d.records[0].Username ){
                  loginInfor.userName = d.records[0].Username;
                }
                syncHelper.countStep();
              }
              ,()=>{
                syncHelper.countStep();
              }
            );

          }, 
          function(d){
              console.log("session invalid:" + loginInfor.domain + "--" + loginInfor.value);
              syncHelper.countStep();
          }
        );
      });
      syncHelper.onOver(function(){
        var resultLoginInfor = [];
        api.LoginInfors.forEach(loginInfor => {
          if(loginInfor.userName){
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
              if(confirm("session not exists. goto login page?")){
                ChromeAPI.clearLocalData();
                window.location.href = "https://login.salesforce.com/";
              }
            }
          );

        }, function(){
          if(confirm("session not exists. goto login page?")){
            ChromeAPI.clearLocalData();
            window.location.href = "https://login.salesforce.com/";
          }
        }
      );
    }

    api.changeLoginUser = function(userId){
      api.LoginInfors.forEach(loginInfor => {
        if(loginInfor.userId == userId){
          api.LoginInfor = loginInfor
        }
      });
    }

////////////////////////////////////////////////////////////

    api._requestSFDCPath = function(path, method, body, overFun, errFun){
      var options = {
        method: method,
        url: api.LoginInfor.domain + path,
        headers: {
                  'Authorization': 'OAuth ' + api.LoginInfor.sessionId
                  ,'Content-Type' :'application/json' 
                  ,"Accept": "application/json"
                },
        data: body
      };
      $.ajax(options).done(function(r,status,response){
        overFun(r, response, null);
      }).fail(errFun);
    }

    api._requestSFDC = function(path, method, body, overFun, errFun){
      api._requestSFDCPath('services/data/v46.0/' + path, method, body, overFun, errFun);
    }

    api.requestPath = function(path, overFun, errFun){
      api._requestSFDCPath(path
                        ,"GET"
                        ,``
                        ,(body) => {
                          if(body){
                            overFun(body);
                          }
                        }
                        ,errFun
      );
    }

    api.patchPath = function(path, paramObj, overFun, errFun){
      api._requestSFDCPath(path
                        ,"PATCH"
                        ,paramObj
                        ,(body,response, status) => {
                          overFun(response,body);
                        }
                        ,errFun
      );
    }
    
    api.queryDef = function(sql, overFun,errFun){
      api._requestSFDC(`tooling/query/?q=${encodeURI(sql.replace(/ /g, "+"))}`
                        ,"GET"
                        ,""
                        ,(body,response,error) => {
                          if(body.nextRecordsUrl){
                            SFDC._queryNext(body, overFun , errFun);
                          }else{
                            overFun(body,response);
                          }
                        }
                        ,errFun);
    }

    api.queryData = function(sql, overFun,errFun){
      api._requestSFDC(`query/?q=${encodeURI(sql.replace(/ /g, "+"))}`
                        ,"GET"
                        ,""
                        ,(body,response,error) => {
                          if(body.nextRecordsUrl){
                            SFDC._queryNext(body, overFun , errFun);
                          }else{
                            overFun(body,response);
                          }
                        }
                        ,errFun);
    }
    
    api._queryNext = function(r, overFun ,errFun){
      api.requestPath(r.nextRecordsUrl
                        ,body => {
                          for(record of body.records){
                            r.records.push(record);
                          }
                          if(body.nextRecordsUrl){
                            SFDC._queryNext(body, overFun , errFun);
                          }else{
                            overFun(r);
                          }
                        }
                        ,errFun);
    }

    api.getToolingObjDef = function(objName, overFun,errFun){
      api.requestPath(`services/data/v46.0/tooling/sobjects/` + objName + "/describe"
                        ,body => {
                          overFun(body);
                        }
                        ,errFun);
    }

    api.getAllObjDef = function(overFun,errFun){
      api.requestPath(`services/data/v46.0/sobjects/`
                        ,body => {
                          overFun(body);
                        }
                        ,errFun);
    }

    api.getObjDef = function(objName, overFun,errFun){
      api.requestPath(`services/data/v46.0/sobjects/` + objName + "/describe"
                        ,body => {
                          overFun(body);
                        }
                        ,errFun);
    }

    api.getRecord = function(objName, id, overFun,errFun){
      api.requestPath(`services/data/v46.0/sobjects/` + objName + "/" + id
                        ,body => {
                          overFun(body);
                        }
                        ,errFun);
    }

    api.updateRecord = function(objName, id, value, overFun,errFun){
      api.patchPath(`services/data/v46.0/sobjects/` + objName + "/" + id
                        ,value
                        ,body => {
                          overFun(body);
                        }
                        ,errFun);
    }

    api.getVFPageIdFromName = function(name, overFun, errFun){
      api.queryDef(`SELECT Id, Name FROM ApexPage where Name = '${name}'`,
                  (body,response) =>{
                    if(body == undefined) return;
                
                    if(body.size != undefined && body.size > 0){
                      overFun(body.records[0].Id);
                    }else{
                      Err.addError("can not find page id:" + name);
                    }
                  },
                  errFun
                );
    }

    api.updateVFPage = function(id, content, overFun, errFun){
      content = content.replace(/"/g, "\\\"").replace(/\r\n|\n/g, "\\n").replace(/\t/g, "\\t").replace(/\\'/g, "\\\\'");
      api._requestSFDC(`sobjects/ApexPage/${id}`
                        ,"PATCH"
                        ,`{"Markup": "${content}"}`
                        ,(body,response) => {
                          if(overFun) overFun(body,response);
                        }
                        ,errFun);
    }

    api.getApexClassIdFromName = function(name, overFun, errFun){
      // ----> SOQL検索
      api.queryDef(`SELECT Id, Name FROM ApexClass where Name = '${name}'`,
                  (body,response) =>{
                    if(body == undefined) return;
                
                    if(body.size != undefined && body.size > 0){
                      overFun(body.records[0].Id);
                    }
                  },errFun);
    }

    api.createMetadataContainer = function(containerName , overFun, errFun){
      api._requestSFDC(
        `tooling/sobjects/MetadataContainer/`
        ,"POST"
        ,`{"Name":"${containerName}"}`
        ,(body) => {
          overFun(body.id);
        }
        ,errFun
      );
    }

    api.getMetadataContainer = function(overFun, errFun){
      var containerName = "containerName";
    
      api.queryDef(`SELECT Id, Name FROM MetadataContainer WHERE Name =' ${containerName}'`,
        (body) => {
          if(body.records.length > 0){
            overFun(body.records[0].Id);
          }else{
            api.createMetadataContainer(containerName, 
            (cId) =>{
              overFun(cId);
            })
          }
        },
        errFun
      );
    }

    api.createApexPageMember = function(containerId, pageId, content, overFun, errFun){
      content = content.replace(/"/g, "\\\"").replace(/\r\n|\n/g, "\\n").replace(/\t/g, "\\t").replace(/\\'/g, "\\\\'");
      api._requestSFDC(`tooling/sobjects/ApexPageMember/`
                        ,"POST"
                        ,`{"ContentEntityId":"${pageId}","MetadataContainerId":"${containerId}","body":"${content}"}`
                        ,(body) => {
                          if(body){
                            overFun(body.id);
                          }
                        }
                        ,errFun
      );
    }

    api.createApexClassMember = function(containerId, classId, content, overFun, errFun){
      content = content.replace(/"/g, "\\\"").replace(/\r\n|\n/g, "\\n").replace(/\t/g, "\\t").replace(/\\'/g, "\\\\'");
      api._requestSFDC(`tooling/sobjects/ApexClassMember/`
                        ,"POST"
                        ,`{"ContentEntityId":"${classId}","MetadataContainerId":"${containerId}","body":"${content}"}`
                        ,(body) => {
                          if(body){
                            overFun(body.id);
                          }
                        }
                        ,errFun
      );
    }

    api.getApexClassMember = function(containerId, classId, content, overFun, errFun){
  
      api.queryDef(`SELECT Id FROM ApexClassMember WHERE ContentEntityId ='${classId}' AND MetadataContainerId = '${containerId}'`,
        (body) => {
          if(body.records.length > 0){
            overFun(body.records[0].Id);
          }else{
            api.createApexClassMember(containerId, classId, content, 
              (classId) =>{
                overFun(classId);
              }
            );
          }
        }
        ,errFun
      )
    }
      
    api.ContainerAsyncRequest = function(containerId, overFun, errFun){
      api._requestSFDC(`tooling/sobjects/ContainerAsyncRequest/`
                        ,"POST"
                        ,`{"IsCheckOnly":false,"MetadataContainerId":"${containerId}"}`
                        ,(body) => {
                          if(body){
                            overFun(body.id);
                          }
                        }
                        ,errFun
      );
    }

    api.updateApexClass = function(id, content, overFun, errFun){
      var updateName = "updateName2";
    
      api.getMetadataContainer(
        (containerId)=>{
          api.getApexClassMember(containerId, id, content,
            (classId)=>{
              api.ContainerAsyncRequest(containerId,
                (r) =>{
                  overFun(r);
                }
              );
            },errFun
          );
        }
      );
    
    }

    api.getContainerAsyncRequestResult = function(id, overFun, errFun){
      api._requestSFDC(`tooling/sobjects/ContainerAsyncRequest/${id}`
                        ,"GET"
                        ,``
                        ,(body) => {
                          if(body){
                            overFun(body);
                          }
                        }
                        ,errFun
      );
    }
  
    api.getApexPageSource = function(id, overFun, errFun){
      api._requestSFDC(`tooling/sobjects/apexPage/${id}`
                        ,"GET"
                        ,``
                        ,(body) => {
                          if(body){
                            overFun(body);
                          }
                        }
                        ,errFun
      );
    }
  
    api.getApexClassSource = function(id, overFun, errFun){
      api._requestSFDC(`tooling/sobjects/apexClass/${id}`
                        ,"GET"
                        ,``
                        ,(body) => {
                          if(body){
                            overFun(body);
                          }
                        }
                        ,errFun
      );
    }



///////////////////////////////////////////////////////////////////////


    api.requestToolingApi = function (soql, callBack, errorCallBack) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", api.LoginInfor.domain +"services/data/v46.0/tooling/query?q=" + soql.replace(" " + "+"), true);
        
        xhr.setRequestHeader("pragma", "no-cache");
        xhr.setRequestHeader("cache-control", "no-cache");
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

    api.requestRecord = function (objName, id, fields, callBack, errorCallBack) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", api.LoginInfor.domain + `services/data/v46.0/sobjects/${objName}/${id}?fields=${fields.join(',')}`, true);
        
        xhr.setRequestHeader("pragma", "no-cache");
        xhr.setRequestHeader("cache-control", "no-cache");
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

    api.requestData = function (soql, callBack, errorCallBack) {
        var xhr = new XMLHttpRequest();
        let sql = encodeURI(soql.replace(/\s+/gs , "+"));
        xhr.open("GET", api.LoginInfor.domain + "services/data/v46.0/query?q=" + sql, true);
        xhr.setRequestHeader("pragma", "no-cache");
        xhr.setRequestHeader("cache-control", "no-cache");
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
        xhr.open("POST", api.LoginInfor.domain +`services/data/v46.0/sobjects/${objectName}`, true);
        xhr.setRequestHeader("pragma", "no-cache");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);
    
        xhr.onload = function () {
            if (xhr.status == 201 || xhr.status == 204) {
                callBack(JSON.parse(xhr.responseText));
            } else {
                errorCallBack(JSON.parse(xhr.responseText));
            }
        }
        xhr.send(data);
    }

    api.requestCreateDataSync = function (objectName, data) {
        return new Promise((resolve) => {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", api.LoginInfor.domain +`services/data/v46.0/sobjects/${objectName}`, true);
            
            xhr.setRequestHeader("pragma", "no-cache");
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-PrettyPrint", "1");
            xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);
    
            xhr.onload = function () {
                if (xhr.status == 201 || xhr.status == 204) {
                    resolve('success'); 
                } else {
                    resolve('error:' + xhr.responseText); 
                }
            }
            xhr.send(data);
        });
    }
    
    api.requestDeleteDataSync = function (objectName, Id) {
        return new Promise((resolve) => {
            var xhr = new XMLHttpRequest();

            xhr.open("DELETE", api.LoginInfor.domain +`services/data/v46.0/composite/sobjects?ids=${Id}`, true);
            // xhr.open("DELETE", api.LoginInfor.domain +`services/data/v46.0/sobjects/${objectName}/${Id} -X DELETE`, true);
            xhr.setRequestHeader("pragma", "no-cache");
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-PrettyPrint", "1");
            xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);
    
            xhr.onload = function () {
                if (xhr.status == 200) {
                    resolve('success'); 
                } else {
                    resolve('error:' + xhr.responseText); 
                }
            }
            xhr.send();
        });
    }

    api.requestRESTApi = function (url, callBack, errorCallBack) {

        var xhr = new XMLHttpRequest();
        xhr.open("GET", api.LoginInfor.domain + url, true);
        xhr.setRequestHeader("pragma", "no-cache");
        xhr.setRequestHeader("cache-control", "no-cache");
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
        xhr.open("PATCH", `${api.LoginInfor.domain}services/data/v46.0/sobjects/${objectName}/${objectId}`, true);
        xhr.setRequestHeader("pragma", "no-cache");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-PrettyPrint", "1");
        xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);

        xhr.onload = function () {
            if (xhr.status == 200 || xhr.status == 204) {
                callBack();
            } else {
                if (errorCallBack) {
                    errorCallBack(JSON.parse(xhr.responseText));
                }
            }
        }
        xhr.send(data);
    }

    api.requestSaveDataSync = function (objectName, objectId, data) {
        return new Promise((resolve) => {
            var xhr = new XMLHttpRequest();
            xhr.open("PATCH", `${api.LoginInfor.domain}services/data/v46.0/sobjects/${objectName}/${objectId}`, true);
            xhr.setRequestHeader("pragma", "no-cache");
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-PrettyPrint", "1");
            xhr.setRequestHeader("Authorization", "Bearer " + api.LoginInfor.sessionId);
    
            xhr.onload = function () {
                if (xhr.status == 200 || xhr.status == 204) {
                    resolve('success'); 
                } else {
                    resolve('error:' + xhr.responseText); 
                }
            }
            xhr.send(data);
        });
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

    api.getRecordPageUrl = function(id, callback){
      callback(`${SalesforceAPI.LoginInfor.domain}${id}`)
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

    api.loadAndSaveObjMap = function(userName, callback){
      var bkLogin = SalesforceAPI.LoginInfor;
      for (const login of SalesforceAPI.LoginInfors) {
        if(login.userName == userName){
          SalesforceAPI.LoginInfor = login;
          break;
        }
      }

      api._requestObjects((objMap)=>{
        ChromeAPI.saveLocalData(`cache_${userName}`, {lastGetTime:Date.now(), objMap:objMap}, ()=>{
          SalesforceAPI.LoginInfor = bkLogin;
          callback(objMap);
        });

      });
    }

    api.loadObjMap = function (callBack) {
      var cacheKey = `cache_${SalesforceAPI.LoginInfor.userName}`;
      ChromeAPI.getLocalData(cacheKey, function (d) {
        var d = d[cacheKey];
        if (d) {
          callBack(d.objMap);
        } else {
          api.loadAndSaveObjMap(SalesforceAPI.LoginInfor.userName, callBack);
        }
      });
    }

    api.getObjDef = function(objName , callBack){
        SalesforceAPI.requestRESTApi("services/data/v46.0/sobjects/" + objName + "/describe", function (json) {
            callBack(JSON.parse(json));
        });
    }

    api._requestObjects = function (callBack) {

      SalesforceAPI.requestRESTApi("services/data/v46.0/sobjects/", function (json) {
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
        r.fieldMap = {};
        r.childRelationships = obj.childRelationships;
        for (const f of obj.fields) {
          var ff = {};
          ff.name = f.name;
          ff.label = f.label;
          ff.custom = f.custom;
          ff.type = f.type;
          if(f.type=="reference"){
            ff.referenceTo = f.referenceTo[0];
          }
          ff.updateable = f.updateable;
          ff.nillable = f.nillable;
          ff.formula = f.calculatedFormula;
          if(!f.nillable && f.updateable){
            ff.mustInput = true;
          }else{
            ff.mustInput = false;
          }
          if(obj.name == 'User'){
            if(ff.name == 'OfflineTrialExpirationDate' 
               || ff.name == 'OfflinePdaTrialExpirationDate'
               || ff.name == 'UserPermissionsMarketingUser'
               || ff.name == 'UserPermissionsOfflineUser'
               ){
              continue;
            }
          }
          r.fields.push(ff);
          r.fieldMap[ff.name] = ff;
        }
      
        return r;
    }

    return api;

})();


Translater = function(txt){
    this.txt = txt;
}
Translater.prototype.translateToLabel = function(objMap, targetObj){
    let transMap = this.preparTransInfo(objMap);
    let words = this.getTransWords();

    for(let word of words){
        let ts = word.word.split(".");
        if(ts.length==1){
            let labels = transMap.get(word.word);
            if(labels){
                if(Array.isArray(labels)){
                    for(let label of labels){
                        if(label.objName == targetObj){
                            word.label = label.label;
                            break;
                        }
                    }
                }else{
                    if(labels.objName == targetObj){
                        word.label = labels.label;
                    }
                }
            }
        }else{
            let labels = [];
            let objList = [objMap[targetObj]];
            for(let i=0 ; i<ts.length-1 ; i++){
                let fieldName = ts[i].replaceAll("__r","__c");
                let field = objList[objList.length-1].fieldMap[fieldName];
                objList.push(objMap[field.referenceTo]);
            }
            for(let i=0 ; i<ts.length ; i++){
                let apiName = ts[i].replaceAll("__r","__c");
                let obj = objList[i];
                let field = obj.fieldMap[apiName];
                labels.push(field.label);
            }
            if(ts.length == labels.length){
                word.label = labels.join(".");
            }
        }
        
    }

    return words;
}
Translater.prototype.translateToName = function(objMap, targetObj){
    let obj = objMap[targetObj];
    let labelMap = {};
    for(let fd of obj.fields){
        labelMap[fd.label] = fd;
    }

    let words = [];
    let labels = [];
    for(let label in labelMap){
        let labelWord = `(${label.replaceAll("(","\\(").replaceAll(")","\\)")})`;
        if(label.indexOf(" ") < 0){
            labels.push(labelWord);
        }else{
            labels.unshift(labelWord);
        }
    }
    labels.sort(function(a, b){
        if(a.indexOf(" ") < 0){
            return b.length - a.length;
        }else{
            return 1;
        }
    });

    let regStr = labels.join("|");
    
    let reg = new RegExp(regStr, "g");
    let r = reg.exec(this.txt);
    while (r != null){
        words.push({word:r[0], index:r.index});
        r = reg.exec(this.txt);
    }
    
    for(let word of words){
        word.name = labelMap[word.word].name;
    }
    return words;
}
Translater.prototype.getTransWords = function(){
    let valueReg = /[a-zA-Z_0-9\$\.]+/gi;
    let words = [];
    let r = valueReg.exec(this.txt);
    while (r != null){
        words.push({word:r[0], index:r.index});
        r = valueReg.exec(this.txt);
    }
    return words;
}
Translater.prototype.preparTransInfo = function(objMap){
    // key:apiname, value:{label:xxx,objName:xxx}
    let transMap = new Map();
    for(const objName in objMap){
        let obj = objMap[objName];
        for(const field of obj.fields){
            if(transMap.has(field.name)){
                let v = transMap.get(field.name);
                if(Array.isArray(v)){
                    v.push({label:field.label,objName:obj.name});
                }else{
                    let newV = [];
                    newV.push(v);
                    newV.push({label:field.label,objName:obj.name});
                    transMap.set(field.name, newV);
                }
            }else{
                transMap.set(field.name, {label:field.label,objName:obj.name});
            }
        }
    }
    return transMap;
}

var SQLWrapper = function(sql){
    this.sql = sql;
    this.objName = null;
    this.labelSql = null;
    this.analysis();
}
SQLWrapper.prototype.analysis = function(){
    let sqlValue = this.sql.replace("\n"," ");
    let fromReg = /from\s+(\S+)/gi;
    let fromMatch = fromReg.exec(sqlValue);
    if(fromMatch.length > 1){
        this.objName = fromMatch[1];
    }
    //let items = (/SELECT\s+(.|\n+)\s+FROM\s+(.|\n+).+/gi).exec(sqlValue)[1];
}
SQLWrapper.prototype.getSelectItemList = function(){
    let sqlValue = this.sql.replace("\n"," ");
    let items = (/SELECT\s+(.+)\s+FROM.+/gi).exec(sqlValue)[1];
    if(!items || items.length<2){
        return [];
    }else{
        return items.replaceAll(/\s+/gi,"").split(",");
    }
}
SQLWrapper.prototype.translate = function(objMap){
    let transMap = this.preparTransInfo(objMap);
    let words = this.getTransWords();
    for(let word of words){
        let ts = word.word.split(".");
        if(ts.length==1){
            let labels = transMap.get(word.word);
            if(labels){
                if(Array.isArray(labels)){
                    for(let label of labels){
                        if(label.objName == this.objName){
                            word.label = label.label;
                            break;
                        }
                    }
                }else{
                    if(labels.objName == this.objName){
                        word.label = labels.label;
                    }
                }
            }
        }else{
            let labels = [];
            let objList = [objMap[this.objName]];
            for(let i=0 ; i<ts.length-1 ; i++){
                let fieldName = ts[i].replaceAll("__r","__c");
                let field = objList[objList.length-1].fieldMap[fieldName];
                objList.push(objMap[field.referenceTo]);
            }
            for(let i=0 ; i<ts.length ; i++){
                let apiName = ts[i].replaceAll("__r","__c");
                let obj = objList[i];
                let field = obj.fieldMap[apiName];
                labels.push(field.label);
            }
            if(ts.length == labels.length){
                word.label = labels.join(".");
            }
        }
        
    }
    let sqlValue = this.sql;
    for(let word of words){
        if(word.label){
            sqlValue = sqlValue.replace(word.word, word.label);
        }
    }
    sqlValue = sqlValue.replaceAll(this.objName, objMap[this.objName].label);
    return sqlValue;
}
SQLWrapper.prototype.getTransWords = function(){
    let valueReg = /[a-zA-Z_0-9\$\.]+/gi
    let words = [];
    let r = valueReg.exec(this.sql);
    while (r != null){
        words.push({word:r[0], index:r.index});
        r = valueReg.exec(this.sql);
    }
    return words;
}
SQLWrapper.prototype.preparTransInfo = function(objMap){
    // key:apiname, value:{label:xxx,objName:xxx}
    let transMap = new Map();
    for(const objName in objMap){
        let obj = objMap[objName];
        for(const field of obj.fields){
            if(transMap.has(field.name)){
                let v = transMap.get(field.name);
                if(Array.isArray(v)){
                    v.push({label:field.label,objName:obj.name});
                }else{
                    let newV = [];
                    newV.push(v);
                    newV.push({label:field.label,objName:obj.name});
                    transMap.set(field.name, newV);
                }
            }else{
                transMap.set(field.name, {label:field.label,objName:obj.name});
            }
        }
    }
    return transMap;
}

var ComFun = {}
// paramater: record ={Account__r:{LastModifiedDate:"xxx"}} colStr="Account__r.LastModifiedDate"
// return xxx
ComFun.getRefRecordValue = function (record, colStr){
    let ps = colStr.split('.');
    if(ps.length==1){
        return record[colStr];
    }else{
        let v = record;
        for(let pro of ps){
            if(!v) continue;
            v=v[pro];
        }
        return v;
    }
}
// colStr:Account__r.Test__r.CreatedDate
// record:
// {
//     "attributes":{
//        "type":"TestObject__c",
//     },
//     "Account__c":"0016F00002N4ldtQAB",
//     "Account__r":{
//        "attributes":{
//           "type":"Account",
//        },
//        "Test__c":"a0Q6F00000W0naJUAR",
//        "Test__r":{
//           "attributes":{
//              "type":"TestObject__c",
//           },
//           "CreatedDate":"2022-10-02T10:29:29.000+0000"
//        }
//     }
//  }
ComFun.getRefRecordField = function (record, colStr, objMap){
    let ps = colStr.split('.');
    if(ps.length==1){
        return objMap[record["attributes"].type].fieldMap[colStr];
    }else{
        let v = record;
        for(let i=0 ; i<ps.length-1; i++){
            v=v[ps[i]];
            if(v == null) return null;
        }
        return objMap[v["attributes"].type].fieldMap[ps[ps.length-1]];
    }
}
// 2022-10-24T07:17:35.000+0000 to 2022-10-24 07:17:35
ComFun.toComDateFormat = function (dateStr){
    if(!this.sfdcDateTimeReg){
        this.sfdcDateTimeReg = /(\d\d\d\d-\d\d-\d\d)T(\d\d:\d\d:\d\d)\.000\+0000/
    }
    let m = this.sfdcDateTimeReg.exec(dateStr);
    if(m){
        return `${m[1]} ${m[2]}`;
    }
    return dateStr;
}
// 2022-10-24 07:17:35 to 2022-10-24T07:17:35.000+0000
ComFun.toSFDCDataTimeFormat = function(dateStr){
    if(!this.comTimeReg){
        this.comTimeReg = /(\d\d\d\d-\d\d-\d\d) (\d\d:\d\d:\d\d)/
    }
    let m = this.comTimeReg.exec(dateStr);
    if(m){
        return `${m[1]}T${m[2]}.000+0000`;
    }
    return dateStr;
}


// window.resetIcon = function(){
//   var src = $(".tabFrame:visible")[0].contentWindow.location.href;
//   var sid = $(".menuDiv.selected").attr("id");
//   var nid = null;
//   if(src.indexOf("startPage/index") > 0){
//     nid = "search";
//   }else if(src.indexOf("objectRelations/index") > 0){
//     nid = "data";
//   }else if(src.indexOf("objDef/index") > 0){
//     nid = "data";
//   }else if(src.indexOf("record/index") > 0){
//     nid = "record";
//   }else if(src.indexOf("search/index") > 0){
//     nid = "sql";
//   }else if(src.indexOf("config/index") > 0){
//     nid = "config";
//   } 

//   if(sid != nid){
//     $(".menuDiv.selected").removeClass("selected");
//     $(`#${nid}`).addClass("selected");
//   }
  
// }

// $(()=>{
//   if(window.parent !== window){
//     window.parent.resetIcon();
//   }
// });