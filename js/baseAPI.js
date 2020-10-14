// usege level APIs


var LoginInfo = { sessionId: null, domain: null };
//////////////////////////////////////////////////////////////////////////
function requestRESTApi(url, callBack) {

  var xhr = new XMLHttpRequest();
  xhr.open("GET", LoginInfo.domain + url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("X-PrettyPrint", "1");
  xhr.setRequestHeader("Authorization", "Bearer " + LoginInfo.sessionId);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      callBack(xhr.response);
    }
  }
  xhr.send();
}

//////////////////////////////////////////////////////////////////////////
function requestData(soql, callBack) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", LoginInfo.domain + "services/data/v43.0/query?q=" + soql.replace(" " + "+"), true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("X-PrettyPrint", "1");
  xhr.setRequestHeader("Authorization", "Bearer " + LoginInfo.sessionId);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && callBack) {
      callBack(JSON.parse(xhr.responseText));
    }
  }
  xhr.send();
}

//////////////////////////////////////////////////////////////////////////
function requestSaveData(objectName, objectId, data, callBack) {
  var xhr = new XMLHttpRequest();
  xhr.open("PATCH", `${LoginInfo.domain}services/data/v43.0/sobjects/${objectName}/${objectId}`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("X-PrettyPrint", "1");
  xhr.setRequestHeader("Authorization", "Bearer " + LoginInfo.sessionId);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      callBack();
    }
  }
  xhr.send(data);
}


//////////////////////////////////////////////////////////////////////////
function requestCreateData(objectName, data, callBack, errorCallBack) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", `${LoginInfo.domain}services/data/v43.0/sobjects/${objectName}`, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("X-PrettyPrint", "1");
  xhr.setRequestHeader("Authorization", "Bearer " + LoginInfo.sessionId);

  xhr.onload = function () {
    if (xhr.status == 201) {
      callBack(JSON.parse(xhr.responseText));
    } else {
      errorCallBack(JSON.parse(xhr.responseText));
    }
  }
  xhr.send(data);
}

//////////////////////////////////////////////////////////////////////////
// function requestData(sessionId, soql, callBack){
//   //https://shoei--dev201808.cs31.my.salesforce.com/services/Soap/T/43.0

//   var xhr = new XMLHttpRequest();
//   xhr.open("GET", "https://shoei--dev201808.cs31.my.salesforce.com/services/data/v43.0/query?q=SELECT+Id,Name+FROM+User", true);
//   xhr.setRequestHeader("Content-Type","application/json");
//   xhr.setRequestHeader("X-PrettyPrint","1");
//   xhr.setRequestHeader("Authorization","Bearer 00D6F000001OOG8!AQwAQLfy43OoHn9SBoBzYXm70FTa1wduDVrGbfVlai.FSUd0rGd6NIJziincfNOYTFnLNxg6Y9pr9GgTQU4oESZkltiwRdoo");

//   xhr.onreadystatechange = function() {
//     if (xhr.readyState == 4) {
//       var xmlDoc = xhr.responseXML;

//       callBack(xmlDoc,xhr.responseText);
//     }
//   }
//   xhr.send();
// }


//////////////////////////////////////////////////////////////////////////
function requestToolingApi(soql, callBack) {
  //https://shoei--dev201808.cs31.my.salesforce.com/services/Soap/T/43.0

  var xhr = new XMLHttpRequest();
  xhr.open("POST", LoginInfo.domain + "services/Soap/T/43.0", true);
  xhr.setRequestHeader("Content-Type", "text/xml");
  xhr.setRequestHeader("soapAction", "Wololo");

  var sendStr = `<v:Envelope xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:d="http://www.w3.org/2001/XMLSchema" xmlns:c="http://schemas.xmlsoap.org/soap/encoding/" xmlns:v="http://schemas.xmlsoap.org/soap/envelope/">
  <v:Header>
    <n0:SessionHeader xmlns:n0="urn:tooling.soap.sforce.com">
      <n0:sessionId>${LoginInfo.sessionId}</n0:sessionId>
    </n0:SessionHeader>
  </v:Header>
  <v:Body>
    <n1:query id="o0" c:root="1" xmlns:n1="urn:tooling.soap.sforce.com">
      <parameters>
      ${soql}
    </parameters>
    </n1:query>
  </v:Body>
  </v:Envelope>`;
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      var xmlDoc = xhr.responseXML;

      callBack(xmlDoc, xhr.responseText);
    }
  }
  xhr.send(sendStr);
}

