/**
 * Module dependencies.
 */

// Config

process.env.TZ = "Japan";

// requires
var express = require('express');
var fs      = require('fs');

//mongodb server
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/strangeworld");

var Schema   = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var PostData = new Schema({
	  postid:ObjectId
	,  name:   {type:String,default: ""}
	, title:   {type:String,default: ""}
	, email:   {type:String,default: ""}
	, text:    {type:String,default: ""}
	, date:    {type:Date  ,default: Date.now}
	, url:     {type:String,default: ""}
	, parentid:{type:String,default: ""}
	, postip:  {type:String,default: ""}
	, reference : {type:String,default:""}
	, reference_d : {type:String,default:""}
	, score: {type:Number,default:0}
});

mongoose.model('post',PostData)
var Post = mongoose.model("post")

var app = module.exports = express.createServer();
var bbs     = {
	 title:"やさしいわーるど＠なので"
	,server: new Date()
	,link  : [
				{name:"本店",url:"http://strangeworld-honten.com/cgi-bin/bbs.cgi"},
				{name:"暫暫",url:"http://zangzang.poox360.net/cgi-bin/captbbs.cgi"},
				{name:"＠苺",url:"http://strange.straw-berry.net/"},
				{name:"上海",url:"http://qwerty.on.arena.ne.jp/cgi-bin/bbs.cgi"},
				{name:"ﾒｲｿ" ,url:"http://meiso.s147.xrea.com/bbs.cgi"},
				{name:"ｸﾘ島",url:"http://www.strangeworld.ne.jp/cgi-bin/bbs/bbs.cgi"},
				{name:"夕暮",url:"http://www.chararin.com/board4/cgi/main.cgi"},
				{name:"初め",url:"http://strange.kurumi.ne.jp/bbs2.cgi"},
				{name:"ﾘﾐｸｽ",url:"http://www.strangeworld.ne.jp/cgi-bin/remix/bbs.cgi"},
				{name:"派生",url:"None"},
				{name:"料理",url:"http://strange-recipe.org/bbs.cgi"},
				{name:"ﾐｼﾞｮﾃ",url:"http://kontoukou.atwebpages.com/bbs.cgi"},
	 		]
	}

console.log("[Start]" + bbs.title);
console.log("[Start]" + bbs.server);


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
	pre_render_index(res,undefined,"0");
});

app.get('/post/:id',function(req,res){
	var post_id = req.params.id;
	pre_render_index(res,post_id,"0");
});

app.get('/sp/',function(req,res){
	pre_render_index(res,undefined,"0",'index_smartphone',10,"style_mobile.css");
});

app.get('/sp/post/:id',function(req,res) {
	var post_id = req.params.id;
	pre_render_index(res,post_id,"0",'index_smartphone',10,"style_mobile.css");
});

app.get('/thread/:id',function(req,res){
	var post_id = req.params.id;
	render_thread(res,post_id);
});

app.get('/log/',function(req, res) {
	render_log_index(res);
});

app.get('/log/:date',function(req,res) {
	var post_date = req.params.date;
	if (post_date.match(/\d{8}/)) {
		render_log_show(res,post_date.match(/(\d{4})(\d{2})(\d{2})/));
	} else {
		render_log_index(res);
	}
});

function render_log_index(res) {
	Post.findOne({},function(err,post) {
		res.render('log_index',{
			title:bbs.title
			,css_template:"style.css"
			,logs_date: log_dates(post.date)
			,render_date: render_date
			,plus_zero: function(inte) {
				var str = inte.toString();
				if (str.length === 1) {
					return "0" + str
				} else {
					return str
				}
			}
		});
	});
}

function render_log_show(res,show_date) {
	var start_date = new Date(show_date[1],parseInt(show_date[2]) - 1,parseInt(show_date[3]) - 1,15,0,0);
	var next_date = new Date(show_date[1],parseInt(show_date[2]) - 1,parseInt(show_date[3]),15,0,0);
	Post.find({
				date:{
						 $gte: start_date
						,$lte: next_date
					 }
			  },[],{sort:{date:-1}},
		function(err,posts){
			console.log(posts);
			res.render('log_show',{
				title: bbs.title + "　Date:" + show_date[1] + "/" + show_date[2] + "/" + show_date[3]
				,posts: posts
				,quotetext_parser: quotetext_parser
				,do_link_url: do_link_url
				,render_date: render_date
				,css_template: "style.css"
			});
		});
}

function log_dates(startdate) {
	dates = [];
	today = new Date;
	today = new Date(today.getFullYear(),today.getMonth(),today.getDate(),today.getHours() + 16,0,0);
	while(today.getDate() !== startdate.getDate()
		|| today.getMonth() !== startdate.getMonth()) {
		dates[dates.length] = today;
		today = new Date(today.getFullYear(),today.getMonth(),today.getDate() - 1,16,0,0);
	}
	return dates;
}

app.get('/page/:page',function(req,res){
	var page = req.params.page;
	pre_render_index(res,undefined,page);
});

