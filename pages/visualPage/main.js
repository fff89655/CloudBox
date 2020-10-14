
SalesforceAPI.login(initData);

function getFormateDate(d){
  return d.getFullYear()  + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
  d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

function initData(){
  appData.loginInfo = SalesforceAPI.LoginInfo;
  SalesforceAPI.requestToolingApi(
    "SELECT Id, NamespacePrefix, Name, ApiVersion, MasterLabel, Description, ControllerType, ControllerKey, IsAvailableInTouch, IsConfirmationTokenRequired,LastModifiedDate,LastModifiedBy.Name FROM ApexPage ORDER BY LastModifiedDate DESC"
    , function(d){

        var list = [];
        for(var i=0 ; i<d.size ; i++){
          var apexPage = d.records[i];
          apexPage.ModifiedDate = getFormateDate(new Date(apexPage.LastModifiedDate));
          list.push(apexPage);
        }
        appData.objects = list;
    }
  );
}

var appData = {objects:[], loginInfo:{domain:""}};
var v = new Vue({
  el: '#app',
  data: {appData:appData},
  methods: {
  }
});