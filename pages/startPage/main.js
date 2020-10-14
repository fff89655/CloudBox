
SalesforceAPI.login(init);

function init(){
    BaseAPI.loadObjMap(function(objMap){
        appData.objMap = objMap;
        onLoad();
    });
}

function onLoad(){
    var v = new Vue({
      el: '#app',
      data: {appData:appData},
      methods: {
      }
    });
}

var appData = {objMap:[]};