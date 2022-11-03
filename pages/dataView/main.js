var parentWindow = window.parent;
var parentLoginInfor = parentWindow.g_getLoginInfor();
SalesforceAPI.LoginInfors = parentLoginInfor.LoginInfors;
SalesforceAPI.LoginInfor = parentLoginInfor.LoginInfor;


var appData = {datas:[], selectItems:[], input:{objName:null}, searchObj:null, objItems:[],
               fieldSelect:{cmpName:null, show:false, fieldSelectProp:{object:null,selectedFieldNames:null,width:800,height:500},},
               upsert:{show:false},
               matrix:{width:0, height:0}
              };
var objMap = null;

function init(){
  initFieldItems();
  var v = new Vue({
    el: '#app',
    data: appData,
    methods: {
    }
  });
}


function loadData(){
  BaseAPI.loadObjMap(function(objMapP){
    appData.objMap = objMapP;
    objMap = objMapP;

    init();
  });
}
loadData();

