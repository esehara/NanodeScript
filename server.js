// Config

process.env.TZ = "Japan";

// requires
var express   = require('express');
var fs        = require('fs');
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
var Post = mongoose.model("post");
var app = module.exports = express.createServer();

// Configuration
var configure = require('./configure.js');
var utils = require('./utils.js').utils;
var bbs = configure.bbs;
var null_formval = function() {
	return {
		 name: ""
		,email: ""
		,topic: ""
		,parentid:""
		,content:""
		,url:""
		,reference:""
		,reference_d:""
	}
};




console.log("[Start]" + bbs.title);
console.log("[Start]" + bbs.server);

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.favicon(__dirname + '/public/favicon.ico', {
    maxAge: 2592000000
  }));
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
			,utils:utils()
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
				,utils:utils()
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
  	var counter_data = {
    	connection:connect_counter
  	}
	
	res.render('index', {
     title:  bbs.title
  	,posts:  []
	,utils:  utils()
	,formval: null_formval()
	,page : 0
	,connect_user: connect_user
  	,counter_data: counter_data
  	,parmament:{linkis: false}
	,links:bbs.link
	,css_template:'style.css'
	});
});

app.get('/sp/0/',function(req,res){

  	var counter_data = {
    	connection:connect_counter
  	}
	
	res.render('index_smartphone', {
     title:  bbs.title
  	,posts:  []
	,utils: utils()
	,formval: null_formval()
	,page : 0
	,connect_user: connect_user
  	,counter_data: counter_data
  	,parmament:{linkis: false}
	,links:bbs.link
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

	var parmament = {
		 linkis:false
		,post:undefined
	}
	if (typeof post_id === "undefined") {
		render_index(res,post_id,null_formval(),page,parmament,template,postnumber,css_template);
	} else {
		Post.findOne({_id:post_id},function(err,post){
			if (post === null) {
				render_index(res,post_id,null_formval(),page,parmament,postnumber,css_template);
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
				,reference_d: string_date(utils().render_date(post.date))
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
		if (pretext[i] !== "" && pretext[i].match(/^(&gt; &gt; )/) === null) {
			parsetext[parsetext.length] = "> " + pretext[i];
		}
	}
	return parsetext.join("\n") + "\n\n";
}

function render_thread(res,parent_id) {
	Post.find({parentid: parent_id},[],{sort:{date:-1}},
		function(err,posts){
			res.render('thread',{
				title: bbs.title + "　thread:" + parent_id
				,posts: posts
				,utils: utils()
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
  skip:(postnumber * page),limit: postnumber,sort:{date:-1}
  },function(err,posts){
  console.log(formval)
  res.render(template, {
     title:  bbs.title
  	,posts:  posts
	,utils:  utils()
	,formval: formval
	,page : page
	,connect_user: connect_user
  	,counter_data: counter_data
	,parmament:parmament
  	,links: bbs.link
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

app.post('/sp/',function(req,res){
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
	
		if(isNotSpam(req.body.deny_spam_value,req.body.deny_spam)){
			console.log("Deny Spam Value --> " + req.body.deny_spam_value);
			console.log("Deny Spam Input --> " + req.body.deny_spam);
			save_post(post_data);
		}
	}
		
	pre_render_index(res,undefined,"0",'index_smartphone',10,"style_mobile.css");
});

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
		console.log("Deny Spam Value --> " + req.body.deny_spam_value);
		console.log("Deny Spam Input --> " + req.body.deny_spam);
		if(isNotSpam(req.body.deny_spam_value,req.body.deny_spam)){
			save_post(post_data);
		}
	}
	pre_render_index(res,undefined,"0");
});

//utils

function escapeHTML(str) {
	return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isNotSpam (value,input_key) {
	var ReplaceAll = function(str,target,restr) {
		return str.split(target).join(restr);
	}
	if(value == "" || value.match(/[1-9a-zA-Z]/) !== null) {
		return false;
	} else {
		var replace_key = [
					["いち","1"]
					,["に","2"]
					,["さん","3"]
					,["し","4"]
					,["ご","5"]
					,["ろく","6"]
					,["なな","7"]
					,["はち","8"]
					,["きゅう","9"]
					,["ぜろ","0"]
				]
		for(var i = 0,len = replace_key.length; i < len; i ++) {
			value = ReplaceAll(value,replace_key[i][0],replace_key[i][1]);
		}
		console.log("Replace value!! --> " + value);
		if(value.match(/[^0-9]/) !== null) {
			return false;
		} else {
			if(value === input_key) {
				return true;
			} else {
				return false;
			}
		}
	}
}
