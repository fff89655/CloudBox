var template = `
<div class="canvasTable">
    <canvas ref="canvas"></canvas>
</div>
`;
Vue.component('canvas-table', {
    props: ["datas,headers"],
    template: template,
    data: function () {
        return {dataCells:[],headerCells:[]};
    },
    created: function () {
        this.dataCells = this.datas;
        this.headerCells = this.headers;
    },
    mounted: function(){
        let c = this.$refs.canvas;
        var ctx = c.getContext("2d");
        ctx.font = "14px ヒラギノ角ゴ Pro,Hiragino Kaku Gothic Pro,メイリオ,Meiryo,Osaka,ＭＳ Ｐゴシック,MS PGothic,sans-serif";
        let r = ctx.measureText("発行する方法");
        ctx.moveTo(0, 0);
        ctx.lineTo(200, 100);
        ctx.stroke();
        debugger;
    },
    methods: {
    }
})