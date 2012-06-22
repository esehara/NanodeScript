function deny_spam() {
	
	var spam_filter = function() {
		var return_random = function(inte) {
			return Math.floor(Math.random() * inte);
		}
		var spam_string = ["いち","に","さん","し","ご","ろく","なな","はち","きゅう","ぜろ"];
		var return_string = "";
		for (var i = 0,len = spam_string.length;i < 4;i ++) {
			return_string = return_string + spam_string[return_random(len)];
		}
		return return_string;
	}
	
	var set_string = spam_filter();
	$("#deny_spam_value").text(set_string);
}

deny_spam();
