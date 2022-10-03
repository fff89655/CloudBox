
let items = ["Type","BillingStreet","BillingCity","BillingState","BillingPostalCode"];
let items2 = [{value:"MasteTyperRecordId",label:"取引先 種別"},
              {value:"BillingStreet",label:"町名・番地(請求先)"},
              {value:"BillingCity",label:"市区郡(請求先)"},
              {value:"BillingState",label:"都道府県(請求先)"},
              {value:"BillingPostalCode",label:"郵便番号(請求先)"}];

var appData = {items:items,items2:items2,items3:[]};

var vue = new Vue({
    el: '#app',
    data: appData,
    methods: {
    }
  });

SalesforceAPI.login(init);

function init(){
  
  appData.loginInfors = SalesforceAPI.LoginInfors;
  appData.loginInfor = SalesforceAPI.LoginInfor;

  BaseAPI.loadObjMap(function(objMap){
        
    appData.objMap = objMap;
    appData.object = objMap.Account;

    let items3 = [];
    for(let f of appData.object.fields){
        items3.push({value:f.name,label:f.label});
    }
    appData.items3 = items3;
    
  });
}
