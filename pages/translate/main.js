var parentWindow = window.parent;
var parentLoginInfor = parentWindow.g_getLoginInfor();
SalesforceAPI.LoginInfors = parentLoginInfor.LoginInfors;
SalesforceAPI.LoginInfor = parentLoginInfor.LoginInfor;


var appData = {objItems:[],
               result:null,
               htmlResult:null,
               targetObj:null,
               txt:null
              };
var objMap = null;

function init(){
  initFieldItems();
  var v = new Vue({
    el: '#app',
    data: appData,
    mounted:function(){
        $("#app").show();
    },
    methods: {
        objSelect:function(val){
            this.targetObj = val;
        },
        onNameToLabelClick:function(){
            if(!this.targetObj){
                alert("select object.");
                return;
            }
            let txt = this.txt;
            let t = new Translater(txt);
            let words = t.translateToLabel(objMap, this.targetObj);

            let targetTxtList = [];
            let lastIndex = 0;
            for(let word of words){
                if(word.label){
                    targetTxtList.push(txt.substring(lastIndex, word.index));
                    targetTxtList.push(`<span class="transword">${word.label}</span>`);
                    lastIndex = word.index + word.word.length;
                }else if(word.word == this.targetObj){
                    targetTxtList.push(txt.substring(lastIndex, word.index));
                    targetTxtList.push(`<span class="transword">${objMap[this.targetObj].label}</span>`);
                    lastIndex = word.index + word.word.length;
                }
            }
            if(lastIndex != txt.length){
                targetTxtList.push(txt.substring(lastIndex, txt.length));
            }
            this.htmlResult = targetTxtList.join("");
        },
        onLabelToNameClick:function(){
            if(!this.targetObj){
                alert("select object.");
                return;
            }
            let txt = this.txt;
            let t = new Translater(txt);
            let words = t.translateToName(objMap, this.targetObj);

            let targetHTMLLIst = [];
            let targetTxtList = [];
            let lastIndex = 0;
            
            let objLabel = objMap[this.targetObj].label;
            for(let word of words){
                if(word.name){
                    targetHTMLLIst.push(txt.substring(lastIndex, word.index));
                    targetHTMLLIst.push(`<span class="transword">${word.name}</span>`);
                    targetTxtList.push(txt.substring(lastIndex, word.index));
                    targetTxtList.push(word.name);
                    lastIndex = word.index + word.word.length;
                }
            }
            if(lastIndex != txt.length){
                targetHTMLLIst.push(txt.substring(lastIndex, txt.length));
                targetTxtList.push(txt.substring(lastIndex, txt.length));
            }
            this.htmlResult = targetHTMLLIst.join("");
            this.result = targetTxtList.join("");
        },
        onCopyClick:function(){
            navigator.clipboard.writeText(this.result);
        }
    }
  });
}


function loadData(){
  BaseAPI.loadObjMap(function(objMapP){
    appData.objMap = objMapP;
    objMap = objMapP;
    
    init();
  });
}
loadData();

function initFieldItems(){
    let objItems = [];
    for(let objName in objMap){
        objItems.push({value:objName, label:objMap[objName].label});
    }
    appData.objItems = objItems;
}