app.get('/sp/page/:page',function(req,res){
	var page = req.params.page;
	pre_render_index(res,undefined,page,'index_smartphone',10,"style_mobile.css");
});

app.get('/0/',function(req,res){
	var null_formval = {
		 name: ""
		,email: ""
		,topic: ""
		,parentid:""
		,content:""
		,url:""
		,reference:""
		,reference_d:""
	}

  	var counter_data = {
    	connection:connect_counter
  	}
	
	res.render('index', {
     title:  bbs.title
  	,posts:  []
	,do_link_url: do_link_url
  	,quotetext_parser:  quotetext_parser
  	,render_date: render_date
	,formval: null_formval
	,page : 0
	,connect_user: connect_user
  	,counter_data: counter_data
  	,parmament:{linkis: false}
	,links:bbs.link
	,render_youtube:render_youtube
	,css_template:'style.css'
	});
});

app.get('/sp/0/',function(req,res){
	var null_formval = {
		 name: ""
		,email: ""
		,topic: ""
		,parentid:""
		,content:""
		,url:""
		,reference:""
		,reference_d:""
	}

  	var counter_data = {
    	connection:connect_counter
  	}
	
	res.render('index_smartphone', {
     title:  bbs.title
  	,posts:  []
	,do_link_url: do_link_url
  	,quotetext_parser:  quotetext_parser
  	,render_date: render_date
	,formval: null_formval
	,page : 0
	,connect_user: connect_user
  	,counter_data: counter_data
  	,parmament:{linkis: false}
	,links:bbs.link
	,render_youtube:render_youtube
	,css_template:'style_mobile.css'
	});
});

