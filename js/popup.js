var host;
var cookie = false;
var configured;
var api;

$(document).ready(function(){

  // show options page
  $("img#btn-options").on("click", function(){
    if(browser.runtime.openOptionsPage){
      browser.runtime.openOptionsPage();
    }else{
      window.open(browser.runtime.getURL("../html/options.html"));
    }
  });

  // now check if the plugin was configured
  browser.storage.local.get({
    host: "",
    configured: ""
  }, function(items){
      host = items.host;
      configured = items.configured; //check if plugin is configured
      api = "http://" + host + "/api/index.php";

      if(configured){
        browser.cookies.get({ url: "http://" + host + "/", name: 'login' }, function(cookie){

          // this is the login cookie from the web interface
          var cookie = cookie.value;

          // add active tab url to queue
          $("button#addToQueue").on("click", function(){
              browser.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
              
              var url = tabs[0].url;

              if(url.startsWith("https://www.youtube.com/watch")){
                $.ajax({
                  url: api,
                  type: "POST",
                  data: { "action": "queue", "type": "add", "url": url, "cookie": cookie },
                  success: function(r){
                    if(r.success){
                      $("div#status").html("Haut hi");
                    }
                  },
                  error: function(xhr){
                    $("div#status").html(xhr.status);
                  }
                });
              }else{
                $("div#status").html("Is ned YouTube");
              }
            });

            setTimeout(function(){
              $("div#status").html("");
            }, 2500);

          });


          // crontrol play pause next prev
          $("span.controls").on("click", function(){
            var type = $(this).attr("id");
            $.ajax({
              url: api,
              type: "POST",
              data: { "action": "player", "type": type, "cookie": cookie },
              error: function(xhr){
                $("div#status").html("Error: " + xhr.status)
              }
            });
            updatePlayer();
          });

          //change mode
          $("span.modes").on("click", function(){
            var type = $(this).attr("id");
            $.ajax({
              url: api,
              type: "POST",
              data: { "action": "player", "type": type, "cookie": cookie },
              success: function(r){
                update();
              },
              error: function(xhr){
                $("div#status").html("Error: " + xhr.status);
              }
            });
          });

          // set volume with scroll
          $("input#volume").bind("mousewheel wheel", function(e, delta){
            var vol = parseInt($(this).val());
            if(e.originalEvent.deltaY < 0){
              if(vol + 5 <= 100){
                volume(vol + 5);
              }
            }else{
              if(vol - 5 >= 0){
                volume(vol - 5);
              }
            }
            return false;
          });

          //set volume
          $("input#volume").on("click change mousemove", function(){
            var vol = $(this).val();
            volume(vol);
          });

          function volume(vol){
            $("input#volume").val(vol);
            $.ajax({
              url: api,
              type: "POST",
              data: { "action": "player", "type": "volume", "volume": vol, "cookie": cookie },
            });
          }

          update();
          setInterval(function(){
            //update player automatically
            update();
          }, 2000);

        });
      }else{
        //plugin is not configured
        $("span#notconfigured").css("display", "flex");
      }
  });

});

function update(){
  console.log("UPDATE!!!");
  $.ajax({
    url: api,
    type: "GET",
    data: { "action": "player", "type": "update", "cookie": cookie },
    success: function(r){
      console.log(r);
      var vol = r.stats.volume;
      if(r.stats.playing.playing === true){
        if(r.stats.current.endsWith(".mp3")){
          var x = r.stats.current.replace(".mp3", "");
          var a = "<a class='nostyle' href='https://www.youtube.com/watch?v="+x+"'>"+r.stats.playing.current+"</a>";
        }else{
          var a = r.stats.current;
        }
        $("div#current").html(a);
        $("div#current").attr("title", r.stats.playing.current);
        $("span#toggle").html("<img src='../img/pause.png'></img>");
      }else{
        $("div#current").html("");
        $("span#toggle").html("<img src='../img/play.png'></img>");
      }
      $("input#volume").val(parseInt(vol));

      //reload modes
      if(r.stats.repeat == "on"){
        $("span#repeat").find("img").attr("src", "../img/repeat_all_blue.png");
      }else{
        $("span#repeat").find("img").attr("src", "../img/repeat_all.png");
      }

      if(r.stats.single == "on"){
        $("span#single").find("img").attr("src", "../img/repeat_single_blue.png");
      }else{
        $("span#single").find("img").attr("src", "../img/repeat_single.png");
      }

      if(r.stats.random == "on"){
        $("span#random").find("img").attr("src", "../img/repeat_random_blue.png");
      }else{
        $("span#random").find("img").attr("src", "../img/repeat_random.png");
      }

    },
    error: function(xhr){
      $("div#status").html("Error: " + xhr.status);
    }
  });
}