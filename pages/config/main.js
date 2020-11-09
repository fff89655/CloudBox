//SalesforceAPI.login(init);

var CacheRow = function(){
  this.domain = null;
  this.userName = null;
  this.lastGetDataTime = null;
}


var parentWindow = window.parent;
var parentLoginInfor = parentWindow.g_getLoginInfor();
SalesforceAPI.LoginInfors = parentLoginInfor.LoginInfors;
SalesforceAPI.LoginInfor = parentLoginInfor.LoginInfor;

var appData = {cacheDatas:null, cacheLoading:false};

function init(){
  var vue = new Vue({
    el: '#app',
    data: appData,
    methods: {
      getCache : (cr)=>{
        appData.cacheLoading = true;
        BaseAPI.loadAndSaveObjMap(cr.userName, ()=>{
          appData.cacheLoading = false;
          getCacheData();
        });
      },
      clearAll : ()=>{
        ChromeAPI.clearLocalData(()=>{
          getCacheData();
        });
      }
    }
  });
  getCacheData();
}

function getCacheData(){
  var cacheDatas = [];

  SalesforceAPI.LoginInfors.forEach(loginInfor => {
    var cr = new CacheRow();
    cr.domain = loginInfor.domain;
    cr.userName = loginInfor.userName;

    var dataKey = `cache_${cr.userName}`;

    ChromeAPI.getLocalData(dataKey, (d)=>{
      var d = d[dataKey];
      if(d && d.lastGetTime){
        cr.lastGetDataTime = new Date(d.lastGetTime).getYYMMDDHHMMSS();
      }
      cacheDatas.push(cr);
      appData.cacheDatas = cacheDatas;
    });
  });
}

init();
