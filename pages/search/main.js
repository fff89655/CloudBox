var parentWindow = window.parent;
var parentLoginInfor = parentWindow.g_getLoginInfor();
SalesforceAPI.LoginInfors = parentLoginInfor.LoginInfors;
SalesforceAPI.LoginInfor = parentLoginInfor.LoginInfor;


var appData = {datas:[], selectItems:[], input:{objName:null}, searchObj:null, objItems:[],
               fieldSelect:{cmpName:null, show:false, fieldSelectProp:{object:null,selectedFieldNames:null,width:800,height:500},},
               upsert:{show:false},
               matrix:{width:0, height:0},
               sqlList:{sqlList:null,historyList:null,sqlMenu:[{label:"save to",fun:saveSqlToTree}]},
               size:{editorHeight:300,sqlListWidth:200}
              };
var objMap = null;

function init(){
  initFieldItems();
  var v = new Vue({
    el: '#app',
    data: appData,
    mounted:function(){
        $("#app").show();
    },
    methods: {
        search:function(){
          this.searchDatas("table");
        },
        save: async function(){
            if(!window.dataObjName){
                alert("no search data.");
                return;
            }
            let editedRows = this.$refs.matrix.getEditedRowObjs();
            if(editedRows.length == 0){
                alert("no edit data.");
                return;
            }
            if(editedRows[0] == undefined){
                alert("No Id Column.");
                return;
            }
            let obj = objMap[window.dataObjName];
            for(let row of editedRows){
                for(let pro in row){
                    if(obj.fieldMap[pro].type == "datetime"){
                        row[pro] = ComFun.toSFDCDataTimeFormat(row[pro]);
                    }
                }
            }
            let r = await saveToSalesforce(editedRows);
            if(r) this.$refs.matrix.clearEdit();

            // let editedRows = $("tr[edited]");
            // let editRowIndesList = [];
            // let updateRecList = [];
            // for(let i=0 ; i<editedRows.length; i++){
            //     let rowCell = editedRows[i];
            //     let rowIndex = $(rowCell).prevAll().length;
            //     let rec = {};
            //     let editedCells = $(rowCell).find("td[edited]");
            //     for(let j=0 ; j<editedCells.length ; j++){
            //         let cell = editedCells[j];
            //         let cellColIndex = $(cell).prevAll().length - 1;
            //         let colHeader = dataGrid.getColHeader(cellColIndex);
            //         let data = dataGrid.getDataAtCell(rowIndex, cellColIndex);
            //         rec[colHeader] = data;
            //     }
            //     rec.Id = dataGrid.getDataAtCell(rowIndex, dataGrid.headerMap["Id"]);
            //     updateRecList.push(rec);
            // }
            // saveToSalesforce(updateRecList);
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
            editor.focus();
            this.fieldSelect.show = false;
        },
        showAsLabel:function(){
            let sql = editor.getValue();
            let wrapper = new SQLWrapper(sql);
            sql = wrapper.translate(objMap);
            editor.setValue(sql);
        },
        downloadCSVClick:function(){
            this.searchDatas("csv");
        },
        upsertCSVClick:function(){
            appData.upsert.show = true;
        },
        onUpsertCancle:function(){
            appData.upsert.show = false;
        },
        searchDatas:function(showtype){
            var sql = editor.getValue();
            var selectItems = [];
            
            var reg = /select\s+(.+)\sfrom\s+(.+)/is
            var r = reg.exec(sql);
            selectItems = r[1].replace(/\s+/gs, '').split(",");
            appData.selectItems = selectItems;
        
            let me = this;
        
            SalesforceAPI.requestData(sql , function(r){
                let datas = [];
                let objectName = null;
                let colField = {};
                for(let rec of r.records){
                    if(objectName == null){
                        objectName = rec.attributes.type;
                    }
                    let row = {};
                    for(let item of appData.selectItems){
                        if(!colField[item]){
                            colField[item] = ComFun.getRefRecordField(rec, item, objMap);
                        }
                        row[item] = ComFun.getRefRecordValue(rec, item);
                        if(row[item] != null){
                            if(colField[item].type == "datetime"){
                                row[item] = ComFun.toComDateFormat(row[item]);
                            }
                        }
                    }
                    datas.push(row);
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

                    // $("#sqlDiv").css("height","100px");

                    let p = me.$refs.matrixParent;

                    if(appData.datas.length > 0){
                        me.$refs.matrix.showObjDataWidthResize(colHeaders, appData.datas, p.clientWidth, p.clientHeight);
                    }
                    window.dataObjName = objectName;

                    me.updateHistory(objectName);
                    // dataGrid = 
                    // new Handsontable($("#dataGrid")[0], {
                    //     data: appData.datas,
                    //     columns: columns,
                    //     rowHeaders: true,
                    //     colHeaders:colHeaders,
                    //     columnSorting: true,
                    //     //columnHeaderHeight: 60,
                    //     manualRowResize: true,
                    //     manualColumnResize: true,
                    //     rowHeights: 10,
                    //     filters: true,
                    //     dropdownMenu: true,
                    //     viewportColumnRenderingOffset: 999,
                    //     viewportRowRenderingOffset: 9999,
                    //     afterChange: function (changes) {
                    //         if (!changes) return;
                    //         var table = this;
                    //         for (let i = 0; i < changes.length; i++) {
                    //             const change = changes[i];
                    //             //row, prop, oldValue, newValue
                    //             var rowFirstCell = table.getCell(change[0], table.headerMap[change[1]]);
                    //             $(rowFirstCell).attr("edited", true);
                    //             $(rowFirstCell).closest("tr").attr("edited", true);
                    //         }
                    //     }
                    // });
                    // dataGrid.headerMap = headerMap;
                    // dataGrid.objectName = objectName;
                }else if(showtype == "csv"){
                    downloadCSV(colHeaders, appData.datas);
                }
            }, function(errmsg){
                alert(JSON.stringify(errmsg));
            });
        
        },
        onSqlClick:function(node){
            editor.setValue(node.sql ? node.sql:"");
            editor.focus();
        },
        onAddSql:function(node){
            debugger;
            ChromeAPI.saveLocalData("SQLListMap", appData.sqlList.sqlList);
        },
        onDeleteSql:function(node){
            ChromeAPI.saveLocalData("SQLListMap", appData.sqlList.sqlList);
        },
        onRenameSql:function(node){
            ChromeAPI.saveLocalData("SQLListMap", appData.sqlList.sqlList);
        },
        updateHistory:function(objectName){
            let sql = editor.getValue();
            let newHistory = [];
            newHistory.push({title:`${objectName}`, sql:sql});
            let n = 0;
            for(let hd of appData.sqlList.historyList.children){
                if(hd.sql == sql){
                    continue ;
                }else{
                    newHistory.push(hd);
                }
                n++;
                if(n>100){
                    break;
                }
            }

            appData.sqlList.historyList.children = newHistory;

            ChromeAPI.saveLocalData("HistorySQLListMap", appData.sqlList.historyList);
            this.$refs.historyTree.loadTreeData(appData.sqlList.historyList);
        },
        onYResize:function(offset){
            appData.size.editorHeight += offset;
            setTimeout(()=>{
                window.dispatchEvent(new Event('resize'));
            },0);
        },
        onXResize:function(offset){
            appData.size.sqlListWidth += offset;
            setTimeout(()=>{
                window.dispatchEvent(new Event('resize'));
            });
        }
    }
  });
  editorInit();
}


