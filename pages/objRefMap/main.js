
SalesforceAPI.login(init);

function init() {
    // BaseAPI.loadObjMap(function (objMap) {
    //     createRelationMap(objMap, function (d) {
    //         refMapList.forEach(ref => {
    //             if (!refMap[ref.srcObj.name]) {
    //                 refMap[ref.srcObj.name] = [];
    //             }
    //             if(objMap[ref.toObj]){
    //                 refMap[ref.srcObj.name].push(
    //                     { srcObject : ref.srcObj.name,
    //                     srcObjectLabel : ref.srcObj.label,
    //                     srcField: ref.srcField.name, 
    //                     srcFieldLabel: ref.srcField.label, 
    //                     toObj: ref.toObj,
    //                     toObjLabel: objMap[ref.toObj].label });
    //             }
    //         });
    //         console.log(refMap);
    //         ChromeAPI.saveLocalData("refMap",refMap);
    //         debugger;
    //     });
    // });
    ChromeAPI.getLocalData("refMap", function (d) {
        var list = [];
        refMap = d.refMap;
        Object.values(refMap).forEach(refArr => {
            refArr.forEach(ref => {
                list.push(ref);
            });
        });
        appData.refMapList = list;
        var distinctList = distinct(list);
        var indexMap = makeIndex(distinctList);
        appData.indexList = Object.values(indexMap);
        setIndex(distinctList, indexMap);
        appData.distinctRefMapList = distinctList;
    })
}
function makeIndex(list){
    var result = {};
    for (let i = 0; i < list.length; i++) {
        if(!result[list[i].srcObject]){
            result[list[i].srcObject] = list[i].srcObjectLabel;
        }
        if(!result[list[i].toObj]){
            result[list[i].toObj] = list[i].toObjLabel;
        }
    }

    var keys = Object.keys(result);

    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        result[key] = {key:key, index:index ,label:result[key]};
    }
    return result;
}
function setIndex(list, indexMap){
    list.forEach(ref => {
        ref.fromIndex = indexMap[ref.srcObject].index;
        ref.toIndex = indexMap[ref.toObj].index;
    });
}
function distinct(list) {

    for (let index = 0; index < list.length; index++) {
        const element = list[index];
        element.n = index;
    }

    var disMap = {};
    list.forEach(ref => {
        var key = ref.srcObj + "___" + ref.toObj;
        if (!disMap[key]) {
            disMap[key] = {
                srcObject: ref.srcObject,
                srcObjectLabel: ref.srcObjectLabel,
                toObj: ref.toObj,
                toObjLabel: ref.toObjLabel
            };
        }
    });
    return Object.values(disMap);
}

var refMapList = [];
var refMap = {};
function createRelationMap(objMap, callBack) {
    var objs = Object.values(objMap);
    var count = objs.length;
    var index = 0;
    objs.forEach(obj => {
        BaseAPI.getObjDef(obj.name, function (objr) {

            if(objr.name == "SmartViscaf__NameCardBasicSetting__Share"){
                debugger;
            }

            objr.fields.forEach(f => {
                if (f.type == "reference") {
                    if (f.referenceTo.length > 0) {
                        refMapList.push({ srcObj: objr, srcField: f, toObj: f.referenceTo[0] });
                    }
                }
            });
            index++;
            if (index == count) {
                callBack();
            }
        })
    });
}

var appData = { refMapList: [], distinctRefMapList: [], indexList:[] };
var v = new Vue({
    el: '#app',
    data: { appData: appData },
    methods: {
    }
});