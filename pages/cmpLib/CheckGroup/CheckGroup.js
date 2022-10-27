var template = `
<div class="checkGroup" >
    <button v-for="item of itemDatas" :class="{select:item.select,single:itemDatas.length==1}" @click="onclick(item)">{{item.label}}</button>
</div>
`;
Vue.component('check-group', {
    props: ["items", "multiselect", "value"],
    template: template,
    data: function () {
        return { val:"", itemDatas:[] };
    },
    created: function () {
        if(!this.items)return;
        this.createItemDatas();
        if(this.value) this.onValueChange(this.value);
    },
    watch: { 
        items: function(newVal, oldVal) {
            // this.createItemDatas();
        },
        value: function(newVal, oldVal){
            this.onValueChange(newVal);
        }
    },
    methods: {
        createItemDatas:function(){
            itemDatas = [];
            for(let item of this.items){
                itemDatas.push({label:item, select:false});
            }
            this.itemDatas = itemDatas;
        },
        onclick:function(item){
            let v = item.select;
            if(this.multiselect != true){
                for(let item of this.itemDatas){
                    item.select = false;
                }
            }
            item.select = !v;
            let val = [];
            for(let item of this.itemDatas){
                if(item.select) val.push(item.label);
            }
            this.value = val.join(",");
            this.$emit('input', this.value);
            this.$emit('onchange', this.value);
        },
        onValueChange:function(val){
            let vs = val.split(",");
            for(let item of this.itemDatas){
                if(vs.indexOf(item.label) >= 0) 
                {
                    item.select = true;
                }
            }
            this.value = val;
        }
    }
})