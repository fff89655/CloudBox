var template = `
<div style="position:relative;width:100%;">
    <div style="width:100%;height:100%">
        <div style="width:100%;height:100%;">
            <div class="w3-cell w3-light-blue">
                <tr v-for="r in object.childRelationships">
                    <td>
                        {{r.childSObject}}
                    </td>
                    <td>
                        {{r.field}}
                    </td>
                </tr>
            </div>
            <div class="w3-cell">
                current
            </div>
            <div class="w3-cell w3-light-green">
                <table>
                    <tr v-for="r in refFields">
                        <td>
                            {{r.name}}
                        </td>
                        <td>
                            {{r.label}}
                        </td>
                        <td>
                            {{r.referenceTo[0]}}
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <svg style="width:100%;height:100%;">

        </svg>
    </div>
</div>
`;

Vue.component('obj-ref-map', {
    props:["object", "refFields"],
    template: template ,
    data: function(){
        return {};
    },
    created: function () {
        var res = this.object.childRelationships;
        var refFields = [];
        for (let i = 0; i < this.object.fields.length; i++) {
            const field = this.object.fields[i];
            if(field.type == "reference"){
                refFields.push(field);
            }
            console.log(field.type);
        }
        this.refFields = refFields;
        debugger;
        //referenceTo[0]
    },
    updated: function () {
        var res = this.object.childRelationships;
    },
    methods: {
    }
})