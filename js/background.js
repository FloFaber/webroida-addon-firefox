browser.contextMenus.create({
  id: "addq",
  title: "Ind Q damit",
  contexts: ["link"]
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
  if(info.menuItemId == "addq"){
    var link = info.linkUrl;
    browser.storage.local.get({
      host: "",
      configured: ""
    }, function(items){
      host = items.host;
      configured = items.configured; //check if plugin is configured
      api = "http://" + host + "/api/index.php";
    
      if(configured){
        browser.cookies.get({ url: "http://" + host + "/", name: 'login' }, function(cookie){
          var cookie = cookie.value;
          var xhr = new XMLHttpRequest();
          xhr.open("POST", api, true);
          xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          xhr.send("action=queue&type=add&url=" + link + "&cookie=" + cookie);
        });
      }
    });
  }
});