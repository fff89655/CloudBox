// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// let changeColor = document.getElementById('changeColor');

// chrome.storage.sync.get('color', function(data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);
// });

var loginInfo = {};
$(function(){
  login(function(sessionId, domain, loginDoc){
    loginInfo.sessionId = sessionId;
    loginInfo.loginDoc = loginDoc;
    loginInfo.domain = domain;
    appData.loginInfo = loginInfo;
  });
})

function loadObject(){
  requestToolingApi(loginInfo.sessionId,'SELECT Id,Label,DeveloperName FROM EntityDefinition', function(searchDoc){ //SELECT Id,DeveloperName,ExternalName FROM CustomObject
    var rootDiv = $("<div>");
    appData.objects = [];
    $(searchDoc).find("records").each(function(){
      console.log($(this).find("sf\\:DeveloperName").html());
      appData.objects.push({name:$(this).find("sf\\:DeveloperName").html() + "__c",
                            id:$(this).find("sf\\:Id").html(),
                            label:$(this).find("sf\\:Label").html()});
    });
    $(document.body).append(rootDiv);
  })
}

function openCity(evt, cityName) {
  $(".tabDiv").hide();
  $(".tablink").removeClass("w3-red");

  var targetId = $(evt.currentTarget).attr("target");
  $("#" + targetId).show();
  $(evt.currentTarget).addClass("w3-red");

  if(targetId == "Object"){
    loadObject();
  }
}

$(".tablink").click(openCity)

var appData = {objects:[]};
var v = new Vue({
  el: '#objectApp',
  data: {appData:appData},
  methods: {
  }
});