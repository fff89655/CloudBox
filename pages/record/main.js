
var parentWindow = window.parent;
var parentLoginInfor = parentWindow.g_getLoginInfor();
SalesforceAPI.LoginInfors = parentLoginInfor.LoginInfors;
SalesforceAPI.LoginInfor = parentLoginInfor.LoginInfor;


function init(){
    BaseAPI.loadObjMap(function(objMap){
        
        Object.values(objMap).forEach(obj => {
            objPrefix[obj.keyPrefix] = obj;
        });

        appData.objMap = objMap;

        let objItems = [];
        for(let objName in objMap){
            objItems.push({value:objName, label:objMap[objName].label});
        }
        appData.objItems = objItems;
            
        var url = new URL(window.location.href);
        var id = url.searchParams.get("id");
        if(id){
            appData.idVal = id;
            vue.onSearchClick();
        }

    });
}

init();

var objPrefix = {};

var STANDARD_ITEMS = ["Id",
                    "Name",
                    "CreatedById",
                    "CreatedDate", 
                    "LastModifiedById", 
                    "LastModifiedDate", 
                    "SystemModstamp",
                    "LastReferencedDate",
                    "LastViewedDate",
                    "OwnerId", 
                    "IsDeleted"];

var appData = { idVal: "", 
                objectName: "", 
                objectLabel: "", 
                recordData:null, 
                selectItems:[], 
                selectStandardItems:[],
                selectReadOnlyItems:[],
                editItemName:{}, 
                objMap:null, 
                selectObj:null ,
                errMsg:null,
                successMessage:null,
                reference:[],
                objItems:[]};

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
        appData.objectLabel = obj.label;
      }
      
      this._setItemsDef(obj);

      //var soql = `SELECT ${this._getAllItemName(obj).join(",")} FROM ${appData.objectName} WHERE Id='${appData.idVal}'`;

      var me = this;
      
      SalesforceAPI.requestRecord(appData.objectName, appData.idVal, this._getAllItemName(obj) ,function(r){
        appData.recordData = r;

        me._setRelationItem(obj, appData.recordData);

        console.log(r);
      });

    },
    _setRelationItem : function(obj, record){
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
              appData.successMessage = "保存が成功しました。";
              setTimeout(() => {
                appData.successMessage = null;
              }, 3000);
              appData.errMsg = null;

              appData.idVal = appData.recordData.Id;
              this.onSearchClick();
            },function(r){
              console.log(r);
              appData.errMsg = JSON.stringify(r) ;
              setTimeout(() => {
                appData.errMsg = null;
              }, 1000);
            });
        }else{
            SalesforceAPI.requestCreateData(appData.selectObj, JSON.stringify(appData.recordData) ,function(r){
                appData.recordData.Id = r.id;
                appData.recordData = appData.recordData;
                
                appData.successMessage = "新規が成功しました。";
                setTimeout(() => {
                  appData.successMessage = null;
                }, 3000);
                appData.errMsg = null;
                
                appData.idVal = r.id;
                this.onSearchClick();
            },function(r){
                console.log(r);
                appData.errMsg = JSON.stringify(r) ;
                setTimeout(() => {
                  appData.errMsg = null;
                }, 1000);
            });
        }
    },
    onCreateClick : function(){
        if(appData.selectObj && appData.objMap[appData.selectObj]){
                
            appData.objectName = appData.selectObj;

            var objDef = appData.objMap[appData.selectObj];
            this._setItemsDef(objDef);

            appData.recordData = {};

            this._setRelationItem(objDef, appData.recordData);
        }
    },
    _getAllItemName : function(objDef){
      var result = [];
      for (const f of objDef.fields) {
        result.push(f.name);
      }
      return result;
    },
    _setItemsDef : function(objDef){
      
      if(objDef){
        appData.objectName = objDef.name;
        appData.objectLabel = objDef.label;
      }
      
      var selectItems = {};
      var selectStandardItems = {};
      var selectReadOnlyItems = {};

      objDef.fields.forEach(f => {
        if(STANDARD_ITEMS.includes(f.name)){
          selectStandardItems[f.name] = {field:f, show:true};
        }else{
          if(f.updateable){
            selectItems[f.name] = {field:f, show:true};
          }else{
            selectReadOnlyItems[f.name] = {field:f, show:true};
          }
        }
      });

      selectItems = Object.values(selectItems);
          
      selectItems.sort(function(a, b){
        if(a.field.label.length <= b.field.label.length){
          return -1;
        }else{
          return 1;
        }
      });

      selectReadOnlyItems = Object.values(selectReadOnlyItems);
      
      selectReadOnlyItems.sort(function(a, b){
        if(a.field.label.length <= b.field.label.length){
          return -1;
        }else{
          return 1;
        }
      });

      appselectStandardItems = [];

      for (const stdItem of STANDARD_ITEMS) {
        if(selectStandardItems[stdItem]){
          appselectStandardItems.push(selectStandardItems[stdItem]);
        }
      }
      
      appData.selectItems = selectItems;
      appData.selectStandardItems = appselectStandardItems;
      appData.selectReadOnlyItems = selectReadOnlyItems;

    },
    onCopyClick : function(){
        
        var updateObj = {};
        appData.selectItems.forEach(item => {
            if(item.field.updateable){
                updateObj[item.field.name] = appData.recordData[item.field.name];
            }
        });
        appData.selectStandardItems.forEach(item => {
            if(item.field.updateable){
                updateObj[item.field.name] = appData.recordData[item.field.name];
            }
        });
        
        appData.recordData.Id = null;
        SalesforceAPI.requestCreateData(appData.objectName, JSON.stringify(updateObj) ,function(r){
            console.log(r);
            appData.recordData.Id = r.id;
            appData.recordData = appData.recordData;

            appData.successMessage = "コピーが成功しました。";
            setTimeout(() => {
              appData.successMessage = null;
            }, 3000);

            appData.errMsg = null;
            
            appData.idVal = r.id;
            this.onSearchClick();
            
        },function(r){
            console.log(r);
            appData.errMsg = JSON.stringify(r) ;
            setTimeout(() => {
              appData.errMsg = null;
            }, 8000);
        });
    },
    onObjClick : function(){
      var param = `objectName=${appData.objectName}'`;
      window.parentWindow.g_openTabFromId('objDef', param);
    },
    onObjRefClick : function(){
      SalesforceAPI.getObjPageUrl(appData.objectName, (url)=>{
        window.open(url);
      })
    },
    onRecordRefClick : function(){
      SalesforceAPI.getRecordPageUrl(appData.recordData.Id, (url)=>{
        window.open(url);
      });
    },
    onFormulaClick : function(e, formula){
      e.preventDefault();
      alert(formula);
    },
    onRelationClick : function(e, rid){
      e.preventDefault();
      var param = `id=${rid}'`;
      window.parentWindow.g_openTabFromId('record', param);
    },
    onTypeClick : function(e, item){
      e.preventDefault();
      SalesforceAPI.getFieldPageUrl(appData.objectName, item.field.name, (url)=>{
        window.open(url);
      });
    },
    onShowTypeChange(val){
        let all = [];
        all.push(...appData.selectItems);
        all.push(...appData.selectStandardItems);
        all.push(...appData.selectReadOnlyItems);
        let types = val.split(",");
        for(let item of all){
            if(!val){
                item.show = true;
                continue;
            }
            if(types.indexOf(item.field.type) >= 0){
                item.show = true;
            }else{
                item.show = false;
            }
        }
    },
    onNotNullChange(val){
        let all = [];
        all.push(...appData.selectItems);
        all.push(...appData.selectStandardItems);
        all.push(...appData.selectReadOnlyItems);
        if(val == "not null"){
            for(let item of all){
                if(appData.recordData[item.field.name]){
                    item.show = true;
                }else{
                    item.show = false;
                }
            }
        }else{
            for(let item of all){
                item.show = true;
            }
        }
    },
    onFilterChange(e){
        let v = e.target.value;
        let reg = new RegExp(v,"i");
        let all = [];
        all.push(...appData.selectItems);
        all.push(...appData.selectStandardItems);
        all.push(...appData.selectReadOnlyItems);
        for(let item of all){
            if(reg.test(item.field.name)){
                item.show = true;
            }else{
                item.show = false;
            }
        }
    }
  }
});
