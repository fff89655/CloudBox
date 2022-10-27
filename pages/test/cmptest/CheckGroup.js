
var appData = {cv:"aaa,bbb"};

var vue = new Vue({
    el: '#app',
    data: appData,
    methods: {
        onCheckChange :function(){
            alert(this.cv);
        }
    }
  });
