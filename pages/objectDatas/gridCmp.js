var gridTemplate = `
<div class="excel-grid" style="position:relative;width:100%;height:1500px;overflow:auto;" v-on:scroll="onScroll(event)">
    <div style="position:relative">
        <div v-html="c.val" v-for="c in gridCells" v-bind:class="c.class" v-bind:style="{ left: c.startX + 'px', top: c.startY + 'px', width: c.width + 'px', zIndex: c.zindex}">
            
        </div>
    </div>
</div>
`;

Vue.component('excel-grid', {
    // config:{startFreezeColName=xxx, titleInfo}
    // titleInfo:[{name:xxx,label:xxx},{name:xxx,label:xxx}]
    props:["config", "data"],
    template: gridTemplate ,
    data: function(){
        return {gridCells:[],data:[]};
    },
    watch: {
      data: function (val) {
        
        if(!this.config.rowHeight){
            this.config.rowHeight = 30;
        }

        this.config.titleInfo.forEach(title => {
            if(!title.width){
                title.width = 150;
            }
        });

        var currentWidth = 0;
        for (let index = 0; index < this.config.titleInfo.length; index++) {
            const ti = this.config.titleInfo[index];
            ti.startX = currentWidth;
            currentWidth += ti.width;
        }

        var gridCells = [];

        for (let index = 0; index < this.config.titleInfo.length; index++) {
            const ti = this.config.titleInfo[index];
            gridCells.push({
                row:-1, 
                col:index, 
                val:ti.label, 
                width:ti.width, 
                startX:ti.startX, 
                startY:0, 
                zindex:100,
                class:"excel-grid-data-head"});
        }

        var heightOffset = this.config.rowHeight;
        for(var row=0 ; row<this.data.length ; row++){
            var rowData = this.data[row];
            for(var col=0 ; col<this.config.titleInfo.length ; col++){
                var titleInfo = this.config.titleInfo[col];
                var cellData = rowData[titleInfo.name];
                var startY = (this.config.rowHeight * row) + heightOffset;
                gridCells.push({
                    row:row, 
                    col:col, 
                    val:cellData, 
                    width:titleInfo.width, 
                    startX:titleInfo.startX, 
                    startY:startY, 
                    zindex:10,
                    class:"excel-grid-data-cell"});
            }
        }

        var colWidth = [];

        this.gridCells = gridCells;
      }
    },
    // data:[{a=xx,b=xx,c=xx}]
    created:function(){

    },
    methods: {
        onScroll: function(e){
            var scrollTop = e.target.scrollTop
            this.gridCells.forEach(cell => {
                if(cell.class == "excel-grid-data-head"){
                    cell.startY = scrollTop;
                }
            });
        }
    }
})