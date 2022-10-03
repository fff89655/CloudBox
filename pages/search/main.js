
var parentWindow = window.parent;
var parentLoginInfor = parentWindow.g_getLoginInfor();
SalesforceAPI.LoginInfors = parentLoginInfor.LoginInfors;
SalesforceAPI.LoginInfor = parentLoginInfor.LoginInfor;


var appData = {datas:[], selectItems:[], input:{objName:null}, searchObj:null, objItems:[],
                fieldSelect:{cmpName:null, show:false, fieldSelectProp:{object:null,selectedFieldNames:null,width:800,height:500}}};
var objMap = null;

function init(){
  initFieldItems();
  var v = new Vue({
    el: '#app',
    data: appData,
    methods: {
        search:function(){
          searchDatas("table");
        },
        save:function(){
          saveDatas();
        },
        objSelect:function(val){
            let input = val;

            for (const objApiName in appData.objMap) {
                if(input == objApiName){                    
                    appData.input.objName = input;
                    appData.searchObj = objMap[input];

                    this.fieldSelect.fieldSelectProp.object = appData.searchObj;
                    this.fieldSelect.cmpName = null;
                    setTimeout(() => {
                        this.fieldSelect.cmpName = 'obj-field-select';
                    }, 1000);

                    break;
                }
            }
        },
        createSql:function(){
            this.fieldSelect.show = true;
        },
        fieldSelectOK:function(){
            let selectedFields = this.$refs.fieldSelect.getSelected();

            let sql = `SELECT\n\t${selectedFields.join(",\n\t")}\nFROM ${appData.input.objName}`;
            editor.setValue(sql);
            
            this.fieldSelect.show = false;
        },
        showAsLabel:function(){
            let sql = editor.getValue();
            let wrapper = new SQLWrapper(sql);
            sql = wrapper.translate(objMap);
            editor.setValue(sql);
        },
        downloadCSVClick:function(){
            searchDatas("csv");
        }
    }
  });
  editorInit();
}


function loadData(){
  BaseAPI.loadObjMap(function(objMapP){
    appData.objMap = objMapP;
    objMap = objMapP;

    init();
  });
}
loadData();

function initFieldItems(){
    let objItems = [];
    for(let objName in objMap){
        objItems.push({value:objName, label:objMap[objName].label});
    }
    appData.objItems = objItems;
}


var dataGrid = null;
function searchDatas(showtype){
    var sql = editor.getValue();
    var selectItems = [];
    
    var reg = /select\s+(.+)\sfrom\s+(.+)/is
    var r = reg.exec(sql);
    selectItems = r[1].replace(/\s+/gs, '').split(",");
    appData.selectItems = selectItems;

    SalesforceAPI.requestData(sql , function(r){
        let datas = [];
        let objectName = null;
        for(let rec of r.records){
            let row = {};
            for(let item of appData.selectItems){
                let ps = item.split('.');
                if(ps.length==1){
                    row[item] = rec[item];
                }else{
                    let v = rec;
                    for(let pro of ps){
                        if(!v) continue;
                        v=v[pro];
                    }
                    row[item] = v;
                }
            }
            datas.push(row);
            if(objectName == null){
                objectName = rec.attributes.type;
            }
        }
        appData.datas = datas;

        if(dataGrid != null) dataGrid.destroy();

        let colHeaders = [];
        let columns = [];
        let i = 0;
        var headerMap = {};
        for (const colHeader of selectItems) {
            colHeaders.push(colHeader);
            columns.push({data:colHeader});
            headerMap[colHeader] = i;
            i++;
        }

        if(showtype == 'table'){
            dataGrid = 
            new Handsontable($("#dataGrid")[0], {
                data: appData.datas,
                columns: columns,
                rowHeaders: true,
                colHeaders:colHeaders,
                columnSorting: true,
                //columnHeaderHeight: 60,
                manualRowResize: true,
                manualColumnResize: true,
                rowHeights: 10,
                filters: true,
                dropdownMenu: true,
                viewportColumnRenderingOffset: 999,
                viewportRowRenderingOffset: 9999,
                afterChange: function (changes) {
                    if (!changes) return;
                    var table = this;
                    for (let i = 0; i < changes.length; i++) {
                        const change = changes[i];
                        //row, prop, oldValue, newValue
                        var rowFirstCell = table.getCell(change[0], table.headerMap[change[1]]);
                        $(rowFirstCell).attr("edited", true);
                        $(rowFirstCell).closest("tr").attr("edited", true);
                    }
                }
            });
            dataGrid.headerMap = headerMap;
            dataGrid.objectName = objectName;
        }else if(showtype == "csv"){
            downloadCSV(colHeaders, appData.datas);
        }
    }, function(errmsg){
        alert(JSON.stringify(errmsg));
    });

}

function downloadCSV(colHeaders, datas){
    let result = [];
    let csvDatas = [];
    

    let headerRow = [];
    for(let header of colHeaders){
        headerRow.push(header);
    }
    csvDatas.push(headerRow);
    for(let row of datas){
        let csvRow = [];
        for(let header of colHeaders){
            csvRow.push(row[header]);
        }
        csvDatas.push(csvRow);
    }

    for(let row of csvDatas){
        result.push("\"=\"\"" + row.join("\"\"\",\"=\"\"") + "\"\"\"")
        //result.push("\"" + row.join("\",\"") + "\"")
    }
    let csvStr = result.join("\r\n");

    let bolbCSV = new Uint8Array( Encoding.convert(new Encoding.stringToCode(csvStr), 'SJIS'));

    let blob = new Blob([bolbCSV],{type:"text/csv"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download ="tempdate.csv";
    link.click();
}

function saveDatas(){
    if(dataGrid.headerMap["Id"] == undefined){
        alert("No Id Column.");
        return;
    }
    if(dataGrid.objectName == null){
        return;
    }
    let editedRows = $("tr[edited]");
    let editRowIndesList = [];
    let updateRecList = [];
    for(let i=0 ; i<editedRows.length; i++){
        let rowCell = editedRows[i];
        let rowIndex = $(rowCell).prevAll().length;
        let rec = {};
        let editedCells = $(rowCell).find("td[edited]");
        for(let j=0 ; j<editedCells.length ; j++){
            let cell = editedCells[j];
            let cellColIndex = $(cell).prevAll().length - 1;
            let colHeader = dataGrid.getColHeader(cellColIndex);
            let data = dataGrid.getDataAtCell(rowIndex, cellColIndex);
            rec[colHeader] = data;
        }
        rec.Id = dataGrid.getDataAtCell(rowIndex, dataGrid.headerMap["Id"]);
        updateRecList.push(rec);
    }
    saveToSalesforce(updateRecList);
}

async function saveToSalesforce(updateRecList){
    let errMsg = [];
    for(let updateRec of updateRecList){
        let Id = updateRec.Id;
        delete updateRec.Id;
        let result = await SalesforceAPI.requestSaveDataSync(dataGrid.objectName, Id, JSON.stringify(updateRec));
        if(result != "success"){
            errMsg.push(result);
        }
    }
    if(errMsg.length > 0){
        alert(errMsg);
    }else{
        alert("保存成功。");
        clearEdited();
    }
}

function clearEdited(){
    $("[edited]").removeAttr('edited');
}

var editor;
var editorInit = function(){
 editor = ace.edit("editor");
 editor.setTheme("ace/theme/chrome");
 editor.session.setMode("ace/mode/sql");
 
}
