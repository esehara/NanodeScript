var socket = io.connect('http://210.152.156.197:3000/');
socket.emit("debug","Connection Success!");

socket.on("connect",function(){
			console.log("[Debug] Connecion Success!");
			socket.on("newpost",function (data){
			var quotetext_parser = function(text) {
  				text = text.split("\n");
  					for (var i = 0,len = text.length;i < len ; ++i ){
  						if (text[i].match(/^&gt/) !== null) {
  							text[i] = "<span class='quote'>" + text[i] + "</span>";
  						}
  					}
  					return text.join("\n");
  				}
				console.log(data);
				data.date = new Date(data.date);
				data.text = quotetext_parser(data.text);
				if (data.url === "") {
					var pre_url = "";
				} else {
					var pre_url = "\n\n<a href='" + data.url +  "'>" + data.url + "</a>";
				}
				$("#body").prepend(
					"<div class='postitem new'>" +
					"<p><span class='title'>" + data.title + "</span>　" +
					"<span class='name' id='name "  + data._id + "'>投稿者:　" + data.name + "</span>" +
					"<span class='date'>投稿日:" +
					data.date.getFullYear() + "/" + data.date.getMonth() + "/" + data.date.getDate() +
					"(" + ((["日","月","火","水","木","金","土"])[data.date.getDay()]) + ")" + data.date.getHours() + "時" +
					data.date.getMinutes() + "分" + data.date.getSeconds() + "秒" +
					"</span>　<a href='#' onClick='set_post(\"" + data._id + "\")'>■</a>" + 
					"　<a href='/thread/" + data.parentid + "'>◆</a>" + "</p>" +
					"<pre id='" + data._id + "'>" + data.text + pre_url + "</pre>" +
					"<span id='parentid" + data._id + "' style='display:none'>" + data.parentid.replace("\"","") + "<span>" +   
					"</div>"
				);
			});
		}
);

$('#newpost').live("reset",function(){
	reset_postdata();
})

$('#newpost').live("submit",function(){
	if ($("#content").val() == "") {
		return false;
	}
	send_post();
	return false;
});


var send_post = function(){
	if ($("#content").val() == "") {
		return false;
	}

	var postmessage = {
		 name: $('#showname').val()
		,email: $('#email').val()
		,topic: $('#topic').val()
		,content: $('#content').val()
		,url:$('#url').val()
		,parentid:$('#parentid').val()
		,postip:""
	}
	reset_postdata();
	console.log(postmessage);
	socket.emit('do_post',postmessage);
}

var set_post = function(postid) {
	var pretext = $("#" + postid).text().split("\n");
	for (var i = 0,len = pretext.length; i < len; ++i){
		pretext[i] = "> " + pretext[i];
	}
	pretext = pretext.join("\n");
	if ($("#parentid" + postid).text() == "") {
		console.log("[Debug] Parentid is none.");
		$("#parentid").val(postid);
	} else {
		console.log("[Debug] Parentid is find.");
		$("#parentid").val($("#parentid" + postid).text());
	}
	$("#content").val(pretext + "\n\n");
	$("#topic").val("＞" + $("#name" + postid).text());
}

function reset_postdata() {
	$('#showname').val("");
	$('#email').val("");
	$('#topic').val("");
	$('#content').val("");
	$('#url').val("");
	$('#parentid').val("");
}

//KeyBind

shortcut.add("Alt+Enter",function(){
	send_post();
});

shortcut.add("Alt+R",function(){
	reset_postdata();
});

shortcut.add("Alt+P",function(){
	document.postfrom.content.focus();
});
