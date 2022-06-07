var template = `
<div style="position:relative;width:100%;">
<div class="fixHeaderDiv" style="overflow:hidden">
    <table class="w3-table-all w3-dataHeader">
    </table>
</div>
<div class="scrollDiv" style="height:calc(100%);overflow-x:scroll;">
    <div id="fieldList"></div>
    <div style="display:none;">{{object.name}}</div>
</div>
</div>
`;

Vue.component('obj-field-list', {
    props:["object"],
    template: template ,
    data: function(){
        return {};
    },
    mounted: function () {
    },
    updated: function () {
        let datas = [];
        for(let f of this.object.fields){
            datas.push({Name:f.name,Label:f.label,Type:f.type,isCustom:f.custom,ref:''});
        }
        
        function editedRender(instance, td, row, col, prop, value, cellProperties) {
            Handsontable.renderers.TextRenderer.apply(this, arguments);
        }
        
        Handsontable.renderers.registerRenderer('editedRender', editedRender);

        var objName = this.object.name;
        var actionColRenderer = function (instance, td, row, col, prop, value, cellProperties) {
            var button = $('<a href="">');
            button.html("Ref")
            //button.attr("objName", objName);
            button.attr("fieldName", value);
            button.click(function(e){
                SalesforceAPI.getFieldPageUrl(objName, $(this).attr("fieldName"), url => {
                    window.open(url);
                  });
                e.preventDefault();
            });
            $(td).empty().append(button);
        };
        
        new Handsontable($("#fieldList")[0], {
            data: datas,
            columns: [{data:'Name'},
                      {data:'Name'},
                      {data:'Label'},
                      {data:'Type'},
                      {data:'isCustom'}],
            rowHeaders: true,
            colHeaders: ['ref','Name','Label','Type','isCustom'],
            columnSorting: true,
            cells: function (row, col) {
                var cellProperties = {};

                if(col == 0){
                    cellProperties.renderer = actionColRenderer;
                }else{
                    cellProperties.renderer = editedRender;
                }

                return cellProperties;
            },
            //columnHeaderHeight: 60,
            manualRowResize: true,
            //rowHeights: 35,
            filters: true,
            //readOnly: true,
            dropdownMenu: true
        });
        
    },
    methods: {
        onscroll : function(e){
        }
    }
})