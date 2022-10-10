var template = `
<div class="upsert-panel" :style="{ minWidth: width + 'px', maxHeight: height + 'px' }">
    <div>
        <button @click="onUpsert">upsert</button>
        <button @click="onCancle">cancle</button>
    </div>
    <div style="margin-top:10px;">
        オブジェクト：<combobox v-bind:items="objitems" v-model="objName" @onchange="onObjChange"></combobox>
        ファイル：<input id="upload" type="file" accept="text/csv" name="f" @change="onchange($event)">
    </div>
    <div style="margin-top:10px;" v-show="uploadFields.length>0">
        更新キー:<combobox ref="keyCmp" v-bind:items="keyItems" v-model="key"></combobox>
        更新項目：<button @click="remove">除外</button>
    </div>
    <div v-if="uploadFields.length>0" class="fields" style="width:100%;margin-top:6px;" :style="{maxHeight: height-90 + 'px' }">
        <div v-for="f in uploadFields" @click="fieldClick(f)"
          :class="{ highlight:f.highlight?'highlight':''}">
            <span class="name">{{f.apiName}}</span><br />
            >&nbsp; <span class="label">{{f.label}}</span>
        </div>
    </div>
</div>
`;

Vue.component('upsert-panel', {
    props: ["width","height","objitems"],
    template: template,
    data: function () {
        return {objName:null, uploadFields:[], csvTxt:null, keyItems:[], key:null, csvArray:[]};
    },
    created: function () {
    },
    methods: {
        onchange:function(e){
            let files = e.target.files;
        
            let f = files[0];
            
            let reader = new FileReader();
            let me = this;

            reader.onload = (function(theFile) {
                return function(e) {
                    me.csvTxt = e.target.result;
                    me.onInput();
                };
              })(f);
        
              reader.readAsText(f);
        },
        onCancle:function(){
            this.$emit('oncancle');
        },
        onObjChange:function(){
            this.onInput();
        },
        onInput:function(){
            if(!this.objName || !this.csvTxt){
                return;
            }
            this.csvArray = $.csv.toArrays(this.csvTxt);
            let csvHeader = this.csvArray[0];
            let obj = objMap[this.objName];
            
            if(obj){
              let uploadFields = [];
              let filedMap = {};
              for(let field of obj.fields){
                  filedMap[field.name] = field;
              }
              for(let h of csvHeader){
                  let f = filedMap[h];
                  if(f){
                      uploadFields.push({apiName:h,label:f.label,highlight:false});
                  }
              }
              this.uploadFields = uploadFields;
              
              let keyItems = [];
              for(let f of this.uploadFields){
                if(f.apiName == 'Id'){
                    this.$refs.keyCmp.setValue("Id");
                }
                keyItems.push(f.apiName);
              }
              this.keyItems = keyItems;
            }
        },
        fieldClick:function(f){
            f.highlight = !f.highlight;
        },
        remove:function(){
            let uploadFields = [];
            for(let f of this.uploadFields){
                if(!f.highlight){
                    uploadFields.push(f);
                }
            }
            this.uploadFields = uploadFields;
        },
        onUpsert:async function(){
            let msg = [];
            if(!objMap[this.objName]){
                msg.push("オブジェクトを選択してください。");
            }
            if(!this.csvTxt){
                msg.push("アップロードファイルを選択してください。");
            }
            if(msg.length > 0){
                alert(msg.join("\n"));
                return;
            }

            let headerRow = this.csvArray[0];

            let targetColIndex = [];

            // get updata col index
            for(let i=0; i<headerRow.length; i++){
                for(let uploadFiled of this.uploadFields){
                    if(uploadFiled.apiName == headerRow[i]){
                        targetColIndex.push(i);
                        break;
                    }
                }
            }

            let upsertRecords = [];
            for(let rowNo=1; rowNo<this.csvArray.length ;rowNo++){
                let record = {};
                for(let index of targetColIndex){
                    let header = headerRow[index];
                    let value = this.csvArray[rowNo][index];
                    record[header] = value;
                }
                upsertRecords.push(record);
            }
            debugger;
            let n=0;
            for(let record of upsertRecords){
                if(record.Id){
                    await SalesforceAPI.requestSaveDataSync(this.objName, record.Id, JSON.stringify(record));
                    console.log("update完了.id:" + record.Id);
                }else{
                    await SalesforceAPI.requestCreateDataSync(this.objName, JSON.stringify(record));
                    console.log("insert完了.");
                }
                n++;
            }

            alert("upsert完了。");
        }
    }
})