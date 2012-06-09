/**
 * Module dependencies.
 */

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
	, referesence : {type:String,default:""}
});

mongoose.model('post',PostData)
var Post = mongoose.model("post")

var app = module.exports = express.createServer();
var bbs     = {
    title:"やさしいわーるど＠なので"
}

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

app.get('/thread/:id',function(req,res){
	var post_id = req.params.id;
	render_thread(res,post_id);
});

app.get('/page/:page',function(req,res){
	var page = req.params.page;
	console.log("[Debug] Page is Get " + page);
	pre_render_index(res,undefined,page);
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

function pre_render_index(res,post_id,page) {
	console.log("[Debug] Pre Render Index is " + page);
	var null_formval = {
		 name: ""
		,email: ""
		,topic: ""
		,parentid:""
		,content:""
		,url:""
	}

	if (typeof post_id === "undefined") {
		render_index(res,post_id,null_formval,page);
	} else {
		Post.findOne({_id:post_id},function(err,post){
			if (post === null) {
				render_index(res,post_id,null_formval,page);
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

				var formval = {
				 name: ""
				,email: ""
				,topic: "＞" + post.title
				,content: add_quote(post.text)
				,url: ""
				,parentid: set_parentid 
			};
				render_index(res,post_id,formval,page);
		}});
	}
}

var add_quote = function(text) {
	var pretext = text.split("\n");
	var parsetext = [];
	for (var i = 0,len = pretext.length; i < len; ++i){
		if (pretext[i] !== "") {
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

function render_thread(res,parent_id) {
	Post.find({parentid: parent_id},[],{sort:{date:-1}},
		function(err,posts){
			res.render('thread',{
				title: bbs.title + "　thread:" + parent_id
				,posts: posts
				,quotetext_parser: quotetext_parser
			});
		});
}

function render_index(res,post_id,formval,page) {
  console.log(page);
  page = parseInt(page);
  console.log("[Debug] Page is " + page);
  Post.find({},[],{
  skip:(30 * page),limit: 30 * (page + 1),sort:{date:-1}
  },function(err,posts){
  console.log(formval)
  res.render('index', {
     title:  bbs.title
  	,posts:  posts
  	,quotetext_parser:  quotetext_parser
  	,formval: formval
	,page : page
  });
  });
};


app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

//Socket.io

var connect_user = 0;

var socketio = require("socket.io").listen(app);
socketio.on('connection',function(socket){
	console.log("conneted");
	
	connect_user ++;
	socket.emit("user",connect_user);
	socket.broadcast.emit("user",connect_user);

	socket.on("disconnect",function(){
		console.log("disonnected");
		connect_user --;
		socket.broadcast.emit("user",connect_user);
		socket.emit("user",connect_user);
	});

	socket.on("debug",function(data) {
		console.log(data);
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
		});

		if (broadcast_post !== false) {
			socket.emit("newpost",broadcast_post);
			socket.broadcast.emit("newpost",broadcast_post);
		}
	})

});


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
			,postip:getClientIp(req)
		}
	}
	save_post(post_data);
	pre_render_index(res,undefined,"0");
});

//utils

function escapeHTML(str) {
	return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
