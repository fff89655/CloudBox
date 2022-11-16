var template = `
<div class="sqlPanel">
    <div>
        <div class="tabItem" :class="{selected:showSql}" @click="onShowSQL">SQL</div>
        <div class="tabItem" :class="{selected:showHistory}" @click="onShowHistory">HISTORY</div>
    </div>
    <div v-show="showSql" style="height:calc(100% - 40px)">
        <tree-grid title="sql" :editable="true" 
          v-bind:tree_data="sqlList" 
          :menus="sqlMenu"
          @onrowclick="onSqlClick" @onaddchild="onAddSql" 
          @ondeletechild="onDeleteSql" @onrename="onRenameSql"
          @onsaveto="onSaveTo"></tree-grid>
    </div>
    <div v-show="showHistory" style="height:calc(100% - 40px)">
        <tree-grid title="history" ref="historyTree" :editable="false" 
        v-bind:tree_data="historyList"
        @onrowclick="onSqlClick"></tree-grid>
    </div>
<div>
`;
Vue.component('sqlpanel', {
    props: [],
    template: template,
    data: function () {
        return {sqlMenu:[{label:"save to", eventName:"onsaveto"}],
                sqlList:null,
                historyList:null,
                showSql:true,
                showHistory:false};
    },
    created: function () {
        let me = this;
        ChromeAPI.getLocalData("SQLListMap",function(sqlListMap){
            if(!sqlListMap.SQLListMap){
                sqlListMap.SQLListMap = {title:"sql"};
                ChromeAPI.saveLocalData("SQLListMap", sqlListMap.SQLListMap);
            }
            me.sqlList = sqlListMap.SQLListMap;
        });
        
        ChromeAPI.getLocalData("HistorySQLListMap",function(historySQLListMap){
            if(!historySQLListMap.HistorySQLListMap){
                historySQLListMap.HistorySQLListMap = {title:"history", children:[]};
                ChromeAPI.saveLocalData("HistorySQLListMap", historySQLListMap.HistorySQLListMap);
            }
            me.historyList = historySQLListMap.HistorySQLListMap;
        });
    },
    watch: { 
    },
    methods: {
        onSqlClick:function(node){
            this.$emit('onsqlclick', node);
        },
        onAddSql:function(node){
            ChromeAPI.saveLocalData("SQLListMap", this.sqlList);
        },
        onDeleteSql:function(node){
            ChromeAPI.saveLocalData("SQLListMap", this.sqlList);
        },
        onRenameSql:function(node){
            ChromeAPI.saveLocalData("SQLListMap", this.sqlList);
        },
        onShowSQL:function(){
            this.showSql = true;
            this.showHistory = false;
        },
        onShowHistory:function(){
            this.showSql = false;
            this.showHistory = true;
        },
        onSaveTo:function(node){
            this.$emit('onsaveto', node);
            ChromeAPI.saveLocalData("SQLListMap", this.sqlList, function(){
                alert("save over.");
            });
        },
        addHistory:function(title, sql){
            let me = this;
            setTimeout(function(){
                let newHistory = [];
                newHistory.push({title:title, sql:sql});
    
                let n = 0;
                for(let hd of me.historyList.children){
                    if(hd.sql == sql){
                        continue ;
                    }else{
                        newHistory.push(hd);
                    }
                    n++;
                    if(n>50){
                        break;
                    }
                }
    
                me.historyList.children = newHistory;
    
                ChromeAPI.saveLocalData("HistorySQLListMap", me.historyList);
                me.$refs.historyTree.loadTreeData(me.historyList);
            },0);
        }
    }
})