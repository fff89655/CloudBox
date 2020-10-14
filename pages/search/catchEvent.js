
var stopEditorEventflg = false;
var editorFns = [];
var firstFlg = true;
var editorKeyDown = null;
function editorKeyDownWrap(e){
    if(editorKeyDown)editorKeyDown(e);
};
var f = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, fn, capture) {
    this.f = f;
    if(this.tagName == "TEXTAREA" && type == "keydown"){
        if(this.className && this.className.indexOf("ace_text-input") !=-1){
            if(firstFlg){
                this.f(type, editorKeyDownWrap, capture);
                firstFlg = false;
            }
            this.f(type, function(a1,a2,a3,a4,a5){ if(!stopEditorEventflg) fn(a1,a2,a3,a4,a5)}, capture);
            return;
        }
    }
    this.f(type, fn, capture);
}