var template = `
<div class="combobox" style="display:inline-block">
    <input type="text" ref="input" v-model="value"
      @input="onInput" @keydown="onKeyDown($event)" @focus="onFocus" @focusout="onFocusout"/>
    <img class="pulldownicon" src="/imgs/pulldown.svg" @click="iconClick" />
    <div class="dropdownDiv" v-show="showDropdown">
        <table class="headerTable">
            <tr>
                <td :style="{width:header0Width+'px'}">api Name</td>
                <td v-if="showLabels_v">Label</td>
            </tr>
        </table>
        <div ref="dropdownDiv" class="selectItems">
            <table class="cbDataTable">
                <tr v-for="item of itemDatas" v-show="item.show" :class="{highlight:item.highlight}"
                  @mousedown="onItemClick(item)">
                    <td>{{item.value}}</td>
                    <td v-if="showLabels_v">{{item.label}}</td>
                </tr>
            </table>
        </div>
    </div>
</div>
`;
Vue.component('combobox', {
    props: ["items", "showLabels", "value"],
    template: template,
    data: function () {
        return { val:"", itemDatas:[] , showLabels_v:false, showDropdown:false, highlightIndex:null,header0Width:100};
    },
    created: function () {
        if(!this.items)return;
        this.createItemDatas();
    },
    watch: { 
        items: function(newVal, oldVal) {
            this.createItemDatas();
        }
    },
    methods: {
        createItemDatas:function(){
            itemDatas = [];
            for(let item of this.items){
                if(typeof(item) == "string"){
                    itemDatas.push({value:item, label:item, show:true, select:false, highlight:false});
                    if(this.showLabels==undefined) this.showLabels_v = false;
                }else{
                    itemDatas.push({value:item.value, label:item.label, show:true, select:false, highlight:false});
                    if(this.showLabels==undefined) this.showLabels_v = true;
                }
            }
            this.itemDatas = itemDatas;
        },
        onInput:function(){
            if(this.value){
                let reg = new RegExp(this.value,"i");
                for(let item of this.itemDatas){
                    if(reg.test(item.value)){
                        item.show = true;
                    }else{
                        if(reg.test(item.label)){
                            item.show = true;
                        }else{
                            item.show = false;
                        }
                    }
                }
            }
        },
        onFocus:function(){
            this.showItems();
        },
        onFocusout:function(){
            this.hideItems();
        },
        onKeyDown:function(e){
            console.log(e.key);
            if(e.key == "ArrowUp"){
                if(this.highlightIndex == null){
                    return;
                }
                this.itemDatas[this.highlightIndex].highlight = false;
                this.highlightIndex = this.getPrevIndex(this.highlightIndex);
                this.itemDatas[this.highlightIndex].highlight = true;

                let itemEl = $(this.$refs.dropdownDiv).find("tr")[this.highlightIndex];
                itemEl.scrollIntoViewIfNeeded(false);
            }else if(e.key == "ArrowDown"){
                if(this.highlightIndex == null){
                    this.highlightIndex = -1;
                }else{
                    this.itemDatas[this.highlightIndex].highlight = false;
                }
                this.highlightIndex = this.getNextIndex(this.highlightIndex);
                this.itemDatas[this.highlightIndex].highlight = true;

                let itemEl = $(this.$refs.dropdownDiv).find("tr")[this.highlightIndex];
                itemEl.scrollIntoViewIfNeeded();
            }else if(e.key == "Enter"){
                if(this.highlightIndex == null){
                    return;
                }
                this.setValue(this.itemDatas[this.highlightIndex].value);
                this.hideItems();
            }
        },
        getPrevIndex(index){
            for(let i=index-1; i>=0; i--){
                let item = this.itemDatas[i];
                if(item.show){
                    return i;
                }
            }
            return index;
        },
        getNextIndex(index){
            for(let i=index+1; i<this.itemDatas.length; i++){
                let item = this.itemDatas[i];
                if(item.show){
                    return i;
                }
            }
            return index;
        },
        onItemClick:function(item){
            this.setValue(item.value);
            this.showDropdown = false;
        },
        setValue:function(val){
            this.value = val;
            this.$emit('input', this.value);
            this.$emit('onchange', this.value);
        },
        showItems:function(){
            this.computeHeaderWidth();
            this.showDropdown = true;
        },
        hideItems:function(){
            this.showDropdown = false;
            this.highlightIndex = null;
        },
        iconClick:function(){
            this.$refs.input.focus();
        },
        computeHeaderWidth(){
            let me = this;
            setTimeout(function(){
                me.header0Width = me.$refs.dropdownDiv.querySelectorAll("tr:first-child")[0].children[0].offsetWidth;
            },0);
        }
    }
})