var template = `
<table class="obj-field-select" :style="{ width: width + 'px', height: height + 'px' }">
<tr>
    <td>
        <button @click="upsert">upsert</button>
    </td>
    <td>
    </td>
</tr>
</table>
`;

Vue.component('obj-field-select', {
    props: [],
    template: template,
    data: function () {
        return {  };
    },
    created: function () {
    },
    methods: {
    }
})