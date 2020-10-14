var quickSearchTemplate = `
<div style="padding:3px;">
    <div>
    <div class="w3-cell" style="width:100%;">
        <input v-model="searchVal" class="searchInput w3-input w3-border" type="text" v-on:keydown="searchKeyDown(event)">
    </div>
    <div class="w3-cell">
        <button class="w3-button w3-white w3-border w3-border-blue" v-on:click="onSearchInput()">Search</button>
    </div>
    </div>
    <div>
        <div class="w3-cell w3-padding">
            <input id="objectChk" v-model="options.objectChk" class="w3-check" type="checkbox" v-on:change="onSearchInput()">
            <label for="objectChk">Object</label>
        </div>
        <div class="w3-cell w3-padding w3-margin-left">
            <input id="fieldChk" v-model="options.fieldChk" class="w3-check" type="checkbox" v-on:change="onSearchInput()">
            <label for="fieldChk">Field</label>
        </div>
        <div class="w3-cell w3-padding w3-margin-left">
            <input id="visualfoceChk" v-model="options.fieldChk" class="w3-check" type="checkbox" v-on:change="onSearchInput()">
            <label for="visualfoceChk">Visualforce Page</label>
        </div>
        <div class="w3-cell w3-padding w3-margin-left">
            <input id="apexChk" v-model="options.fieldChk" class="w3-check" type="checkbox" v-on:change="onSearchInput()">
            <label for="apexChk">Apex</label>
        </div>
    </div>
    <div class="searchResult w3-padding">
        <div class="w3-row" v-for="r in searchResult">
            <template v-if="r.type=='Object'">
                <div class="objectColTitle w3-col w3-padding-small w3-border" style="width:100px">{{r.type}}</div>

                <div class="w3-col w3-padding-small w3-border" style="width:100px;">
                    <a target="_blank" href=""
                        v-on:click="onObjRefClick(event, r.target.ref)">Refrence</a>
                </div>
                <div class="w3-col w3-padding-small w3-border" style="width:100px;">
                    <a v-bind:href="'/pages/objDef/index.html?objectName=' + r.target.ref.name " target="_blank">ObjDef</a>
                </div>
                <div class="w3-col w3-padding-small w3-border" style="width:100px;">
                    <a v-bind:href="'/pages/objectDatas/index.html?objectName=' + r.target.ref.name " target="_blank">Datas</a>
                </div>
                <div class="w3-col s3 w3-padding-small w3-border">{{r.target.ref.label}}</div>
                <div class="w3-col s3 w3-padding-small w3-border">{{r.target.ref.name}}</div>
                <div class="w3-rest w3-padding-small w3-border" v-html="r.txt"></div>
            </template>
            <template v-if="r.type=='Field'">
                <div class="fieldColTitle w3-col w3-padding-small w3-border" style="width:100px">{{r.type}}</div>

                <div class="w3-col w3-padding-small w3-border" style="width:100px;">
                    <a target="_blank" href=""
                        v-on:click="onObjRefClick(event, r.target.ref)">Refrence</a>
                </div>
                <div class="w3-col s3 w3-padding-small w3-border">{{r.target.objectLabel}} -> {{r.target.ref.label}}</div>
                <div class="w3-col s3 w3-padding-small w3-border">{{r.target.objectName}}.{{r.target.ref.name}}</div>
                <div class="w3-rest w3-padding-small w3-border" v-html="r.txt"></div>
            </template>
        </div>
    </div>
</div>
`;

Vue.component('quick-search', {
    props:["obj_map", "a"],
    template: quickSearchTemplate ,
    data: function(){
        return {searchVal:"", searchResult:[], searchTarget:[], options:{objectChk:true, fieldChk:true}};
    },
    created: function () {
        var searchTarget = [];

        Object.values(this.obj_map).forEach(obj => {
            searchTarget.push({searchKey:obj.name, type:"Object", ref:obj});
            searchTarget.push({searchKey:obj.label, type:"Object", ref:obj});
        });

        Object.values(this.obj_map).forEach(obj => {
            obj.fields.forEach(field => {
                searchTarget.push({searchKey:field.name, type:"Field" , ref:field , objectName: obj.name , objectLabel:obj.label});
                searchTarget.push({searchKey:field.label, type:"Field" , ref:field , objectName: obj.name , objectLabel:obj.label});
            });
        });

        this.searchTarget = searchTarget;

        $(function(){
            $(".searchInput").focus();
        });
    },
    methods: {
        searchKeyDown : function(e){
            if(e.keyCode == 13){
                this.onSearchInput();
            }
        },
        onSearchInput : function(){
            
            this.searchResult = null;

            if(!this.searchVal)return;

            var searchText = this.searchVal;

            var regex = new RegExp(`${searchText}`,"i");

            var searchResult = [];

            var searchTarget = [];

            this.searchTarget.forEach(target => {
                if(this.options.objectChk == true && target.type =="Object"){
                    searchTarget.push(target);
                }else if(this.options.fieldChk == true && target.type =="Field"){
                    searchTarget.push(target);
                }
            });

            searchTarget.forEach(target => {
                var r = regex.exec(target.searchKey);
                if(r!=null){
                    var t1 = target.searchKey.substring(0,r.index);
                    var t2 = r[0];
                    var t3 = target.searchKey.substring(r.index + r[0].length , target.searchKey.length);
                    var txt = `${t1}<span class="hightLight">${t2}</span>${t3}`
                    searchResult.push({target:target, txt:txt, type:target.type});
                    return;
                }
            });

            this.searchResult = searchResult;
        },
        onObjRefClick : function(e, obj){
            e.preventDefault();
            if(obj.custom){
                var searchName = obj.name.replace("__c","");
                if(searchName.indexOf("__") != -1){
                    searchName = searchName.substring(searchName.indexOf("__") + 2 , searchName.length);
                }
                
                SalesforceAPI.requestToolingApi("SELECT Id,DeveloperName FROM CustomObject WHERE DeveloperName='" + searchName + "'" ,function(doc,text){
                    var s = doc.records[0].Id;
                    window.open(SalesforceAPI.LoginInfo.domain + s+ "?setupid=CustomObjects");
                });
            }else{
                window.open(SalesforceAPI.LoginInfo.domain + "p/setup/layout/LayoutFieldList?type=" + obj.name);
    
            }
        }
    }
})