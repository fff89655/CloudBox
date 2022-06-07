SalesforceAPI.login(init);

var appData = {};

function initData(){

     
}

function init(){
  
    appData.loginInfors = SalesforceAPI.LoginInfors;
    appData.loginInfor = SalesforceAPI.LoginInfor;
  
    SalesforceAPI.requestData('SELECT Id,Name FROM User' , function(r){
        let datas = [];
        for(let row of r.records){
         datas.push({Id:row.Id,
                     Name:row.Name});
        }
        appData.datas = datas;
        
        var vue = new Vue({
            el: '#app',
            data: appData,
            methods: {},
            mounted : function(){
                new Handsontable($("#grid")[0], {
                    data: appData.datas,
                    columns: [{data:'Id'},
                              {data:'Name'}],
                    rowHeaders: true,
                    colHeaders: ['Id','Name'],
                    columnSorting: true,
                    //columnHeaderHeight: 60,
                    manualRowResize: true,
                    //rowHeights: 35,
                    filters: true,
                    dropdownMenu: true
                });
            }
        });
    });


}
