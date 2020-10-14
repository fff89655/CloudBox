
function searchSessionIdCookie(callback, errorCallback){
    chrome.cookies.getAll({}, function(cookies) {
        cookies.forEach(cookie => {
            if(cookie.domain.endsWith("salesforce.com")
               && cookie.name == "sid"){
                   document.write(cookie.value)
                   callback(cookie);
                   return;
               }
        });
        if(errorCallback){
            errorCallback("not found");
        }
    });
}