//////////////////////////////////////////////////////////////////////////
function requestEnterpriseApi(sessionId, soql, callBack) {

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://shoei--dev201808.cs31.my.salesforce.com/services/Soap/c/10.0 HTTP/1.1", true);
  xhr.setRequestHeader("Content-Type", "text/xml");
  xhr.setRequestHeader("soapAction", "Wololo");

  var sendStr = `<?xml version="1.0" encoding="utf-8"?>   
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
   xmlns:urn="urn:enterprise.soap.sforce.com">
  <soapenv:Header>
     <urn:SessionHeader>
        <urn:sessionId>${sessionId}</urn:sessionId>
     </urn:SessionHeader>
  </soapenv:Header>
  <soapenv:Body>
     <urn:query>
        <urn:queryString>${soql}</urn:queryString>
     </urn:query>
  </soapenv:Body>
</soapenv:Envelope>`;
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      var xmlDoc = xhr.responseXML;

      callBack(xmlDoc, xhr.responseText);
    }
  }
  xhr.send(sendStr);
}



//////////////////////////////////////////////////////////////////////////
function login(callBack) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://test.salesforce.com/services/Soap/c/43.0/", true);
  xhr.setRequestHeader("Content-Type", "text/xml");
  xhr.setRequestHeader("soapAction", "Wololo");

  var sendStr = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:enterprise.soap.sforce.com">
  <soapenv:Header>
  </soapenv:Header>
  <soapenv:Body>
    <urn:login>
      <urn:username>xxx</urn:username>
      <urn:password>ddd</urn:password>5
    </urn:login>
  </soapenv:Body>
