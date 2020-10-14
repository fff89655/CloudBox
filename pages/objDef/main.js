
SalesforceAPI.login(init);

function init(){
    var url = new URL(window.location.href);
    var objectName = url.searchParams.get("objectName");
    BaseAPI.getObjDef(objectName, function(r){
        
        document.title = r.label + "_オブジェクト";

        var fields = r.fields;
                
        fields.sort(function(a, b){
            if(a.label.length < b.label.length){
                return -1;
            }else{
                return 1;
            }
        });

        appData.object = r;
        getDataCount(r);
    });
}

function getDataCount(obj){
    SalesforceAPI.requestData(`SELECT count() FROM ${obj.name}`,function(r){
        appData.dataCount = r.totalSize;
    })
}

var url = new URL(window.location.href);
var initTab = url.searchParams.get("initTab");

var cmpCreateFlg = {itemTab:false,dataTab:false,relationTab:false,layoutTab:false};
if(initTab){
    cmpCreateFlg[initTab] = true;
}else{
    cmpCreateFlg.itemTab = true;
}

var appData = {object:{},dataCount:null, cmpCreateFlg:cmpCreateFlg, selectedTab:(initTab?initTab:"itemTab")};
var v = new Vue({
  el: '#app',
  data: {appData:appData},
  methods: {
    tabClick:function(e){
        var selectedTab = $(".selectedTab");
        selectedTab.removeClass("selectedTab");
        $(e.target).addClass("selectedTab");
        for(var k in this.appData.tabStatus){
            this.appData.tabStatus[k] = false;
        }
        var tabKey = $(e.target).attr("tabKey");
        var tabDiv = $("#" + tabKey);
        if(tabDiv.is(":visible")){
            tabDiv.hide();
        }else{
            tabDiv.show();
        }
        
        $("#" + selectedTab.attr("tabKey")).hide();
        
        if(appData.cmpCreateFlg[tabKey] == false){
            appData.cmpCreateFlg[tabKey] = true;
        }
    }
  }
});