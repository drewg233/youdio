// VIDEO SOCKETS

socket.on('pause video', function (currentVideoTime){
  player.pauseVideo();
});

socket.on('play video', function(){
  player.playVideo();
});

// When a user joins a room late, we need to get the current playlist information.
socket.on('starting playlist', function(playlist) {
  // alert(playlist);
});

// Deletes the first video from the playlist after it is played.
socket.on('deletefirst video', function(){
  localplaylist.shift();
  $('#playlist li').first().remove();
  updatePlaylistItemOne();
  if (localplaylist.length == 0) {
    $("#video").hide();
  } else {
    player.loadVideoById(localplaylist[0]);
  }
});

socket.on('updateplaylist', function (videoTitle, videoId, playlist) {
  $('#playlist').append("<li class='list-group-item'><div class='pull-right m-l'><a href='#' class='m-r-sm'><i class='icon-cloud-download'></i></a><a href='#' class='m-r-sm'><i class='icon-plus'></i></a><a href='#'><i class='icon-close'></i></a></div><a href='#' class='jp-play-me m-r-sm pull-left'><i class='icon-control-play text'></i><i class='icon-control-pause text-active'></i></a><div class='clear text-ellipsis'><span>"+ videoTitle +"</span><span class='text-muted'> -- 04:35</span></div></li>");
  localplaylist = playlist;
  if (localplaylist.length == 1) {
    player.loadVideoById(localplaylist[0]);
  }
  if ($("#video").is(":visible") == false) {
    updatePlaylistItemOne();
    $("#video").show();
  }
});

socket.on('update results', function (data) {
  $('#searchResultList').empty();
  console.log(data);
  for (i = 0; i < data.items.length; i++) { 
    title = data.items[i].snippet.title;
    videoid = '"'+data.items[i].id.videoId+'"';
    $('#searchResultList').append("<li class='list-group-item clearfix'><a href='javascript:addVideoItem("+'"'+title.replace(/(\"|\')/g, '\\$1')+'"'+","+videoid+");' class='jp-play-me pull-right m-t-sm m-l text-md'><i class='icon-control-play text'></i><i class='icon-control-pause text-active'></i></a><a href='javascript:addVideoItem("+'"'+title.replace(/(\"|\')/g, '\\$1')+'"'+","+videoid+");' class='pull-left thumb-sm m-r' style='width:80px;'><img src='"+data.items[i].snippet.thumbnails.high.url+"'style='width: 80px;height: 55px;'></a><a class='clear' href='#'><span class='block text-ellipsis'>"+data.items[i].snippet.title+"</span><small class='text-muted'>by Soph Ashe</small></a></li>");
  }
});

// CHAT SOCKETS

socket.on('updatechat', function (data) {
  // console.log("UPDATE CHAT DATA: "+data);
  if (data.profile_image != undefined){
    $('section.chat-list').append('<article id="chat-id-1" class="chat-item left"><a href="#" class="pull-left thumb-sm avatar"><img src="'+ data.profile_image +'"></a><section class="chat-body"><div class="panel b-light text-sm m-b-none"><div class="panel-body"><span class="arrow left"></span><p class="m-b-none">'+data.message+'</p></div></div><small class="text-muted"></section></article>');
    $('section.chat-list').animate({scrollTop: $('section.chat-list')[0].scrollHeight}, 400);
  } else {
    $('section.chat-list').append('<article id="chat-id-1" class="chat-item left"><a href="#" class="pull-left thumb-sm avatar"><img src="img/a2.png"></a><section class="chat-body"><div class="panel b-light text-sm m-b-none"><div class="panel-body"><span class="arrow left"></span><p class="m-b-none">'+data.message+'</p></div></div><small class="text-muted"></section></article>');
    $('section.chat-list').animate({scrollTop: $('section.chat-list')[0].scrollHeight}, 400);
  }
});

socket.on('updateusers', function (users) {
  if (users) {
    var string = '<ul>';
    for (i = 0; i < users.length; i++) {
      string += '<li>'+users[i]+'</li>';
    }
    string += '</ul>';
    $('#userslist').html(string);
  }
});