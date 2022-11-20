var template = `
<table class="obj-field-select" :style="{ width: width + 'px', height: height + 'px' }">
<tr>
    <td colspan="3">
        <button @click="display('string')">T</button>
        <button @click="display('double')">N</button>
        <button @click="display('boolean')">C</button>
        <button @click="display('picklist')">P</button>
        <button @click="display('reference')">R</button>
        <button @click="display('all')">ALL</button>
        <label for="csutomChk">custom only:</label><input id="csutomChk" v-model="input.customChk" type="checkbox" @click="customCheck" />
        <input type="text" @change="onFilterChange($event)" />
    </td>
</tr>
<tr>
    <td style="width:45%">
        <div class="unSelected-field" style="width:100%;margin-top:6px;" :style="{height: height + 'px' }" >
            <div v-for="f in unSelectedFields" @click="fieldClick(f)"
              :class="{ highlight:f.highlight?'highlight':'', hide:f.display?'':'hide'}">
                <span class="name"><span>{{!f.custom?'&#128274;':''}}</span>{{f.apiName}}</span><br />
                >&nbsp; <span class="label">{{f.label}}</span>
            </div>
        </div>
    </td>
    <td style="width:10%" class="btn-td" aligh="center">
        <button @click="add">></button>
        <button @click="remove"><</button>
        <button @click="addAll">>></button>
        <button @click="removeAll"><<</button>
    </td>
    <td style="width:45%">
        <div class="selected-field" style="width:100%;" :style="{  height: height + 'px' }" >
            <div v-for="f in selectedFields" @click="fieldClick(f)"
            :class="{ highlight:f.highlight?'highlight':'', hide:f.display?'':'hide'}">
                <span class="name">{{f.apiName}}</span><br />
                >&nbsp; <span class="label">{{f.label}}</span>
            </div>
        </div>
    </td>
</tr>
</table>
`;

Vue.component('obj-field-select', {
    props: ["object","selectedFieldNames","height","width"],
    template: template,
    data: function () {
        return { datas: [], headers:[], unSelectedFields:[], selectedFields:[], input:{customChk:false}};
    },
    created: function () {
        this.setSelected(this.selectedFieldNames?this.selectedFieldNames:[]);
    },
    methods: {
        fieldClick:function(f){
            f.highlight = !f.highlight;
        },
        customCheck:function(){
            for(field of this.unSelectedFields){
                if(this.input.customChk==false){
                    field.display = true;
                }else{
                    if(field.custom){
                        field.display = true;
                    }else{
                        field.display = false;
                    }
                }
            }
            this.clearHighLight();
        },
        display:function(type){
            for(field of this.unSelectedFields){
                if(type=="all"){
                    field.display = true;
                }else if(field.type !== type){
                    field.display = false;
                }else{
                    field.display = true;
                }
                
                if(this.input.customChk && !field.custom){
                    field.display = false;
                }
            }
            this.clearHighLight();
        },
        onFilterChange:function(e){
            let vs = e.target.value.split(/\W+/);
            
            for(let keyWord of vs){
                if(!keyWord) continue;
                let reg = new RegExp(keyWord,"i");

                let unSelectedFields = [];
                let selectedFields = this.selectedFields;

                for(field of this.unSelectedFields){
                    if(reg.test(field.apiName)){
                        selectedFields.push(field);
                    }else{
                        unSelectedFields.push(field);
                    }
                }
                this.unSelectedFields = unSelectedFields;
                this.selectedFields = selectedFields;
            }
        },
        clearHighLight:function(){
            for(field of this.unSelectedFields){
                field.highlight = false;
            }
            for(field of this.selectedFields){
                field.highlight = false;
            }
        },
        add:function(){
            let unSelectedFields = [];
            let selectedFields = this.selectedFields;
            for(field of this.unSelectedFields){
                if(field.highlight===true){
                    selectedFields.push(field);
                }else{
                    unSelectedFields.push(field);
                }
                field.highlight = false;
            }
            this.unSelectedFields = unSelectedFields;
            this.selectedFields = selectedFields;
        },
        remove:function(){
            let unSelectedFields = this.unSelectedFields;
            let selectedFields = [];
            for(field of this.selectedFields){
                if(field.highlight===true){
                    selectedFields.push(field);
                }else{
                    unSelectedFields.push(field);
                }
                field.highlight = false;
            }
            this.unSelectedFields = unSelectedFields;
            this.selectedFields = selectedFields;
        },
        addAll:function(){
            let unSelectedFields = [];
            let selectedFields = this.selectedFields;
            for(field of this.unSelectedFields){
                if(field.display){
                    selectedFields.push(field);
                    field.highlight = false;
                }else{
                    unSelectedFields.push(field);
                }
            }
            this.unSelectedFields = unSelectedFields;
            this.selectedFields = selectedFields;
        },
        removeAll:function(){
            let unSelectedFields = this.unSelectedFields;
            let selectedFields = [];
            for(field of this.selectedFields){
                unSelectedFields.push(field);
            }
            this.unSelectedFields = unSelectedFields;
            this.selectedFields = selectedFields;
        },
        getSelected:function(){
            let r = [];
            this.selectedFields.forEach(field => {r.push(field.apiName);});
            return r;
        },
        setSelected:function(fieldNames){
            let unSelectedFields = [];
            let selectedFields = [];
            for(field of this.object.fields){
                if(fieldNames.indexOf(field.name)>=0){
                    selectedFields.push({ apiName:field.name, label: field.label, type: field.type, custom: field.custom, highlight:false, display:true});
                }else{
                    unSelectedFields.push({ apiName:field.name, label: field.label, type: field.type, custom: field.custom, highlight:false, display:true});
                }
            }
            this.unSelectedFields = unSelectedFields;
            this.selectedFields = selectedFields;
        }
    }
})