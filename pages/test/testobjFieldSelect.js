SalesforceAPI.login(init);

var appData = {objMap:null, object:null};

function init(){
  
  appData.loginInfors = SalesforceAPI.LoginInfors;
  appData.loginInfor = SalesforceAPI.LoginInfor;

  BaseAPI.loadObjMap(function(objMap){
        
    appData.objMap = objMap;
    appData.object = objMap.Account;

    var vue = new Vue({
        el: '#app',
        data: appData,
        methods: {}
    });
    
  });


}
