  socket.emit('adduser', datanew);
    if (datanew.username != ""){
    $('#mainusername').text(datanew.username);
  }

  if (datanew.profile_image != "") {
    $('.thumb-sm img').attr("src", datanew.profile_image);
  }

   var video = $("#currentvideovid");

  var tag = document.createElement('script');
  tag.src = "//www.youtube.com/player_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  var player;
  var localplaylist = [];

  var updatePlaylistItemOne = function(){
    playlistitem = $('#playlist li').first();
    playlistitem.find(".pull-right").remove();
    playlistitem.find(".jp-play-me").remove();
    playlistitem.find("span:first").prepend("Now Playing: ");
  }

  var pauseTheVideo = function(){
    player.stopVideo();
  }

  var addVideoItem = function(username, video){
    // socket.emit('add video', videoTitle, videoId);
    socket.emit('add video', username, video);
  };

  $('#searchvideoform').submit(function(e){
    e.preventDefault();
    socket.emit('search video', $('#searchVal').val());
  });

  function onYouTubePlayerAPIReady() {
  player = new YT.Player('video', {
    height: '300',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      showinfo: 0
    }, 
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  if (localplaylist.length >= 1) {
  } else {
    $("#video").hide();
  }

  var playButton = document.getElementById("bottomPlayButton");
  playButton.addEventListener("click", function() {
    player.playVideo();
  });
  
  var pauseButton = document.getElementById("bottomPauseButton");
  pauseButton.addEventListener("click", function() {
    player.pauseVideo();
  });
}

function onPlayerStateChange(event) {  
  // when video ends
  if(event.data === 0) {   
    if (localplaylist.length >= 1) {
      player.loadVideoById(localplaylist[0]);
      removeFirstFromPlaylist();
    }
  }
  // playing
  if(event.data === 1) { 
    socket.emit('play videoserver', datanew.username);
    $("#bottomPlayButton").addClass( "hid" );
    $("#bottomPauseButton").removeClass( "hid" );  
  }
  // paused
  if(event.data === 2) {
    socket.emit('pause videoserver', datanew.username, player.getCurrentTime());
    $("#bottomPlayButton").removeClass( "hid" );
    $("#bottomPauseButton").addClass( "hid" );
  }
}

function removeFirstFromPlaylist(){
  socket.emit('deletefirst videoserver');
}

function forceLogin() {
  $('#loginModal').modal('show');
}

