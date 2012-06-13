var socket = io.connect();
var new_post_counter = 0;
var bbs_title = "やさしいわーるど＠なので";
var client_start = undefined;
var new_post_data = [];
var sound_on = false;

setInterval(function(){
	console.log("[Debug] SetInterval");
	if(sound_on && $("#sound_on").is(":checked") ){
		console.log("[Debug] Play new.wav");
		$('embed').remove();
		$('body').append('<embed src="/sound/new.wav" autostart="true" hidden="true" loop="false">');
	}
	sound_on = false;
},6000);

socket.emit("debug","Connection Success!");

socket.on("connect",function(){
			console.log("[Debug] Connecion Success!");

			socket.on("user",function(data){
				$("#user_counter").text(data);
			});
			
			socket.on("counter",function(data){
				$("#connect_counter").text(data.connection);
			});

			socket.on("reload_check",function(date){
				if(typeof client_start === "undefined") {
					client_start = date;
				} else {
					if (client_start !== date) {
						location.reload(true);
					}
				}
			});

			socket.on("done_score",function(data){
				wink_item(data.postid);
				$("#score" + data.postid).text("[" + data.score + "]");
			});

			socket.on("newpost",function (data){
				console.log(data);
				new_post_counter ++;
				new_post_data[new_post_data.length] = data;
				$("title").text("(" + new_post_data.length + ")" + bbs_title);
				if($("#new_post_show").length === 0) {
					$("#body").prepend(
						"<div id='new_post_show'><a id='new_post_showlink' onclick='new_post_show()'></a></div>"
					)
				}
				$("#new_post_showlink").text("新着発言が" + new_post_data.length + "件あるよ(Alt+S)");
				sound_on = true;
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
					,reference:$("#reference").val()
					,reference_d:$("#reference_d").val()
				}
				reset_postdata();
				console.log(postmessage);
				socket.emit('do_post',postmessage);
			};

	send_post();
	return false;
});

function new_post_show () {
	for (var i = 0,len = new_post_data.length;i < len;i ++) {
		console.log("[Debug] Rneder Object");
		console.log(new_post_data[i]);
		new_post_render(new_post_data[i]);
	}
	$("#new_post_show").remove();
	new_post_data = [];
	$("title").text(bbs_title);
}

var quotetext_parser = function(text) {
				text = text.split("\n");
					for (var i = 0,len = text.length;i < len ; ++i ){
						if (text[i].match(/^&gt/) !== null) {
							text[i] = "<span class='quote'>" + text[i] + "</span>";
						}
					}
					return text.join("\n");
	}

function new_post_render (data) {
	data.date = new Date(data.date);
	data.text = do_link_url(quotetext_parser(data.text));
		if (data.url === "") {
			var pre_url = "";
		} else {
			function render_youtube(url) {
				url_parse = url.match(/http(s)?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_]+)/);
				return "\n\n<iframe width='240' height='180' src='http://www.youtube.com/embed/" + url_parse[3] + "' frameborder='0' allowfullscreen></iframe>";
			}
			var pre_url = "";
			if(data.url.match(/http(s)?:\/\/(www\.)?youtube\.com\/watch\?v=/)) {
				var pre_url = render_youtube(data.url);
			}
				pre_url = pre_url + "\n\n<a href='" + data.url +  "' id='url" + data._id + "' target='_blank'>" + data.url + "</a>";
		}
		
		if (data.reference == "") {
			var pre_reference = "";
		} else {
			var pre_reference = "<a href='/post/" + data.reference + "'>参考:" + data.reference_d + "</a>";
		}
	$("#body").prepend(
					"<div id='post" + data._id + "' class='postitem new'>" + 
					"<p>" + "<a href='/post/" + data._id + "'>▼</a>" + 
					" <a id='score" + data._id + "' onclick='do_score(\"" + data._id + "\")'>[" + data.score + "]</a>" + 
					"<span class='title'>" + data.title + "</span>　" +
					"投稿者:　<span class='name' id='name"  + data._id + "'>" + data.name + "</span>" +
					"　<span class='date'>投稿日:</span>" + "<span id='date" + data._id + "' class='date'>" + 
					data.date.getFullYear() + "/" + (data.date.getMonth() + 1) + "/" + data.date.getDate() +
					"(" + ((["日","月","火","水","木","金","土"])[data.date.getDay()]) + ")" + data.date.getHours() + "時" +
					data.date.getMinutes() + "分" + data.date.getSeconds() + "秒" +
					"</span>　<a href='#' onClick='set_post(\"" + data._id + "\")'>■</a>" + 
					"　<a href='/thread/" + data.parentid + "'>◆</a>" +
					"　<a onClick='done_this_read(\"" + data._id + "\")' id='read" + data._id + "' class='read_link'>読</a>" +
					"</p>" +
					"<pre id='" + data._id + "'>" + data.text + pre_url + "</pre>" + "<pre>" + pre_reference + "</pre>" + 
					"<span id='parentid" + data._id + "' style='display:none'>" + data.parentid.replace("\"","") + "<span>" +   
					"</div>" + 
					"</div>"
				);
}

var done_read = function(){
	new_post_counter = 0;
	$("title").text(bbs_title);
	$(".new").removeClass("new");
	$(".read_link").remove();
}

var done_this_read = function(postid) {
	new_post_counter --;
	$("#post" + postid).removeClass("new");
	$("#read" + postid).remove();
	if(new_post_counter > 0){
		$("title").text("(" + new_post_counter + ")" + bbs_title);
	} else {
		$("title").text(bbs_title);
	}
}


var do_score = function(postid) {
	socket.emit("do_score",postid);
}

var wink_item = function(postid) {
	$("#post" + postid).css("opacity", "0.2");
	$("#post" + postid).css("filter", "alpha(opacity=20)");
	$("#post" + postid).fadeTo("slow", 1.0);
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
	
	$("#reference").val(postid);
	$("#reference_d").val($("#date" + postid).text());

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
	$('#reference').val("");
	$('#reference_d').val("");
	$('#post_parmament').remove();
}

function do_link_url(str) {
	var url = str.match(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/g);
	if (url) {
		var pre_replace = [];
		for (var i = 0,len = url.length;i < len; ++i) {
			if (str.match(url[i])) {
				console.log("[Debug] Replace Url");
				str = str.replace(url[i], "<" + pre_replace.length + ">");
				pre_replace[pre_replace.length] = url[i];
			}
		}

		for (var i = 0,len = pre_replace.length;i < len; ++i) {
			str = str.replace("<" + i + ">","<a href='" + pre_replace[i] + "' target='_blank'>" + pre_replace[i] + "</a>");
		}
	}
	return str;
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
					,reference:$('#reference').val()
					,reference_d:$('#reference_d').val()
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

shortcut.add("Alt+1",function(){
	location.href="/";
});

shortcut.add("Alt+0",function(){
	location.href="/0/";
});

shortcut.add("Alt+S",function() {
	new_post_show();
});
