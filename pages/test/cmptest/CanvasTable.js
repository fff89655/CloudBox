
var appData = {width:1200,height:500};

SalesforceAPI.login(init);

function init(){
  
  appData.loginInfors = SalesforceAPI.LoginInfors;
  appData.loginInfor = SalesforceAPI.LoginInfor;
  initVue();
}

function initVue(){
       
    var vue = new Vue({
        el: '#app',
        data: appData,
        mounted: function(){
            let datas = [];
            var headers = [];
            for (let i = 0; i < 200; i++) {
                let row = [];
                for (let j = 0; j < 30; j++) {
                    let v = `D_${i}_${j}`;
                    row.push(v);
                    if(i==0){
                        headers.push(`head_${j}`)
                    }
                    
                }
                datas.push(row);
            }
        
            this.$refs.m.showData(headers, datas);
        },
        methods: {
            onchangeData:function(){
                let me = this;
                SalesforceAPI.requestData("SELECT Id,Name FROM User" , function(result){
                    let headers=["Id","Name"],datas=[];
                    for(let r of result.records){
                        datas.push(r);
                    }
                    
                    me.$refs.m.showObjData(headers, datas);
                });
            },
            onChangeSize:function(){
                appData.width = 600;
            }
        }
    });
    
}