</soapenv:Envelope>`;
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      // WARNING! Might be evaluating an evil script!
      var xmlDoc = xhr.responseXML;

      var sessionIdEl = $(xmlDoc).find("sessionId");
      var serverUrl = $(xmlDoc).find("serverUrl")[0].innerHTML;
      var domain = serverUrl.substring(0, serverUrl.indexOf("salesforce.com/") + "salesforce.com/".length);
      var sessionId = sessionIdEl[0].innerHTML;

      LoginInfo.sessionId = sessionId;
      LoginInfo.domain = domain;

      saveLocalData("LoginInfo", LoginInfo);

      if (callBack) callBack(sessionId, domain, xmlDoc);
    }
  }
  xhr.send(sendStr);
}

function loadObjMap(callBack) {
  getLocalData("objMap", function (d) {
    if (d.objMap) {
      callBack(d.objMap);
    } else {
      refreshLocalObjects(function(objMap){
        callBack(objMap);
      })
    }
  });

}

function loadAllObjects(sessionId, callBack) {
  requestToolingApi(sessionId, `
  SELECT Id,Label,DeveloperName,NamespacePrefix
  FROM EntityDefinition 
  WHERE IsSearchable = true
    AND IsIdEnabled = true AND IsQueryable = true AND IsEverCreatable = true`,
    function (entityDoc, text) {
      requestToolingApi(sessionId, 'SELECT Id,DeveloperName FROM CustomObject', function (customObjectDoc, text) {
        var objList = formatObject(entityDoc, customObjectDoc);
        if (callBack) {
          callBack(objList);
        }
      })
    })
}

function formatObject(entityDoc, customObjectDoc) {

  var entityList = [];
  var customObjectList = [];

  $(entityDoc).find("result").children("records").each(function () {
    //console.log($(this).find("sf\\:DeveloperName").html());
    entityList.push({
      name: $(this).find(">sf\\:DeveloperName").html(),
      label: $(this).find(">sf\\:Label").html(),
      isCreatable: $(this).find(">sf\\:IsCreatable").html(),
      namespacePrefix: $(this).find(">sf\\:NamespacePrefix").html()
    });
  });
  $(customObjectDoc).find("result").children("records").each(function () {
    //console.log($(this).find("sf\\:DeveloperName").html());
    customObjectList.push({
      name: $(this).find(">sf\\:DeveloperName").html(),
      id: $(this).find(">sf\\:Id").html()
    });
  });

  var customObjectMap = {};

  customObjectList.forEach(customObject => {
    customObjectMap[customObject.name] = customObject;
  });

  var objList = [];

  entityList.forEach(entity => {
    if (customObjectMap[entity.name]) {
      entity.isCustomObject = true;
      entity.apiName = entity.name + "__c";
      entity.customObjectId = customObjectMap[entity.name].id;
    } else {
      entity.apiName = entity.name;
    }
    if (entity.apiName != null && entity.apiName != "") {
      objList.push(entity);
    }
  });

  // objList.sort(function(a, b){
  //     if(a.isCustomObject && !b.isCustomObject){
  //       return -1;
  //     }else{
  //       return 1;
  //     }
  // });

  return objList;
}


//////////////////////////////////////////////////////////////////////////
function loadField(sessionId, objectId, callBack) {

  requestToolingApi(sessionId, "SELECT Id,Label,DeveloperName,DataType, (Select DataType From Particles) FROM FieldDefinition WHERE EntityDefinitionId='" + objectId + "'", function (fieldDoc, text) { //SELECT Id,DeveloperName,ExternalName FROM CustomObject


    requestToolingApi(sessionId, "SELECT Id,DeveloperName FROM CustomField WHERE TableEnumOrId='" + objectId + "'", function (customFieldDoc, text) { //SELECT Id,DeveloperName,ExternalName FROM CustomObject

      //console.log(text);
      var fieldList = formatField(fieldDoc, customFieldDoc);
      if (callBack) {
        callBack(fieldList);
      }
    })
    //console.log(text);
  })
}


//////////////////////////////////////////////////////////////////////////
function formatField(fieldDoc, customFieldDoc) {

  var fieldList = [];
  var customFieldList = [];

  $(fieldDoc).find("result").children("records").each(function () {
    //console.log($(this).find("sf\\:DeveloperName").html());
    fieldList.push({
      name: $(this).find(">sf\\:DeveloperName").html(),
      label: $(this).find(">sf\\:Label").html(),
      type: $(this).find(">sf\\:DataType").html(),
      typeEnum: $(this).find(">sf\\:Particles sf\\:DataType").html()
    });
  });
  $(customFieldDoc).find("result").children("records").each(function () {
    //console.log($(this).find("sf\\:DeveloperName").html());
    customFieldList.push({
      name: $(this).find(">sf\\:DeveloperName").html(),
      id: $(this).find(">sf\\:Id").html()
    });
  });

  var customFieldMap = {};

  customFieldList.forEach(customObject => {
    customFieldMap[customObject.name] = customObject;
  });

  var resultList = [];

  fieldList.forEach(field => {
    if (customFieldMap[field.name]) {
      field.isCustom = true;
      field.apiName = field.name + "__c";
      field.customFieldId = customFieldMap[field.name].id;
    } else {
      field.apiName = field.name;
    }
    resultList.push(field);
  });

  resultList.sort(function (a, b) {
    if (a.isCustom && !b.isCustom) {
      return -1;
    } else {
      return 1;
    }
  });

  return resultList;
}


//////////////////////////////////////////////////////////////////////////
function getObjects(obj) {
  var r = {};
  r.label = obj.label;
  r.name = obj.name;
  r.custom = obj.custom;
  r.keyPrefix = obj.keyPrefix;
  r.fields = [];
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











//////////////////////////////////////////////////////////////////////////
function refreshLocalObjects(callBack) {

  requestRESTApi("services/data/v37.0/sobjects/", function (json) {
    var r = JSON.parse(json);

    var objs = [];

    r.sobjects.forEach(obj => {
      if (obj.queryable && obj.retrieveable && obj.updateable && obj.name.indexOf("__Share") == -1) {
        objs.push(obj);
      }
    });


    objs.sort(function (a, b) {
      if (a.custom && !b.custom) {
        return -1;
      } else {
        return 1;
      }
    });

    refreshLocalFields(objs, function (list) {

      console.log(list);

      var objMap = {};

      list.forEach(obj => {
        obj.showField = false;
        objMap[obj.name] = getObjects(obj);
      });

      saveLocalData("objMap", objMap);

      if(callBack){
        callBack(objMap);
      }

      var list = Object.values(objMap);
      list.forEach(obj => {
        obj.showField = false;
      });

      list.sort(function (a, b) {
        if (a.custom && !b.custom) {
          return -1;
        } else {
          return 1;
        }
      });
      appData.objects = list;

    });
  });

}

//////////////////////////////////////////////////////////////////////////
function refreshLocalFields(objs, callBack) {

  var totoalCount = objs.length;
  var counter = 0;

  var objList = [];
  objs.forEach(obj => {
    requestRESTApi(obj.urls.describe, function (json) {
      var r = JSON.parse(json);
      objList.push(r);

      counter++;
      if (counter >= totoalCount) {
        callBack(objList);
      }

    });

  });
}


//////////////////////////////////////////////////////////////////////////
//chrome.storage.local.set({"bbb":"test"});
function saveLocalData(keyVal, saveVal, callback) {
  var v = {};
  v[keyVal] = saveVal;
  chrome.storage.local.set(v);
}

//////////////////////////////////////////////////////////////////////////
//chrome.storage.local.get(["bbb"],function(r){console.log(r)});
function getLocalData(keyVal, callback) {
  var paramKey = keyVal;
  chrome.storage.local.get([keyVal], callback);
}

//////////////////////////////////////////////////////////////////////////
function removeLocalData(keyVal, callback) {
  chrome.storage.local.remove([keyVal], function () {
    if (callback) {
      callback();
    }
  });
}

//////////////////////////////////////////////////////////////////////////
function clearLocalData() {
  chrome.storage.local.clear();
}