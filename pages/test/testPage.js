SalesforceAPI.login(init);

var appData = {};

function init(){
  
  appData.loginInfors = SalesforceAPI.LoginInfors;
  appData.loginInfor = SalesforceAPI.LoginInfor;

  SalesforceAPI.requestData('SELECT Id,Name FROM User' , function(r){
   let datas = [];
   for(let row of r.records){
    datas.push({Id:row.Id,
                Name:row.Name});
   }
   appData.datas = datas;

   var vue = new Vue({
     el: '#app',
     data: appData,
     methods: {}
   });
  });


}
