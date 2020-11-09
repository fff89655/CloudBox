var parentWindow = window.parent;
var parentLoginInfor = parentWindow.g_getLoginInfor();
SalesforceAPI.LoginInfors = parentLoginInfor.LoginInfors;
SalesforceAPI.LoginInfor = parentLoginInfor.LoginInfor;

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
          SalesforceAPI.getObjPageUrl(obj.name,(url)=>{
            window.open(url);
          });
        },
        onDetailClick : function (obj){
          var param = `objectName=${obj.name}'`;
          window.parentWindow.g_openTabFromId('objDef', param);
        },
        onDataClick: function (obj) {
          var param = `objectName=${obj.name}&initTab=dataTab'`;
          window.parentWindow.g_openTabFromId('objDef', param);
        },
        onFieldRefClick: function (obj, field) {
          SalesforceAPI.getFieldPageUrl(obj.name, field.name, (url)=>{
            window.open(url);
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
initData();