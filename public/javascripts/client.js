var _socket = io.connect();

(function(exterior) {
var new_post_counter = 0;
var bbs_title = "やさしいわーるど＠なので";
var client_start = undefined;
var new_post_data = [];
var sound_on = false;
var new_post_flag = false;
var socket = _socket;
	setInterval(function(){
		if(sound_on && $("#sound_on").is(":checked") ){
			sound_play();
		}
		sound_on = false;
	},6000);

	setInterval(function() {
		if(typeof $("#user_g").sparkline !== "undefind") {
			socket.emit("get_log");
		}
	},60 * 1000 * 2);


 socket.emit("debug","Connection Success!");

 socket.on("connect",function(){
			socket.on("user",function(data){
				$("#user_counter").text(data);
			});
			
			socket.on("counter",function(data){
				$("#connect_counter").text(data.connection);
			});

			socket.on("get_log",function(data) {
				$("#user_g").sparkline(data.participater,{chartRengeMin:1});
				$("#post_g").sparkline(data.post_counter,{chartRengeMin:1,lineColor:'yellow'});
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
				new_post_counter ++;
				new_post_data[new_post_data.length] = data;
				document.title = "(" + new_post_data.length + ")" + bbs_title;
				if($("#new_post_show").length === 0) {
					$("#body").prepend("<div id='new_post_show'><a id='new_post_showlink' onclick='new_post_show()'></a></div>");
				}
				
				var shortcut_string = "";
				
				if($("#shortcut_show_post").length !== 0){
					shortcut_string = "("  + $("#shortcut_show_post").val() + ")";
				}
				
				$("#new_post_showlink").text("新着発言が" + new_post_data.length + "件あるよ" + shortcut_string);
				sound_on = true;
				if(new_post_flag) {
					new_post_show();
					new_post_flag = false;
					sound_on = false;
				}

				if($("#tarenagashi_on").is(":checked") && $("#new_post_showlink").length > 0) {
					new_post_show();
				}
			
			});
		}
);
if ($("#user_g").length !== 0) {
	socket.emit("get_log");
}

$('#newpost').live("reset",function(){
	reset_postdata();
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
				,reference:$("#reference").val()
				,reference_d:$("#reference_d").val()
				,deny_spam_value:$("#deny_spam_value").text()
				,deny_spam:$("#deny_spam").val()
			}
		
		reset_postdata();
		socket.emit('do_post',postmessage);
		new_post_flag = true;
	};


$('#newpost').live("submit",function(){
	if ($("#content").val() == "") {
		return false;
	}
	send_post();
	return false;
});

var new_post_show = function() {
	for (var i = 0,len = new_post_data.length;i < len;i ++) {
		new_post_render(new_post_data[i]);
	}
	$("#new_post_show").remove();
	new_post_data = [];
	document.title = bbs_title;
}

exterior.new_post_show = new_post_show;

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
		$("#debug").text("" + data.date);
		var date_time = data.date.split("T");
		date_time[0] = date_time[0].split("-");
		date_time[1] = date_time[1].split(":");
		data.date = new Date(parseInt(date_time[0][0]),parseInt(date_time[0][1]) - 1,parseInt(date_time[0][2]),parseInt(date_time[1][0]) + 9,parseInt(date_time[1][1]),parseInt(date_time[1][2]));
	data.text = do_link_url(quotetext_parser(data.text));
		if (data.url === "") {
			var pre_url = "";
		} else {
			function render_youtube(url) {
				url_parse = url.match(/http(s)?:\/\/(www\.)?youtube\.com\/watch\?(.*)?=([a-zA-Z0-9_-]+)/);
				return "\n\n<iframe width='240' height='180' src='http://www.youtube.com/embed/" + url_parse[4] + "' frameborder='0' allowfullscreen></iframe>";
			}
			var pre_url = "";
			if(data.url.match(/http(s)?:\/\/(www\.)?youtube\.com\/watch\?(.*)?v=/)) {
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
					"<span id='parentid" + data._id + "' class='span_data'>" + 
					data.parentid.replace("\"","") + 
					"</span>" +   
					"</div>"
				);
}

exterior.done_read = function(){
	new_post_counter = 0;
	document.title = bbs_title;
	$(".new").removeClass("new");
	$(".read_link").remove();
}

exterior.done_this_read = function(postid) {
	new_post_counter --;
	$("#post" + postid).removeClass("new");
	$("#read" + postid).remove();
}


exterior.do_score = function(postid) {
	socket.emit("do_score",postid);
}

var wink_item = function(postid) {
	$("#post" + postid).css("opacity", "0.2");
	$("#post" + postid).css("filter", "alpha(opacity=20)");
	$("#post" + postid).fadeTo("slow", 1.0);
}

exterior.set_post = function(postid) {
	reset_postdata();
	var pretext = $("#" + postid).text().split("\n");
	var parsetext = [];
	for (var i = 0,len = pretext.length; i < len; ++i){
		if (pretext[i] !== "" && pretext[i].match(/^(> > )/) === null){
			parsetext[parsetext.length] = "> " + pretext[i];
		}
	}
	if ($("#parentid" + postid).text() == "") {
		$("#parentid").val(postid);
	} else {
		$("#parentid").val($("#parentid" + postid).text());
	}
	
	$("#reference").val(postid);
	$("#reference_d").val($("#date" + postid).text());

	parsetext = parsetext.join("\n");
	$("#content").val(parsetext + "\n\n");
	$("#topic").val("＞" + $("#name" + postid).text());
}

var reset_postdata = function(){
	$('#showname').val("");
	$('#email').val("");
	$('#topic').val("");
	$('#content').val("");
	$('#url').val("");
	$('#parentid').val("");
	$('#reference').val("");
	$('#reference_d').val("");
	$('#deny_spam').val("");
	$('#post_parmament').remove();

}

exterior.reset_postdata = reset_postdata;

function do_link_url(str) {
	var url = str.match(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/g);
	if (url) {
		var pre_replace = [];
		for (var i = 0,len = url.length;i < len; ++i) {
			if (str.match(url[i])) {
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
var shortcut = exterior.shortcut;
var store = new Persist.Store('strange-node');

function show_shortcut_custom() {
	$("#shortcut_custom").fadeIn();
}

var init_shortcut_custom = function() {
	shortcutkey_get(store);

	shortcut.add($("#shortcut_s_post").val(), function() {
		send_post();
	});
	$("#show_shortcut_s_post").val("投稿(" + $("#shortcut_s_post").val() + ")");

	shortcut.add($("#shortcut_d_post").val(), function() {
		reset_postdata();
	});
	$("#show_shortcut_d_post").val("消す(" + $("#shortcut_d_post").val() + ")");

	shortcut.add($("#shortcut_a_read").val(),function() {
		done_read();
	});
	$("#show_shortcut_a_read").text("(" + $("#shortcut_a_read").val() + ")");

	shortcut.add($("#shortcut_show_post").val(),function() {
		new_post_show();
	});
}

if (typeof shortcut !== "undefined") {
init_shortcut_custom();
}

var apply_shortcut_custom = function() {
	shortcutkey_save(store);
	init_shortcut_custom();
	$("#shortcut_custom").fadeOut();
}

var return_shortcut_custom = function() {
	init_shortcut_custom();
}

var not_apply_shortcut_custom = function() {
	$("#shortcut_custom").fadeOut();
}

exterior.return_shortcut_custom = return_shortcut_custom;
exterior.apply_shortcut_custom = apply_shortcut_custom;
exterior.not_apply_shortcut_custom = not_apply_shortcut_custom;
$("#spam_filter").css("display","none");
})(window);


