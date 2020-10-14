ChromeAPI.getLocalData("LoginInfo", function(d){
  if(d.LoginInfo){
    appData.domain = d.LoginInfo.domain;
    appData.userName = d.LoginInfo.userName;
    appData.password = d.LoginInfo.password;
    appData.organizationId = d.LoginInfo.organizationId;
  }
});


var appData = {domain:"", userName:"", password:"", organizationId:""};

var v = new Vue({
    el: '#app',
    data: { appData:appData },
    methods: {
      login: function(){
        SalesforceAPI.loginForOption(appData.userName, appData.password, appData.domain, appData.organizationId,
          function(){
            alert("login success!");
          },
          function(){
            alert("login fault!");
          }
        );
      }
    }
});
