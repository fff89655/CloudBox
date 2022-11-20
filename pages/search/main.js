var parentWindow = window.parent;
var parentLoginInfor = parentWindow.g_getLoginInfor();
SalesforceAPI.LoginInfors = parentLoginInfor.LoginInfors;
SalesforceAPI.LoginInfor = parentLoginInfor.LoginInfor;


var appData = {datas:null, selectItems:[], input:{objName:null}, searchObj:null, objItems:[], selectObj:null, insertNum:0,
               fieldSelect:{cmpName:null, show:false, fieldSelectProp:{object:null,selectedFieldNames:null,width:800,height:500}},
               upsert:{show:false},
               matrix:{width:0, height:0},
               size:{sqlListWidth:300},
               showTabId:"sql"
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
            let editedRows = this.$refs.matrix.getEditedRowObjs();
            if(editedRows.length == 0){
                alert("no edit data.");
                return;
            }
            if(editedRows[0] == undefined){
                alert("No Id Column.");
                return;
            }
            let obj = objMap[appData.selectObj ];
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
        createSql:function(){

            if(!this.selectObj){
                alert("select object.");
                return;
            }
            this.fieldSelect.show = true;
            $(".fieldSelect").css("left", $("#createSql").offset().left + "px");
            
            appData.searchObj = objMap[this.selectObj];
            this.fieldSelect.fieldSelectProp.object = appData.searchObj;
            this.fieldSelect.cmpName = null;
            setTimeout(() => {
                this.fieldSelect.cmpName = 'obj-field-select';
            }, 1000);
        },
        fieldSelectOK:function(){
            let selectedFields = this.$refs.fieldSelect.getSelected();

            let sql = `SELECT\n  ${selectedFields.join(",\n  ")}\nFROM ${this.selectObj}`;
            editor.setValue(sql);
            editor.focus();
            this.fieldSelect.show = false;
        },
        fieldSelectCANCLE:function(){
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
        
            me.showTab("data");

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
                        me.colHeaders = colHeaders;
                        me.$refs.matrix.showObjDataWidthResize(colHeaders, appData.datas, p.clientWidth, p.clientHeight);
                    }else{
                        me.$refs.matrix.clear();
                    }
                    appData.selectObj = objectName;

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
        deleteRow: async function(){
            if(!this.selectObj){
                alert("select object.");
                return;
            }

            let rows = this.$refs.matrix.getSelectedCellRows();
            for(let row of rows){
                if(!row.Id){
                    alert("no Id.");
                    return;
                }
                await SalesforceAPI.requestDeleteDataSync(this.selectObj, row.Id);
            }
            alert("delete success.");
        },
        addRow:function(){
            if(!this.selectObj || !this.insertNum){
                alert("select object and input num.")
                return;
            }

            let obj = objMap[this.selectObj];

            let fieldNameList = ["Id"];
            for(let f of obj.fields){
                if(f.custom == false
                   && f.name != "Name"){
                    continue;
                }
                if(f.mustInput){
                    fieldNameList.push(f.name);
                }
            }
            let rowNum = parseInt(this.insertNum);
            
            let addRows = [];
            for(let i=0 ; i<rowNum ; i++){
                let row = {};
                for(let prop of fieldNameList){
                    row[prop] = null;
                }
                addRows.push(row);
            }

            this.showTab("data");

            let p = this.$refs.matrixParent;
            this.$refs.matrix.showObjDataWidthResize(fieldNameList, addRows, p.clientWidth, p.clientHeight);
        },
        onSqlClick:function(node){
            editor.setValue(node.sql ? node.sql:"");
            editor.focus();
            this.showTab("sql");
        },
        updateHistory:function(objectName){
            let sql = editor.getValue();
            var options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
            
            this.$refs.sqlPanel.addHistory(`${new Date().toLocaleDateString("ja-JP", options)}_${objectName}`, sql);
        },
        onXResize:function(offset){
            appData.size.sqlListWidth += offset;
            setTimeout(()=>{
                window.dispatchEvent(new Event('resize'));
            });
        },
        onSaveSql:function(node){
            node.model.sql = editor.getValue();
        },
        onTabClick:function(e){
            this.showTab(e.target.getAttribute("tabId"));
        },
        showTab:function(tabId){
            this.showTabId = tabId;
            $(".tab.selected").removeClass("selected");
            $(`.tab[tabId='${tabId}']`).addClass("selected");
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
        result.push("\"" + row.join("\",\"") + "\"");
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
        for(let prop in updateRec){
            if(updateRec[prop] === ""){
                updateRec[prop] = null;
            }
        }

        if(updateRec.Id){
            let Id = updateRec.Id;
            delete updateRec.Id;
            let result = await SalesforceAPI.requestSaveDataSync(appData.selectObj, Id, JSON.stringify(updateRec));
            if(result != "success"){
                errMsg.push(result);
            }
        }else{
            let result = await SalesforceAPI.requestCreateDataSync(appData.selectObj, JSON.stringify(updateRec));
            if(result != "success"){
                errMsg.push(result);
            }
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