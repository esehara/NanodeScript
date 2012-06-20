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

var render_date = function(target_date) {
	return new Date(("" + target_date).replace("GMT+0000","GMT-0900"));
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

var render_youtube = function(url) {
	url_parse = url.match(/http(s)?:\/\/(www\.)?youtube\.com\/watch\?(.*)?v=([a-zA-Z0-9_-]+)/);
	return "<iframe width='240' height='180' src='http://www.youtube.com/embed/" + url_parse[4] + "' frameborder='0' allowfullscreen></iframe>";
}

exports.utils = {
	 do_link_url:do_link_url
	,render_date:render_date
	,quotetext_parser:quotetext_parser
	,render_youtube:render_youtube
}
