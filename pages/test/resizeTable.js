// SalesforceAPI.login(init);

// var appData = {};

// function init(){
  
//   appData.loginInfors = SalesforceAPI.LoginInfors;
//   appData.loginInfor = SalesforceAPI.LoginInfor;

//   SalesforceAPI.requestData('SELECT Id,Name FROM User' , function(r){
//    let datas = [];
//    for(let row of r.records){
//     datas.push({Id:row.Id,
//                 Name:row.Name});
//    }
//    appData.datas = datas;

//    var vue = new Vue({
//      el: '#app',
//      data: appData,
//      methods: {}
//    });
//   });


// }


function getMouseLocation(e){
    if(e.offsetY < 0){
        if(e.offsetX < 0){
            return "left-top";
        }else if(e.offsetX > e.target.clientWidth){
            return "right-top";
        }else{
            return "center-top"
        }
    }else if(e.offsetY > e.target.clientHeight){
        if(e.offsetX < 0){
            return "left-bottom"
        }else if(e.offsetX > e.target.clientWidth){
            return "right-bottom"
        }else{
            return "center-bottom"
        }
    }else if(e.offsetX < 0){
        return "left-center";
    }else if(e.offsetX > e.target.clientWidth){
        return "right-center";
    }else{
        return "center";
    }
}

$(".resizeable").mousemove(function(e){
    let loc = getMouseLocation(e);
    if(loc == "left-top"){
        $(this).css("cursor","nwse-resize");
    }else if(loc == "right-top"){
        $(this).css("cursor","nesw-resize");
    }else if(loc == "center-top"){
        $(this).css("cursor","ns-resize");  
    }else if(loc == "left-bottom"){
        $(this).css("cursor","nesw-resize");
    }else if(loc == "right-bottom"){
        $(this).css("cursor","nwse-resize");
    }else if(loc == "center-bottom"){
        $(this).css("cursor","ns-resize");  
    }else if(loc == "left-center"){
        $(this).css("cursor","ew-resize");
    }else if(loc == "right-center"){
        $(this).css("cursor","ew-resize");
    }else{
        $(this).css("cursor","auto");
    }
});

$(".resizeable").mousedown(function(e){
    let loc = getMouseLocation(e);
    if(loc == "center-bottom"){

        $(window).mousemove(function(e){
            console.log(e.clientY);
        });
    }
});