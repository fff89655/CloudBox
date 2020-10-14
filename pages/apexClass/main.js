
SalesforceAPI.login(initData);

function getFormateDate(d){
  return d.getFullYear()  + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +
  d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

function initData(){
  appData.loginInfo = SalesforceAPI.LoginInfo;
  SalesforceAPI.requestToolingApi(
    "SELECT Id, NamespacePrefix, Name, ApiVersion, Status, IsValid, BodyCrc, LengthWithoutComments,LastModifiedDate,LastModifiedBy.Name FROM ApexClass ORDER BY LastModifiedDate DESC"
    , function(d){

        var list = [];
        for(var i=0 ; i<d.size ; i++){
          var apexClass = d.records[i];
          apexClass.ModifiedDate = getFormateDate(new Date(apexClass.LastModifiedDate));
          list.push(apexClass);
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