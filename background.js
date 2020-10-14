// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({

      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
chrome.commands.onCommand.addListener(function (command) {
  console.log('Command:', command);
  if (command === "openSearch" || command === "openSearchGlobal") {
    chrome.tabs.create({ url: "/pages/startPage/index.html" });
  }

});