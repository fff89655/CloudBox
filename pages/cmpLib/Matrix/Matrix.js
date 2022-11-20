var template = `
<div class="canvasTable">
    <canvas ref="canvas" :width="elWidth" :height="elHeight"></canvas>
</div>
`;
Vue.component('matrix', {
    props: ["width","height"],
    template: template,
    data: function () {
        return {elWidth:0,elHeight:0};
    },
    watch: { 
        width: function(newVal, oldVal) {
            this.matrix.resetSize(this.width, this.height);
        },
        height: function(newVal, oldVal) {
            this.matrix.resetSize(this.width, this.height);
        }
    },
    created: function () {
        this.elWidth = this.width;
        this.elHeight = this.height;
    },
    mounted: function(){
        this.matrix = new Matrix(this.$refs.canvas);
        if(this.headers && this.datas){
            this.matrix.showData(this.headers, this.datas);
        }
    },
    methods: {
        showObjDataWidthResize: function(headers, datas, width, height){
            this.headers = headers;
            this.datas = datas;
            this.matrix.showObjDataWidthResize(this.headers, this.datas, width, height);
        },
        showObjData: function(headers, datas){
            this.headers = headers;
            this.datas = datas;
            this.matrix.showObjData(this.headers, this.datas);
        },
        showData: function(headers, datas){
            this.headers = headers;
            this.datas = datas;
            this.matrix.showData(this.headers, this.datas);
        },
        getEditedRowObjs: function(){
            return this.matrix.getEditedRowObjs();
        },
        clearEdit: function(){
            this.matrix.clearEdit();
        },
        clear: function(){
            this.matrix.clear();
        },
        getSelectedCellRows: function(){
            return this.matrix.getSelectedRows();
        }
    }
})