function loadData(){
  BaseAPI.loadObjMap(function(objMapP){
    appData.objMap = objMapP;
    objMap = objMapP;
    
    ChromeAPI.getLocalData("SQLListMap",function(sqlListMap){
        if(!sqlListMap.SQLListMap){
            sqlListMap.SQLListMap = {title:"sql"};
            ChromeAPI.saveLocalData("SQLListMap", sqlListMap.SQLListMap);
        }
        appData.sqlList.sqlList = sqlListMap.SQLListMap;
        ChromeAPI.getLocalData("HistorySQLListMap",function(historySQLListMap){
            if(!historySQLListMap.HistorySQLListMap){
                historySQLListMap.HistorySQLListMap = {title:"history", children:[]};
                ChromeAPI.saveLocalData("HistorySQLListMap", historySQLListMap.HistorySQLListMap);
            }
            appData.sqlList.historyList = historySQLListMap.HistorySQLListMap;
            init();
        });
    });
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
        //result.push("\"=\"\"" + row.join("\"\"\",\"=\"\"") + "\"\"\"")
        result.push("\"" + row.join("\",\"") + "\"")
    }
    let csvStr = result.join("\r\n");

    //let bolbCSV = new Uint8Array( Encoding.convert(new Encoding.stringToCode(csvStr), 'SJIS'));
    //let blob = new Blob([bolbCSV],{type:"text/csv"});

    let blob = new Blob([csvStr],{type:"text/csv"});

    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download ="tempdate.csv";
    link.click();
}

async function saveToSalesforce(updateRecList){
    let errMsg = [];
    for(let updateRec of updateRecList){
        let Id = updateRec.Id;
        delete updateRec.Id;
        let result = await SalesforceAPI.requestSaveDataSync(window.dataObjName, Id, JSON.stringify(updateRec));
        if(result != "success"){
            errMsg.push(result);
        }
    }
    if(errMsg.length > 0){
        alert(errMsg);
        return false;
    }else{
        alert("保存成功。");
        // clearEdited();
        return true;
    }
}

// function clearEdited(){
//     $("[edited]").removeAttr('edited');
// }

var editor;
var editorInit = function(){
 editor = ace.edit("editor");
 editor.setTheme("ace/theme/chrome");
 editor.session.setMode("ace/mode/sql");
//  editor.on("focus", function(e) {
//     $(e.target).closest("#sqlDiv").css("height","100%");
//  });
}

function saveSqlToTree(node){
    node.model.sql = editor.getValue();
    ChromeAPI.saveLocalData("SQLListMap", appData.sqlList.sqlList, function(){
        alert("save over.");
    });
}