

// SalesforceAPI.login(init);

// function init(){
//     BaseAPI.loadObjMap(function(objMap){
//         appData.objMap = objMap;
//     });
// }


var appData = {objMap:null, searchResult:[] };
var v = new Vue({
    el: '#app',
    data: { appData:appData },
    methods: {
        onMenuClick : function(e){
            window.open($(e.target).attr("href"));
        },
        onSearchInput : function(e){
            var searchText = e.target.value;

            var regex = new RegExp(`^${searchText}`,"i");

            var searchResult = [];
            Object.values(this.appData.objMap).forEach(obj => {
                var r = regex.exec(obj.name);
                if(r!=null){
                    var t1 = obj.name.substring(0,r.index);
                    var t2 = r[0];
                    var t3 = obj.name.substring(r.index + r[0].length , obj.name.length);
                    var txt = `${t1}<span class="hightLight">${t2}</span>${t3}`
                    searchResult.push({obj:obj, txt:txt});
                    return;
                }
                
                var r = regex.exec(obj.label);
                if(r!=null){
                    var t1 = obj.label.substring(0,r.index);
                    var t2 = r[0];
                    var t3 = obj.label.substring(r.index + r[0].length , obj.name.length);
                    var txt = `${t1}<span class="hightLight">${t2}</span>${t3}`
                    searchResult.push({obj:obj, txt:txt});
                    return;
                }

            });

            this.appData.searchResult = searchResult;
        },
        onClearDataClick : function(){
            ChromeAPI.removeLocalData("objMap",function(){alert("clear over.")});
            //ChromeAPI.clearLocalData(function(){alert("clear over.")});
        }
    }
});