function getClientIp(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for');
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

function pre_render_index(res,post_id,page,template,postnumber,css_template) {
	console.log("[Debug] Pre Render Index is " + page);
	if (typeof template === "undefined") {
		template = "index";
	}

	if (typeof postnumber === "undefined") {
		postnumber = 30;
	}

	var null_formval = {
		 name: ""
		,email: ""
		,topic: ""
		,parentid:""
		,content:""
		,url:""
		,reference:""
		,reference_d:""
	}
	var parmament = {
		 linkis:false
		,post:undefined
	}
	if (typeof post_id === "undefined") {
		render_index(res,post_id,null_formval,page,parmament,template,postnumber,css_template);
	} else {
		Post.findOne({_id:post_id},function(err,post){
			if (post === null) {
				render_index(res,post_id,null_formval,page,parmament,postnumber,css_template);
			} else {
				console.log(post);
				if (post.parentid !== "") {
					var set_parentid = post._id;
				} else {
					var set_parentid = post.parentid;
				}

				if (post.url !== "") {
					post.text = post.text + "\n\n" + post.url; 
				}
				parmament.linkis = true;
				parmament.post = post;
				var formval = {
				 name: ""
				,email: ""
				,topic: "＞" + post.title
				,content: add_quote(post.text)
				,url: ""
				,parentid: set_parentid 
				,reference: post._id
				,reference_d: string_date(render_date(post.date))
				};
				render_index(res,post_id,formval,page,parmament,template,postnumber,css_template);
		}});
	}
}

var string_date = function(date) {
	return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() +
			"(" + ((["日","月","火","水","木","金","土"])[date.getDay()]) + ")" + date.getHours() + "時" +
			date.getMinutes() + "分" + date.getSeconds() + "秒"
}

var add_quote = function(text) {
	var pretext = text.split("\n");
	var parsetext = [];
	for (var i = 0,len = pretext.length; i < len; ++i){
		if (pretext[i] !== "" && pretext[i].match(/^(&gt; &gt; &gt;)/) === null) {
			parsetext[parsetext.length] = "> " + pretext[i];
		}
	}
	return parsetext.join("\n") + "\n\n";
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

function render_youtube(url) {
	url_parse = url.match(/http(s)?:\/\/(www\.)?youtube\.com\/watch\?(.*)?v=([a-zA-Z0-9_-]+)/);
	return "<iframe width='240' height='180' src='http://www.youtube.com/embed/" + url_parse[4] + "' frameborder='0' allowfullscreen></iframe>";
}

function render_thread(res,parent_id) {
	Post.find({parentid: parent_id},[],{sort:{date:-1}},
		function(err,posts){
			res.render('thread',{
				title: bbs.title + "　thread:" + parent_id
				,posts: posts
				,quotetext_parser: quotetext_parser
				,do_link_url: do_link_url
				,render_date: render_date
				,render_youtube: render_youtube
				,css_template:"style.css"
			});
		});
}

function render_index(res,post_id,formval,page,parmament,template,postnumber,css_template) {
  console.log(page);
  page = parseInt(page);
  console.log("[Debug] Page is " + page);
  var counter_data = {
    connection:connect_counter
  }
  
  if(typeof css_template === "undefined") {
  	css_template = "style.css";
  }

  Post.find({},[],{
  skip:(postnumber * page),limit: postnumber * (page + 1),sort:{date:-1}
  },function(err,posts){
  console.log(formval)
  res.render(template, {
     title:  bbs.title
  	,posts:  posts
	,do_link_url: do_link_url
  	,quotetext_parser:  quotetext_parser
  	,render_date: render_date
	,formval: formval
	,page : page
	,connect_user: connect_user
  	,counter_data: counter_data
	,parmament:parmament
  	,links: bbs.link
  	,render_youtube:render_youtube
  	,css_template:css_template
  });
  });
};

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

//SetInterval
var on_server = 60 * 10;
function logarray_init(inte) {
	var return_array = new Array(inte);
	for(var i = 0,len = return_array.length;i < 20;i ++) {
		return_array[i] = 0;
	}
	return return_array;
}

var participater = logarray_init(18);
var post_number  = logarray_init(18);

setInterval(function(){
	//Logger
	console.log("[Debug] Interval test :: 10 Second");
	participater.shift();
	participater.push(connect_user);
	post_number.shift();
	post_number.push(post_counter);
	post_counter = 0;
}, on_server * 1000);

//Socket.io

var connect_user = 0;
var connect_counter = 0;
var post_counter = 0;

var socketio = require("socket.io").listen(app);
socketio.on('connection',function(socket){
	console.log("conneted");
	connect_counter ++;
	connect_user ++;

	socket.emit("user",connect_user);
	socket.broadcast.emit("user",connect_user);
	
	var counter_data = {
		connection:connect_counter
	}

	socket.emit("counter",counter_data);
	socket.broadcast.emit("counter",counter_data);
	
	socket.emit("reload_check",bbs.server);

	socket.on("get_log",function() {
		socket.emit("get_log",{participater:participater,post_counter:post_number});
	});

	socket.on("disconnect",function(){
		console.log("disonnected");
		connect_user --;
		socket.broadcast.emit("user",connect_user);
		socket.emit("user",connect_user);
	});

	socket.on("debug",function(data) {
		console.log(data);
	});

	socket.on("do_score",function(data){
		var return_score = {
			postid: data
		   ,score : 0
		}
		Post.findOne({_id:data},function(err,post){
			if (typeof post.score === "undefined") {
				post.score = 1;
			} else {
				post.score ++;
			}
			return_score.score = post.score;
			Post.update({_id:post._id},{$set:{score: post.score}},{upsert:true},function(err) {
				socket.emit("done_score",return_score);
				socket.broadcast.emit("done_score",return_score);
			});
		});
	});

	socket.on("do_post",function(data){
		var broadcast_post = save_post({
			 name:  data.name
			,title: data.topic
			,text:  data.content
			,url :  data.url
			,email: data.email
			,parentid : data.parentid
			,postip:""
			,reference:data.reference
			,reference_d:data.reference_d
			,score:0
		});
		post_counter ++;
		if (broadcast_post !== false) {
			socket.emit("newpost",broadcast_post);
			socket.broadcast.emit("newpost",broadcast_post);
		}
	})

});
	
function render_date(target_date) {
	return new Date(("" + target_date).replace("GMT+0000","GMT-0900"));
}

function varitation(post_data) {

	function varitation_util(str,len) {
		return (str.length < len);
	}

	if (varitation_util(post_data.name,15)) return false;
	if (varitation_util(post_data.email,15)) return false;
	if (varitation_util(post_data.title,30)) return false;
	if (varitation_util(post_data.text,1200)) return false;
	if (varitation_util(post_data.url,100)) return false;

	return true;
}

function save_post(post_data) {
	if (varitation(post_data)) {
		return false;
	}

	var post = new Post();
	post.name  = escapeHTML(post_data.name);
	post.email = escapeHTML(post_data.email);
	post.title = escapeHTML(post_data.title);
	post.text  = escapeHTML(post_data.text);
	post.url   = escapeHTML(post_data.url);
	post.parentid = escapeHTML(post_data.parentid);
	post.postip   = escapeHTML(post_data.postip);
	post.reference = escapeHTML(post_data.reference);
	post.reference_d = escapeHTML(post_data.reference_d);
	if (post.parentid === "") {
		post.parentid = post._id;
	}
    console.log(post_data);
    console.log(post);
	post.save(
	function(err) {
		if (err){
				console.log(err);
			} else {
				console.log("DataBase save success!");
			}
	});
	return post;
}

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

app.post('/',function(req,res){
	console.log(req.body);
	if (req.body.content != "") {
		var post_data = {
			 name  : req.body.showname
			,email : req.body.email
			,title : req.body.topic
			,text  : req.body.content
			,url   : req.body.url
			,parentid : req.body.parentid
			,postip: ""
			,reference: req.body.reference
			,reference_d: req.body.reference_d
			,score:0
		}
	}
	save_post(post_data);
	pre_render_index(res,undefined,"0");
});

//utils

function escapeHTML(str) {
	return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

