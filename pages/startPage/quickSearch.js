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
            <input id="visualfoceChk" v-model="options.vsChk" class="w3-check" type="checkbox" v-on:change="onSearchInput()">
            <label for="visualfoceChk">Visualforce Page</label>
        </div>
        <div class="w3-cell w3-padding w3-margin-left">
            <input id="apexChk" v-model="options.apexChk" class="w3-check" type="checkbox" v-on:change="onSearchInput()">
            <label for="apexChk">Apex</label>
        </div>
    </div>
    <div class="searchResult w3-padding">
        <div class="w3-row" v-for="r in searchResult">
            <template v-if="r.type=='Object'">
                <div class="objectColTitle w3-col w3-padding-small w3-border" style="width:100px">{{r.type}}</div>

                <div class="w3-col w3-padding-small w3-border" style="width:120px;">
                    <a target="_blank" href="" v-on:click="onObjRefClick(event, r.target.ref)">参照</a>
                </div>
                <div class="w3-col w3-padding-small w3-border" style="width:120px;">
                  <a v-on:click="onDefClick(event, r.target.ref)" href="/">定義</a>
                </div>
                <div class="w3-col w3-padding-small w3-border" style="width:100px;">
                    <a v-on:click="onDataClick(event, r.target.ref)" href="/">データ</a>
                </div>
                <div class="w3-col s3 w3-padding-small w3-border">{{r.target.ref.label}}</div>
                <div class="w3-col s3 w3-padding-small w3-border">{{r.target.ref.name}}</div>
                <div class="w3-rest w3-padding-small w3-border" v-html="r.txt"></div>
            </template>
            <template v-if="r.type=='Field'">
                <div class="fieldColTitle w3-col w3-padding-small w3-border" style="width:100px">{{r.type}}</div>

                <div class="w3-col w3-padding-small w3-border" style="width:90px;">
                    <a target="_blank" href="" v-on:click="onFieldRefClick(event, r.target)">項目参照</a>
                </div>
                <div class="w3-col w3-padding-small w3-border" style="width:80px;">
                    <a target="_blank" href="" v-on:click="onObjRefClick(event, r.target.object)">OBJ参照</a>
                </div>
                <div class="w3-col w3-padding-small w3-border" style="width:60px;">
                    <a v-on:click="onDefClick(event, r.target.object)" href="/">定義</a>
                </div>
                <div class="w3-col w3-padding-small w3-border" style="width:80px;">
                    <a v-on:click="onDataClick(event, r.target.object)" href="/">データ</a>
                </div>
                <div class="w3-col w3-padding-small w3-border" style="width:160px;">
                    <a v-on:click="onDataTypeClick(event, r)" href="/">{{r.dataType}}</a>
                </div>
                <div class="w3-col s3 w3-padding-small w3-border">{{r.target.objectName}}.{{r.target.ref.name}}</div>
                <div class="w3-col s3 w3-padding-small w3-border">{{r.target.objectLabel}} -> {{r.target.ref.label}}</div>
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
                searchTarget.push({searchKey:field.name, type:"Field" , object:obj, ref:field , objectName: obj.name , objectLabel:obj.label});
                searchTarget.push({searchKey:field.label, type:"Field" , object:obj, ref:field , objectName: obj.name , objectLabel:obj.label});
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
                  var txt = `${t1}<span class="hightLight">${t2}</span>${t3}`;
                  var dataType = target.ref.type;
                  if(target.ref.formula){
                    dataType = `数式（${target.ref.type}）`;
                  }
                  searchResult.push({target:target, txt:txt, type:target.type, dataType:dataType});
                  return;
              }
          });

          this.searchResult = searchResult;
      },
      onObjRefClick : function(e, obj){
        e.preventDefault();

        SalesforceAPI.getObjPageUrl(obj.name, url=>{
          window.open(url);
        });
      },
      onDefClick : function(e,obj){
        e.preventDefault();
        var param = `objectName=${obj.name}'`;
        window.parentWindow.g_openTabFromId('objDef', param);
      },
      onDataClick : function(e,obj){
        e.preventDefault();
        var param = `objectName=${obj.name}&initTab=dataTab'`;
        window.parentWindow.g_openTabFromId('objDef', param);
      },
      onFieldRefClick : function(e, field){
        e.preventDefault();

        SalesforceAPI.getFieldPageUrl(field.object.name, field.ref.name, url=>{
          window.open(url);
        });
      },
      onDataTypeClick : function(e, r){
       e.preventDefault();
       alert(r.target.ref.formula);
      }
    }
})