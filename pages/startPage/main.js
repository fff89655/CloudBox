
var parentWindow = window.parent;
var parentLoginInfor = parentWindow.g_getLoginInfor();
SalesforceAPI.LoginInfors = parentLoginInfor.LoginInfors;
SalesforceAPI.LoginInfor = parentLoginInfor.LoginInfor;

var appData = {objMap:[]};

function init(){
  var v = new Vue({
    el: '#app',
    data: {appData:appData},
    methods: {
    }
  });
}


function loadData(){
  BaseAPI.loadObjMap(function(objMap){
    appData.objMap = objMap;
    init();
  });
}
loadData();