
SalesforceAPI.login(init);

function init(){
    BaseAPI.loadObjMap(function(objMap){
        
        Object.values(objMap).forEach(obj => {
            objPrefix[obj.keyPrefix] = obj;
        });

        appData.objMap = objMap;

            
        var url = new URL(window.location.href);
        var id = url.searchParams.get("id");
        if(id){
            appData.idVal = id;
            vue.onSearchClick();
        }

    });
}

function xxx(){
    BaseAPI.getObjDef("ADC_JobRequest__c",function(r){
        debugger;
    })
}

var objPrefix = {};

var appData = { idVal: "006p0000005BpqXAAS", 
                objectName: "", 
                recordData:null, 
                selectItems:[], 
                editItemName:{}, 
                objMap:null, 
                selectObj:null ,
                errMsg:null
                ,reference:[]};

var vue = new Vue({
    el: '#app',
    data: { appData: appData },
    methods: {
        onSearchClick: function () {
            if(this.appData.idVal.length < 3){
                return;
            }
            var obj = objPrefix[this.appData.idVal.substring(0,3)];
            if(obj){
                appData.objectName = obj.name;
            }
            
            var selectItems = {};

            obj.fields.forEach(f => {
                selectItems[f.name] = f;
            });

            var soql = `SELECT ${Object.keys(selectItems).join(",")} FROM ${appData.objectName} WHERE Id='${appData.idVal}'`;

            var me = this;
            SalesforceAPI.requestData(soql ,function(r){
                if(r.totalSize == 1){
                    appData.recordData = r.records[0];

                    me.setReference(obj, appData.recordData);

                    selectItems = Object.values(selectItems);

                    selectItems.sort(function(a, b){
                        if(a.name == "Id" || a.name == "Name"){return -1;}
                        
                        if(a.label.length <= b.label.length){
                            return -1;
                        }else{
                            return 1;
                        }
                    });

                    appData.selectItems = selectItems;
                }
                console.log(r);
            });

        },
        setReference : function(obj, record){
            var reference = [];
            obj.fields.forEach(f => {
                if(f.type=="reference"){
                    var r = {name:f.name, json:JSON.stringify(f)};
                    if(record[f.name]){
                        r.value = record[f.name];

                        if(r.value.length > 3){
                            var obj = objPrefix[r.value.substring(0,3)];
                            if(obj){
                                r.refType = obj;
                            }
                        }
                    }
                    reference.push(r);
                }
            });
            appData.reference = reference;
        },
        onValueChange : function(e, name){
            $(e.target).parent().addClass('editOver');
            appData.editItemName[name] = true
        },
        onSaveClick : function(){
            var updateObj = {};
            Object.keys(appData.editItemName).forEach(k => {
                updateObj[k] = appData.recordData[k];
            });
            console.log(updateObj);
            if(appData.recordData.Id){
                SalesforceAPI.requestSaveData(appData.objectName, appData.recordData.Id, JSON.stringify(updateObj) ,function(){
                    alert("save over.")
                });
            }else{
                SalesforceAPI.requestCreateData(appData.selectObj, JSON.stringify(appData.recordData) ,function(r){
                    console.log(r);
                    appData.recordData.Id = r.id;
                    appData.recordData = appData.recordData;
                    alert("save success");
                    appData.errMsg = null;
                },function(r){
                    console.log(r);
                    appData.errMsg = JSON.stringify(r) ;
                });
            }
        },
        onCreateClick : function(){
            if(appData.selectObj && appData.objMap[appData.selectObj]){
                    
                appData.objectName = appData.selectObj;

                var selectItems = {};

                appData.objMap[appData.selectObj].fields.forEach(f => {
                    selectItems[f.name] = f;
                });

                selectItems = Object.values(selectItems);
                selectItems.sort(function(a, b){
                    if(a.name == "Id" || a.name == "Name"){return -1;}
                    
                    if(a.label.length <= b.label.length){
                        return -1;
                    }else{
                        return 1;
                    }
                });

                appData.selectItems = selectItems;
                
                appData.recordData = {};
            }
        },
        onCopyClick : function(){
            
            var updateObj = {};
            appData.selectItems.forEach(item => {
                if(item.updateable){
                    updateObj[item.name] = appData.recordData[item.name];
                }
            });
            
            appData.recordData.Id = null;
            SalesforceAPI.requestCreateData(appData.objectName, JSON.stringify(updateObj) ,function(r){
                console.log(r);
                appData.recordData.Id = r.id;
                appData.recordData = appData.recordData;
                alert("save success");
                appData.errMsg = null;
            },function(r){
                console.log(r);
                appData.errMsg = JSON.stringify(r) ;
            });
        },
        onRefClick : function(){
            window.open(SalesforceAPI.LoginInfo.domain + appData.recordData.Id);
        }
    }
});
