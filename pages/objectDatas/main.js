

SalesforceAPI.login(init);

function init(){
    BaseAPI.loadObjMap(function(objMap){
        appData.objMap = objMap;
        loadDatas(objMap);
    });
}

function loadDatas(objMap){
    var url = new URL(window.location.href);
    var objectName = url.searchParams.get("objectName");


    var objDef = objMap[objectName];

    appData.name = objDef.name;
    appData.label = objDef.label;

    var selectItems = [];
    objDef.fields.forEach(field => {
        selectItems.push({name:field.name,
                            label:field.label,
                            field:field,
                            selected:true});
    });

    for (let index = 0; index < selectItems.length; index++) {
        const item = selectItems[index];
        item.sort = index;
    }

    var config = {};

    var titleInfo = [];

    titleInfo.push({name:"action", label:"action"});

    selectItems.forEach(item => {
        titleInfo.push({name:item.name, label:item.label});
    });

    config.titleInfo = titleInfo;

    

    appData.selectItems = selectItems;



    var selectItemStr = selectItems.map(function(elem){
                            return elem.name;
                        }).join(",");

    var soql = `SELECT ${selectItemStr} FROM ${objectName}`;

    console.log(soql);

    SalesforceAPI.requestData(soql, function(jsonData){
        appData.config = config;
        jsonData.records.forEach(row => {
            row.action=`<a href='/pages/record/index.html?id=${row.Id}' target='_blank'>detail</a>`;
        });
        appData.datas = jsonData.records;
        console.log(jsonData);
    });
}

var appData = {datas:[], selectItems:[], config:null};
var v = new Vue({
  el: '#app',
  data: {appData:appData},
  methods: {
    topField:function(clickItem){
        var minSort = 0;
        appData.selectItems.forEach(item => {
            if(item.sort < minSort){
                minSort = item.sort;
            }
        });
        minSort--;
        clickItem.sort = minSort;
        
        var selectItems = appData.selectItems;
        selectItems.sort(function(a, b){
            if(a.sort < b.sort){
                return -1;
            }else{
                return 1;
            }
        });
        appData.selectItems = selectItems;
    },
    resetTopField:function(clickItem){
        clickItem.sort = 0;
        
        var selectItems = appData.selectItems;
        selectItems.sort(function(a, b){
            if(a.sort < b.sort){
                return -1;
            }else{
                return 1;
            }
        });
        appData.selectItems = selectItems;
    },
    showAllCustom:function(clickItem){
        
        var selectItems = appData.selectItems;

        for (let index = 0; index < selectItems.length; index++) {
            const item = selectItems[index];
            if(item.field.custom){
                item.sort = -(index+1);
            }else{
                item.sort = index;
            }
        }

        selectItems.sort(function(a, b){
            if(a.sort < b.sort){
                return -1;
            }else{
                return 1;
            }
        });
        appData.selectItems = selectItems;
    },
    showSystemCustom:function(clickItem){
        
        var selectItems = appData.selectItems;

        for (let index = 0; index < selectItems.length; index++) {
            const item = selectItems[index];
            if(!item.field.custom){
                item.sort = -(index+1);
            }else{
                item.sort = index;
            }
        }

        selectItems.sort(function(a, b){
            if(a.sort < b.sort){
                return -1;
            }else{
                return 1;
            }
        });
        appData.selectItems = selectItems;
    }
  }
});