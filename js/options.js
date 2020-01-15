var host, api;

$(document).ready(function(){

  $("button#save").on("click", function(){
    save_options();
  });

  // restore options
  restore_options();
});

// Saves options to storage
function save_options(){
  host = $("input#host").val();
  $("div#status").show();
  $("div#status").html("wait...");
  $.ajax({
    url: "http://" + host + "/api/checkserverwithsomestring.php",
    type: "GET",
    success: function(r){
      browser.cookies.get({ url: "http://" + host + "/", name: 'login' }, function(cookie){
        if(cookie){
          cookie = cookie.value;
          $.ajax({
            url: "http://" + host + "/api/index.php",
            type: "POST",
            data: { "action": "login", "type": "check", "cookie": cookie },
            success: function(r){
              browser.cookies.get({ url: "http://" + host + "/", name: 'login' }, function(cookie){
                if(cookie){
                  cookie = cookie.value;
                }
              });
              browser.storage.local.set({
                "host": host,
                "configured": true,
                "login": cookie
              }, function(){
                // Update status to let user know options were saved.
                $("div#status").show();
                $("div#status").html("Gespeichert!");
                setTimeout(function(){
                  $("div#status").hide();
                }, 3000);
              });
            },
            error: function(xhr, ajaxOptions, thrownError){
              $("div#status").show();
              $("div#status").html("<span style='color: red;'>Error on login</span>");
            }
          });
        }else{
          $("div#status").html("no cookie: " + host);
        }
      });
    },
    error: function(xhr){
      $("div#status").show();
      $("div#status").html("<span style='color: red;'>Server is not reachable.</span>");
    }
  });
}

// function to show what host is specified
function restore_options() {
  browser.storage.local.get({
    host: "",
  }, function(items){
    host = items.host;
    api = "http://" + host + "/api/index.php";
    $("input#host").val(host);
  });
}