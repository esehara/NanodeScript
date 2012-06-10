var socket = io.connect();
var new_post_counter = 0;
var bbs_title = "やさしいわーるど＠なので";

socket.emit("debug","Connection Success!");


socket.on("connect",function(){
			console.log("[Debug] Connecion Success!");

			socket.on("user",function(data){
				$("#user_counter").text(data);
			});
			
			socket.on("counter",function(data){
				$("#connect_counter").text(data.connection);
			});

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
					var pre_url = "\n\n<a href='" + data.url +  "' id='url" + data._id + "' target='_blank'>" + data.url + "</a>";
				}

				new_post_counter ++;
				
				$("title").text("(*" + new_post_counter + ")" + bbs_title);
				$("#body").prepend(
					"<div class='postitem new'>" +
					"<p><span class='title'>" + data.title + "</span>　" +
					"投稿者:　<span class='name' id='name"  + data._id + "'>" + data.name + "</span>" +
					"　<span class='date'>投稿日:" +
					data.date.getFullYear() + "/" + (data.date.getMonth() + 1) + "/" + data.date.getDate() +
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
			};

	send_post();
	return false;
});

var done_read = function(){
	new_post_counter = 0;
	$("title").text(bbs_title);
	$(".new").removeClass("new");
}

var set_post = function(postid) {
	var pretext = $("#" + postid).text().split("\n");
	var parsetext = [];
	console.log("[Debug] Text Array is:");
	console.log(pretext);
	for (var i = 0,len = pretext.length; i < len; ++i){
		if (pretext[i] !== "" && pretext[i].match(/^(> > > )/) === null){
			parsetext[parsetext.length] = "> " + pretext[i];
		}
	}
	if ($("#parentid" + postid).text() == "") {
		console.log("[Debug] Parentid is none.");
		$("#parentid").val(postid);
	} else {
		console.log("[Debug] Parentid is find.");
		$("#parentid").val($("#parentid" + postid).text());
	}
	
	parsetext = parsetext.join("\n");
	$("#content").val(parsetext + "\n\n");
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

	send_post();
});

shortcut.add("Alt+R",function(){
	reset_postdata();
});

shortcut.add("Alt+P",function(){
	document.postfrom.content.focus();
});

shortcut.add("Alt+A",function(){
	done_read();
});
