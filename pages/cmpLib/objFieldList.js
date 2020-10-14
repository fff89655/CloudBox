var template = `
<div style="position:relative;width:100%;">
<div class="fixHeaderDiv" style="overflow:hidden">
    <table class="w3-table-all w3-dataHeader">
    </table>
</div>
<div class="scrollDiv" style="height:calc(100% - 42px);overflow-x:scroll;" v-on:scroll="onscroll(event)">
    <table class="w3-table-all w3-dataBody">
        <tr class="w3-dataHeaderTr">
            <th>
                <div></div>
            </th>
            <th>
                <div>
                    Name
                </div>
            </th>
            <th>
                <div>
                    Label
                </div>
            </th>
            <th>
                <div>
                    Type
                </div>
            </th>
            <th>
                <div>
                    isCustom
                </div>
            </th>
            <th>
                <div>
                </div>
            </th>
            <!--<th style="width:17px;background:#f1f1f1;"></th>-->
        </tr>
        <tr v-for="(f,index) in object.fields">
            <td>
                <i class="material-icons w3-large font-Marina" title="Item">featured_play_list</i>
                {{index+1}}
            </td>
            <td>{{f.name}}</td>
            <td>{{f.label}}</td>
            <td>{{f.type}}</td>
            <td>{{f.custom}}</td>
            <td style="padding:0;">
                <a class="w3-button w3-white w3-border w3-border-blue w3-round-large" href="" @click.prevent="onRefClick(f)" target="_blank">Ref</a>
            </td>
        </tr>
    </table>
</div>
</div>
`;

Vue.component('obj-field-list', {
    props:["object"],
    template: template ,
    data: function(){
        return {};
    },
    created: function () {
    },
    updated: function () {

        var scrollDiv =  $(this.$el).find(".scrollDiv")[0];
        if(scrollDiv.scrollHeight <= scrollDiv.clientHeight){
            return;
        }

        var headerTr = $(this.$el).find(".w3-dataHeaderTr");
        var newHeaderTr = headerTr.clone();
        var tds = headerTr.children();
        var newTds = newHeaderTr.children();
        for (let i = 0; i < newTds.length; i++) {
            const t = tds.eq(i).children().eq(0);
            const nt = newTds.eq(i).children().eq(0);
            nt.css("width", t[0].offsetWidth + "px");
        }

        var scrollOffsetTd = $("<th><div style='width:17px'></div></th>");
        newHeaderTr.append(scrollOffsetTd);

        var headerTable = $(this.$el).find(".w3-dataHeader");
        headerTable.append(newHeaderTr);

        scrollDiv.scrollTop = 40;
    },
    methods: {
        onscroll : function(e){
            $(this.$el).find(".fixHeaderDiv")[0].scrollLeft = e.target.scrollLeft;
            if(e.target.scrollTop < 40){
                e.target.scrollTop = 40;
                e.preventDefault();
            }
        },
        onRefClick : function(f){
            var objRef = null;
            if(this.object.custom == true){

                var objName = this.object.name.replace("__c","");
                if(objName.indexOf("__") != -1){
                    objName = objName.substring(objName.indexOf("__") + 2 , objName.length);
                }
                
                SalesforceAPI.requestToolingApi("SELECT Id,DeveloperName FROM CustomObject WHERE DeveloperName='" + objName + "'" ,function(doc,text){

                    var objId = doc.records[0].Id;

                    if(f.custom == true){
                        var filedName = f.name.replace("__c","");
                        if(filedName.indexOf("__") != -1){
                            filedName = filedName.substring(filedName.indexOf("__") + 2 , filedName.length);
                        }
                        SalesforceAPI.requestToolingApi(`SELECT Id FROM CustomField WHERE TableEnumOrId='${objId}' AND DeveloperName='${filedName}'` ,function(doc,text){
                            var fieldId = doc.records[0].Id;
                            window.open(SalesforceAPI.LoginInfo.domain + `${fieldId}?setupid=CustomObjects`);
                        });
                    }else{
                        window.open(SalesforceAPI.LoginInfo.domain + `_ui/common/config/field/StandardFieldAttributes/d?id=${f.name}&type=${objId}`);
                    }

                });
            }else{
                if(f.custom == true){
                    var filedName = f.name.replace("__c","");
                    if(filedName.indexOf("__") != -1){
                        filedName = filedName.substring(filedName.indexOf("__") + 2 , filedName.length);
                    }
                    SalesforceAPI.requestToolingApi(`SELECT Id FROM CustomField WHERE TableEnumOrId='${objId}' AND DeveloperName='${filedName}'` ,function(doc,text){
                        var fieldId = doc.records[0].Id;
                        window.open(SalesforceAPI.LoginInfo.domain + `${fieldId}?setupid=CustomObjects`);
                    });
                }else{
                    window.open(SalesforceAPI.LoginInfo.domain + `_ui/common/config/field/StandardFieldAttributes/d?id=${f.name}&type=${this.object.name}`);
                }
            }

        }
    }
})