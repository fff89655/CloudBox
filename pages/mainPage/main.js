SalesforceAPI.login(init);

var appData = {};

function init(){
  
  appData.loginInfors = SalesforceAPI.LoginInfors;
  appData.loginInfor = SalesforceAPI.LoginInfor;
  var vue = new Vue({
    el: '#app',
    data: appData,
    methods: {
      onMenuClick : function(e){
        var id = e.currentTarget.id;
        $(".menuDiv.selected").removeClass("selected");
        $(e.currentTarget).addClass("selected");
        g_openTabFromId(id);
      },
      onConnectClick : function(e){
        var loginName = $(e.currentTarget).find(".loginName").text();
        if(loginName == appData.loginInfor.userName) return;

        for (const loginInfor of SalesforceAPI.LoginInfors) {
          if(loginInfor.userName == loginName){
            appData.loginInfor = loginInfor;
            SalesforceAPI.LoginInfor = loginInfor;
            
            $("#mainFrame")[0].contentWindow.location.reload()

            break;
          }
        }
      }
    }
  });
}

var urlMap = {
  "search":"../startPage/index.html",
  "data":"../objectRelations/index.html",
  "objDef":"../objDef/index.html",
  "record":"../record/index.html",
  "sql":"../search/index.html",
  "config":"../config/index.html"
};

var tabTemplateMap = {
  "search":`<div class="tabDiv"><i class='fas fa-search tabIcon'></i></div>`,
  "data":`<div class="tabDiv"><i class='fas fa-database tabIcon'></i></div>`,
  "objDef":`<div class="tabDiv"><i class='fas fa-database tabIcon'></i></div>`,
  "record":`<div class="tabDiv"><i class='fas fa-file-alt tabIcon'></i</div>`,
  "sql":`<div class="tabDiv"><i class='fas fa-scroll tabIcon'></i></div>`,
  "config":`<div class="tabDiv"><i class='fas fa-tools tabIcon'></i></div>`
};

function g_openTabFromId(id, param){
  $(".tabDiv.selected").removeClass("selected");
  $(".tabFrame").hide();
  
  var src = urlMap[id];
  var param = param ? `?${param}` : '';

  var tabId = createTabId();

  var tab = $(tabTemplateMap[id]);
  tab.addClass("selected");
  tab.attr("tabId", tabId);
  tab.click(onTabClick);
  tab.contextmenu(onTabRightClick);

  
  var iframe = $(`<iframe class="tabFrame" src='${src}${param}' >`);
  iframe.attr("tabId", tabId);

  $("#tabRootDiv").append(tab);
  $("#frameDiv").append(iframe);

}

function onTabClick(e){

  var tabEl = $(e.currentTarget);

  if(tabEl.hasClass("selected")) return;

  $(".tabDiv.selected").removeClass("selected");
  $(".tabFrame").hide();

  var tabId = tabEl.attr("tabId");
  var iframeEl = $(`iframe[tabId='${tabId}']`);
  
  tabEl.addClass("selected");
  iframeEl.show();
}

var rightClickTab = null;
function onTabRightClick(e){
 var el = $(e.currentTarget);
 rightClickTab = el;
 var offset = el.offset();
 var tabMenu = $("#tabMenu");
 tabMenu.css("top",`${offset.top + el.height()}px`);
 tabMenu.css("left",`${offset.left}px`);
 tabMenu.addClass("w3-show");

 tabMenu.one("mouseleave",onTabMenuLeave);

 e.preventDefault();
}

function openFrame(src){
  // $("#iframeStack").append($("#mainFrame").children());
  // var iframe = $(`<iframe src='${src}' >`);
  // var frameEl = $("#mainFrame");
  // var width = frameEl.width();
  // var height = frameEl.height();
  // iframe.width(width);
  // iframe.height(height);
  // $("#mainFrame").append(iframe);
  $("#mainFrame")[0].src = src;
}

var seed = 0;

function createTabId(){
  seed++;
  return `tab${seed}`;
}

function onTabMenuLeave(e){
  hideTabMenu();
}

function hideTabMenu(){
  $("#tabMenu").removeClass("w3-show");
  rightClickTab = null;
}

function onTabMenuCloseClick(e){
  var tabEl = rightClickTab;

  var nextFocus = null;
  if(tabEl.hasClass("selected")){
    nextFocus = tabEl.next().length > 0 ? tabEl.next() : tabEl.prev().length > 0 ? tabEl.prev() : null;    
  }

  var tabId = tabEl.attr("tabId");

  var iframeEl = $(`iframe[tabId='${tabId}']`);

  tabEl.remove();
  iframeEl.remove();

  if(nextFocus){
    nextFocus.addClass("selected");
    var nextTabId = nextFocus.attr("tabId");
    var nextIframe = $(`iframe[tabId='${nextTabId}']`);
    nextIframe.show();
  }

  hideTabMenu();
}

function onTabMenuCloseOtherClick(e){

  var tabEl = rightClickTab;
  var tabId = tabEl.attr("tabId");

  var allTabMenu = $(".tabDiv");

  for (const tabMenu of allTabMenu) {
    tabMenuEl = $(tabMenu);
    var tabMenuId = tabMenuEl.attr("tabId");
    if(tabId != tabMenuId){
      var tabMenuIframe = $(`iframe[tabId='${tabMenuId}']`);
      tabMenuEl.remove();
      tabMenuIframe.remove();
    }
  }

  if(!tabEl.hasClass("selected")){
    tabEl.addClass("selected");
    var iframeEl = $(`iframe[tabId='${tabId}']`);
    iframeEl.show();
  }

  hideTabMenu();
}

function onTabMenuCloseAllClick(e){

  var allTabMenu = $(".tabDiv");
  for (const tabMenu of allTabMenu) {
    tabMenuEl = $(tabMenu);
    var tabMenuId = tabMenuEl.attr("tabId");
    var tabMenuIframe = $(`iframe[tabId='${tabMenuId}']`);
    tabMenuEl.remove();
    tabMenuIframe.remove();
  }

  hideTabMenu();
}

$(function(){
  $("#tabMenu_close").click(onTabMenuCloseClick);
  $("#tabMenu_closeOther").click(onTabMenuCloseOtherClick);
  $("#tabMenu_closeAll").click(onTabMenuCloseAllClick);
});

function g_getLoginInfor(){
  var result = {LoginInfor:null, LoginInfors:[]};
  for (const login of SalesforceAPI.LoginInfors) {
    var l = {};
    for (const p in login) {
      l[p] = login[p];
    }
    if(login.userName == SalesforceAPI.LoginInfor.userName){
      result.LoginInfor = l;
    }
    result.LoginInfors.push(l);
  }
  return result;
}

