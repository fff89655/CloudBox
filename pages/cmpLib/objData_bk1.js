var template = `
<div style="position:relative;width:100%;">
<div style="overflow-x:hidden;" class="fixHeaderDiv">
    <table class="w3-table-all w3-dataHeader datasTable">
    </table>
</div>
<div class="scrollDiv" style="height:calc(100% - 127px); overflow-x:scroll; position:relative;" v-on:scroll="onscroll(event)">
    <div class="inputDiv" style="position:absolute;padding:3px;background:#4d79ff;border:1px solid #ccd9ff;z-index:100">
        <input class="inputCell" v-on:keypress="onInputKeyPress(event)" v-on:blur="onInputBlur(event)" />
    </div>
    <table class="w3-table-all w3-hoverable datasTable">
        <thead class="dataHead">
        <tr class="w3-light-blue w3-dataHeaderTr">
            <td colspan="2" style="background-color:#396"><div>API名</div></td>
            <td v-show="n.selected" v-for="n in selectItems">
                <div>
                {{n.name}}
                </div>
            </td>
        </tr>
        <tr class="w3-light-blue  w3-dataHeaderTr2">
            <td colspan="2" style="background-color:#396"><div>ラベル</div></td>
            <td v-show="n.selected" v-for="n in selectItems">
                <div>
                {{n.label}}
                </div>
            </td>
        </tr>
        <tr class="w3-light-blue  w3-dataHeaderTr2">
            <td colspan="2" style="background-color:#396"><div>タイプ</div></td>
            <td v-show="n.selected" v-for="n in selectItems">
                <div>
                {{n.field.type}}
                </div>
            </td>
        </tr>
        </thead>
        <tr v-for="(d,index) in datas">
            <td>
                {{currentPage *50 + index + 1}}
            </td>
            <td>
                <a v-bind:href="'/pages/record/index.html?id=' + d.Id" target="_black">編集</a>
            </td>
            <td v-show="n.selected" v-for="n in selectItems" class="dataCell" v-bind:cellid="index + '-' + n.name"
                v-on:mousedown="cellMouseDown(event,d,n)" v-on:mouseenter="cellMouseenter(event)">
                {{d[n.name]}}
            </td>
        </tr>
    </table>
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
        createFixHeader: function(){

            var headerTable = $(this.$el).find(".fixHeaderDiv .w3-dataHeader");
            headerTable.empty();

            var scrollDiv = $(this.$el).find(".scrollDiv")[0];
            if (scrollDiv.scrollHeight <= scrollDiv.clientHeight) {
                return;
            }
    
    
    
            var headerTr = $(this.$el).find(".w3-dataHeaderTr");
            var newHeaderTr = headerTr.clone();
            var tds = headerTr.children();
            var newTds = newHeaderTr.children();
            for (let i = 0; i < newTds.length; i++) {
                const t = tds.eq(i).children().eq(0);
                const nt = newTds.eq(i).children().eq(0);
                nt.css("width", t[0].offsetWidth + "px");
            }
            var scrollOffsetTd = $("<th><div style='width:17px'></div></th>");
            newHeaderTr.append(scrollOffsetTd);
            headerTable.append(newHeaderTr);
    
            var headerTr = $(this.$el).find(".w3-dataHeaderTr2");
            var newHeaderTr = headerTr.clone();
            var tds = headerTr.children();
            var newTds = newHeaderTr.children();
            for (let i = 0; i < newTds.length; i++) {
                const t = tds.eq(i).children().eq(0);
                const nt = newTds.eq(i).children().eq(0);
                nt.css("width", t[0].offsetWidth + "px");
            }
    
            var scrollOffsetTd = $("<th><div style='width:17px'></div></th>");
            newHeaderTr.append(scrollOffsetTd);
    
            headerTable.append(newHeaderTr);
    
            scrollDiv.scrollTop = $(".dataHead").eq(0).height();
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
                me.datas = jsonData.records;
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
        loadPageDatas(p) {

            var selectItemStr = this.selectItems.map(function (elem) {
                return elem.name;
            }).join(",");

            var soql = `SELECT ${selectItemStr} FROM ${this.object.name} ORDER BY LastModifiedDate DESC LIMIT 50 OFFSET ${p.index*50} `;

            var me = this;
            SalesforceAPI.requestData(soql, function (jsonData) {
                me.datas = jsonData.records;
                me.currentPage = p.index;
            });
        },
        onscroll: function (e) {
            $(this.$el).find(".fixHeaderDiv")[0].scrollLeft = e.target.scrollLeft;
            var height = $(".dataHead").eq(0).height();
            if (e.target.scrollTop < height) {
                e.target.scrollTop = height;
                e.preventDefault();
            }
        },
        pageLinkClick: function (p) {
            this.loadPageDatas(p);
        },
        cellMouseDown: function(e, d, n){
            $(".dataCellSelected").removeClass("dataCellSelected");
            $(e.target).addClass("dataCellSelected");
            $(".startCell").removeClass("startCell");
            $(e.target).addClass("startCell");
            $(window).mouseup(this.cellMouseUp);
        },
        cellMouseUp: function(e){
            $(".startCell").removeClass("startCell");
        },
        cellMouseenter: function(e){

            if($(".startCell").length == 0){
                return;
            }

            $(".dataCellSelected").removeClass("dataCellSelected");
            $(e.target).addClass("dataCellSelected");

            this.selectRange(this.getRowCol($(".startCell")), this.getRowCol($(e.target)));

        },
        getRowCol: function(td){

            var startCell = td;
            var tr = td.parent();
            var row = tr.parent().children("tr").index(tr);
            var col = tr.children().index(td);

            return {row: row , col: col};
        },
        selectRange: function(startPos, endPos){

            if(startPos.row > endPos.row){
                var v = startPos.row;
                startPos.row = endPos.row;
                endPos.row = v;
            }

            if(startPos.col > endPos.col){
                var v = startPos.col;
                startPos.col = endPos.col;
                endPos.col = v;
            }

            var trs = $(".datasTable").children("tr");
            for(var i=startPos.row ; i<=endPos.row ; i++){
                var tr = trs.eq(i);
                var tds = tr.children();
                for(var j=startPos.col ; j<=endPos.col ; j++){
                    var td = tds.eq(j);
                    td.addClass("dataCellSelected");
                }
            }
        },
        onWindowKeydown: function(e){
            if(e.key == "F2"){
                var position = $(".dataCellSelected").position();
                $(".inputDiv").css("left", position.left + "px");
                $(".inputDiv").css("top", position.top + "px");
                $(".inputDiv").show();
                $(".inputCell").focus();
            }else if(e.key == "ArrowUp"){
                this.selectMoveUp(e);
            }else if(e.key == "ArrowDown"){
                this.selectMoveDown(e);
            }else if(e.key == "ArrowLeft"){

            }else if(e.key == "ArrowRight"){

            }
        },
        selectMoveUp: function(e){
            var selected = $(".dataCellSelected");
            if($(".dataCellSelected").length > 0){
                if(selected.length > 1){
                    selected = selected.eq(0);
                }
                var tr = selected.closest("tr");
                var index = tr.children().index(selected);
                var prev = tr.prev();
                if(prev.length > 0 && prev[0].tagName == "TR"){
                    var upCell = tr.prev().children().eq(index);
                    $(".dataCellSelected").removeClass("dataCellSelected");
                    upCell.addClass("dataCellSelected");
                    upCell[0].scrollIntoView();
                    e.preventDefault();
                }
            }
        },
        selectMoveDown: function(e){
            var selected = $(".dataCellSelected");
            if($(".dataCellSelected").length > 0){
                if(selected.length > 1){
                    selected = selected.eq(0);
                }
                var tr = selected.closest("tr");
                var index = tr.children().index(selected);
                var next = tr.next();
                if(next.length > 0 && next[0].tagName == "TR"){
                    var upCell = tr.next().children().eq(index);
                    $(".dataCellSelected").removeClass("dataCellSelected");
                    upCell.addClass("dataCellSelected");
                    upCell[0].scrollIntoView(false);
                    e.preventDefault();
                }
            }
        },
        selectMoveLeft: function(){

        },
        selectMoveRight: function(){

        },
        onInputKeyPress: function(e){
            if(e.key == "Enter"){
                //var cellid = $(".dataCellSelected").attr("cellid").split("-");
                //this.datas[cellid[0]][cellid[1]] = $(".inputCell").val();
                // $(".dataCellSelected").html($(".inputCell").val());
                // $(".dataCellSelected").addClass("changed");
                // $(".inputCell").val("");
                $(e.target).closest(".inputDiv").hide();
            }
        },
        onInputBlur: function(e){
            $(".dataCellSelected").html($(".inputCell").val());
            $(".dataCellSelected").addClass("dataChangedCell");
            $(".inputCell").val("");
            $(e.target).closest(".inputDiv").hide();
        }
    }
})