

var loginInfo = {};
$(function(){
  login(function(sessionId, domain, loginDoc){
    loginInfo.sessionId = sessionId;
    loginInfo.loginDoc = loginDoc;
    loginInfo.domain = domain;
    appData.loginInfo = loginInfo;

    console.log(sessionId);
    initData(sessionId);
    
  });
})

var appData = {objects:[]};
var v = new Vue({
  el: '#app',
  data: {appData:appData},
  methods: {
    toogleField : function(flg, obj){
        if(flg == true){
            obj.showField = true;
        }else{
            obj.showField = false;
        }
    }
  }
});

function initData(sessionId){
    getLocalData("objMap",function(d){
        if(d.objMap){
            var list = Object.values(d.objMap);
            list.forEach(obj => {
                obj.showField = false;
            });

            list.sort(function(a, b){
                if(a.isCustomObject && !b.isCustomObject){
                  return -1;
                }else{
                  return 1;
                }
            });
            appData.objects = list;

        }else{
            refreshLocalObjects(sessionId);
        }
    });
}

function refreshLocalObjects(sessionId){
    loadAllObjects(sessionId,function(objList){
        console.log(objList);
        //appData.objects = objList;

        //saveLocalData("objList", objList);
        refreshLocalFields(sessionId, objList, function(list){

            var objMap = {};
            list.forEach(obj => {
                obj.showField = false;
                objMap[obj.apiName] = obj;
            });

            list.sort(function(a, b){
                if(a.isCustomObject && !b.isCustomObject){
                  return -1;
                }else{
                  return 1;
                }
            });

            appData.objects = list;
            
            saveLocalData("objMap", objMap);
        });
    });
}

function refreshLocalFields(sessionId, objList, callBack){

    var totoalCount = objList.length;
    var counter = 0;
    objList.forEach(obj => {
        if(obj.customObjectId){
            loadField(sessionId, obj.customObjectId,function(fieldList){
                console.log(fieldList);
                obj.fields = fieldList;
                counter ++ ;
                if(counter >= totoalCount){
                    if(callBack){
                        callBack(objList);
                    }
                }
            });
        }else{
            loadField(sessionId, obj.apiName,function(fieldList){
                console.log(fieldList);
                obj.fields = fieldList;
                counter ++ ;
                if(counter >= totoalCount){
                    if(callBack){
                        callBack(objList);
                    }
                }
            });
        }
    });
}