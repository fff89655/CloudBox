var template = `
<div>
<div class="scrollDiv" style="height:calc(100% - 50px); overflow:hidden; position:relative;">
    <div id="objDataGrid">
    </div>
</div>
<div>
    <div style="width:100%;overflow-x:auto;overflow-y:hidden;white-space: nowrap;">
        ページ：
        <a class="pageLink" v-bind:class="{currentPage:(currentPage==p.index)}" href="#" v-for="p in pageLinkList" v-on:click="pageLinkClick(p)">{{p.index+1}}</a>
    </div>
</div>
</div>
`;

Vue.component('obj-datas', {
    props: ["object"],
    template: template,
    data: function () {
        return { datas: [], selectItems: [], totalSize: null, currentPage: 0, pageLinkList: [] };
    },
    created: function () {
        this.loadDatas();
        $(window).keydown(this.onWindowKeydown);
    },
    watch: {
        object: function (newVal, oldVal) {
            this.loadDatas();
            this.createFixHeader();
        }
    },
    updated: function () {
        this.createFixHeader();
    },
    methods: {
        createFixHeader: function () {

        },
        loadDatas: function () {

            if (!this.object || !this.object.name) {
                return;
            }

            var selectItems = [];
            this.object.fields.forEach(field => {
                selectItems.push({
                    name: field.name,
                    label: field.label,
                    field: field,
                    selected: true
                });
            });
            for (let index = 0; index < selectItems.length; index++) {
                const item = selectItems[index];
                item.sort = index;
            }

            selectItems.sort(function (a, b) {
                if (a.name == "Id" || b.name == "Id") {
                    return a.name == "Id" ? -1 : b.name == "Id" ? 1 : -1;
                }
                if (a.name == "Name" || b.name == "Name") {
                    return a.name == "Name" ? -1 : b.name == "Name" ? 1 : -1;
                }
                if (a.label.length > b.label.length) {
                    return 1;
                } else {
                    return -1;
                }
            });

            this.selectItems = selectItems;

            var selectItemStr = selectItems.map(function (elem) {
                return elem.name;
            }).join(",");

            var soql = `SELECT ${selectItemStr} FROM ${this.object.name} LIMIT 50`;

            var countSql = `SELECT count() FROM ${this.object.name}`;

            console.log(soql);

            var me = this;
            SalesforceAPI.requestData(soql, function (jsonData) {
                //me.datas = jsonData.records;
                var column = [];
                var colHeaders = [];
                var headerMap = {};

                var i = 0;
                selectItems.forEach(item => {
                    var col = {};
                    col.data = item.name;
                    col.type = "text";

                    if (item.field.type == "boolean") {
                        col.type = "checkbox";
                    } else if (item.field.type == "picklist") {
                        col.type = "dropdown";
                        col.source = [];
                        item.field.picklistValues.forEach(p => {
                            col.source.push(p.value);
                        });
                    }

                    col.readOnly = !item.field.updateable;

                    column.push(col);
                    colHeaders.push(item.label + "<br />" + item.name + "<br />" + item.field.type);
                    headerMap[item.field.name] = i;
                    console.log(item.field.type);
                    i++;
                });

                me.initDataGrid(jsonData.records, column, colHeaders, headerMap);

            });

            SalesforceAPI.requestData(countSql, function (jsonData) {
                me.totalSize = jsonData.totalSize;
                var pageCount = Math.ceil(me.totalSize / 50);
                var pageLinkList = [];
                for (let i = 0; i < pageCount; i++) {
                    pageLinkList.push({ index: i, isCurrent: i == me.currentPage });
                }
                me.pageLinkList = pageLinkList;
            });
        },
        initDataGrid: function (records, column, colHeaders, headerMap) {

            function editedRender(instance, td, row, col, prop, value, cellProperties) {
                Handsontable.renderers.TextRenderer.apply(this, arguments);

                if($(td).attr("edited") == true){
                    $(td).addClass("dataChangedCell");
                }
            }
            
            Handsontable.renderers.registerRenderer('editedRender', editedRender);

            var actionColRenderer = function (instance, td, row, col, prop, value, cellProperties) {
                var button = $('<a href="">');
                button.html("Edit")
                button.attr("rId", value);
                button.click(function(e){
                    window.open("/pages/record/index.html?id=" +$(this).attr("rId"));
                    e.preventDefault();
                });
                $(td).empty().append(button);

                button = $('<a href="">');
                button.css("margin-left", "8px");
                button.html("Ref")
                button.attr("rId", value);
                button.click(function(e){
                    window.open(SalesforceAPI.LoginInfo.domain + $(this).attr("rId"));
                    e.preventDefault();
                });
                $(td).append(button);
            };
            
            var actionCol = {};
            actionCol.data = 'Id';
            actionCol.type = "text";
            actionCol.readOnly = true;
            column.unshift(actionCol),

            colHeaders.unshift("");

            this.dataTableCmp = new Handsontable($("#objDataGrid")[0], {
                data: records,
                columns: column,
                rowHeaders: true,
                colHeaders: colHeaders,
                height: function () {
                    return $("#objDataGrid").parent().height();
                },
                //columnHeaderHeight: 60,
                manualRowResize: true,
                //rowHeights: 35,
                filters: true,
                dropdownMenu: true,
                cells: function (row, col) {
                    var cellProperties = {};

                    if(col == 0){
                        cellProperties.renderer = actionColRenderer;
                    }else{
                        cellProperties.renderer = editedRender;
                    }

                    return cellProperties;
                },
                afterChange: function (changes) {
                    if (!changes) return;
                    var table = this;
                    for (let i = 0; i < changes.length; i++) {
                        const change = changes[i];
                        //row, prop, oldValue, newValue
                        debugger;
                        var rowFirstCell = table.getCell(change[0], table.headerMap[change[1]] + 1);
                        $(rowFirstCell).attr("edited", true);
                    }
                }
            });

            this.dataTableCmp.headerMap = headerMap;

        },
        loadPageDatas: function (p) {

            var selectItemStr = this.selectItems.map(function (elem) {
                return elem.name;
            }).join(",");

            var soql = `SELECT ${selectItemStr} FROM ${this.object.name} ORDER BY LastModifiedDate DESC LIMIT 50 OFFSET ${p.index * 50} `;

            var me = this;
            SalesforceAPI.requestData(soql, function (jsonData) {
                var rowHeaders = [];
                var startIndex = p.index * 50;
                for (var i = startIndex; i < startIndex + 50; i++) {
                    rowHeaders.push(i + 1 + "");
                }

                this.dataTableCmp.loadData(jsonData.records);
                this.dataTableCmp.updateSettings({ rowHeaders: rowHeaders });
                this.dataTableCmp.render();

                me.currentPage = p.index;
            });
        },
        pageLinkClick: function (p) {
            this.loadPageDatas(p);
        }
    }
})