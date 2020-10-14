SalesforceAPI.login(initData);

var appData = { objects: [], pickList: {}, pickVal: [] };
var v = new Vue({
    el: '#app',
    data: { appData: appData },
    methods: {
        toogleField: function (flg, obj) {
            if (flg == true) {
                obj.showField = true;
            } else {
                obj.showField = false;
            }
        },
        pickUp: function (obj) {
            var pickItems = [];
            obj.fields.forEach(f => {
                pickItems.push(f.label);
            });
            var pickMap = {};

            obj.fields.forEach(f => {
                if (!pickMap[f.label.length]) {
                    pickMap[f.label.length] = [];
                }
                pickMap[f.label.length].push(f);
            });


            var maxIndex = 0;
            Object.values(pickMap).forEach(f => {
                f.forEach(ff => {
                    if (ff.label.length > maxIndex) {
                        maxIndex = ff.label.length;
                    }
                });
            });

            var indexArr = [];
            for (let index = 0; index < maxIndex; index++) {
                indexArr.push(index);
            }

            console.log(pickMap);

            appData.pickList = { keys: Object.keys(pickMap), values: pickMap, indexArr: indexArr };

            console.log(appData.pickList);

            $("#pickModel").show();
        },
        onRefClick: function (obj) {
            if(obj.custom){
                var searchName = obj.name.replace("__c","");
                if(searchName.indexOf("__") != -1){
                    searchName = searchName.substring(searchName.indexOf("__") + 2 , searchName.length);
                }
                
                SalesforceAPI.requestToolingApi("SELECT Id,DeveloperName FROM CustomObject WHERE DeveloperName='" + searchName + "'" ,function(doc,text){
                    var s = doc.records[0].Id;
                    window.open(SalesforceAPI.LoginInfo.domain + s+ "?setupid=CustomObjects");
                });
            }else{
                window.open(SalesforceAPI.LoginInfo.domain + "p/setup/layout/LayoutFieldList?type=" + obj.name);
    
            }
        },
        onFieldRefClick: function (obj, field) {

            var searchName = obj.name.replace("__c", "");
            if (searchName.indexOf("__")) {
                searchName = searchName.substring(searchName.indexOf("__") + 2, searchName.length);
            }

            SalesforceAPI.requestToolingApi("SELECT Id,DeveloperName FROM CustomObject WHERE DeveloperName='" + searchName + "'", function (doc, text) {
                var objId = $(doc).find("sf\\:Id").html();

                var fieldSearchName = field.name.replace("__c", "");
                if (fieldSearchName.indexOf("__")) {
                    fieldSearchName = fieldSearchName.substring(fieldSearchName.indexOf("__") + 2, fieldSearchName.length);
                }
    
                SalesforceAPI.requestToolingApi(`SELECT Id FROM CustomField WHERE TableEnumOrId='${objId}' AND DeveloperName ='${fieldSearchName}'`, function (customFieldDoc, text) { //SELECT Id,DeveloperName,ExternalName FROM CustomObject

                    var objId = $(customFieldDoc).find("sf\\:Id").html();

                    window.open(SalesforceAPI.LoginInfo.domain + objId);
                });
            });

        }
    }
});


function initData() {

    BaseAPI.loadObjMap(function (objMap) {
        var list = Object.values(objMap);
        list.forEach(obj => {
            obj.showField = false;
        });

        list.sort(function (a, b) {
            if (a.custom && !b.custom) {
                return -1;
            } else {
                return 1;
            }
        });
        appData.objects = list;
    });
}