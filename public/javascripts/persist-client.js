var store;

function load_store_data() {
	store = new Persist.Store('strange-node');
	
	if(store.get('soundon_check') === "true") {
		$("#sound_on").attr("checked","checked");
	}

	if(store.get('tarenagashi') === "true") {
		$("#tarenagashi_on").attr("checked","checked");
	}
	$("#sound_select").val(store.get("sound_select"));
	$("#css_custom_data").val(store.get('custom_css'));
	$("#custom").text(store.get('custom_css'));
	shortcutkey_get(store);
}

function soundon_save() {
	if($("#sound_on").is(":checked")) {
		store.set('soundon_check','true');
	} else {
		store.set('soundon_check','false');
	}
}

function soundselect_save() {
	$('body').append('<embed src="/sound/' + $("#sound_select").val() + '" autostart="true" hidden="true" loop="false">');
	store.set('sound_select',$("#sound_select").val());
}

function tarenagashi_save() {
	if($("#tarenagashi_on").is(":checked")) {
		store.set("tarenagashi","true");
	} else {
		store.set("tarenagashi","false");
	}
}

function show_css_custom() {
	$("#css_custom").fadeIn();
}

function apply_css_custom() {
	store.set('custom_css',$("#css_custom_data").val());
	$("#custom").text($("#css_custom_data").val());
	$("#css_custom").fadeOut();
}

function return_css_custom() {
	$("#css_custom_data").val(store.get('custom_css'));
}

function not_apply_css_custom() {
	$("#css_custom").fadeOut();
}

function show_shortcut_custom() {
	$("#shortcut_custom").fadeIn();
}

function apply_shortcut_element() {
	shortcut.add($("#shortcut_reflesh").val(),function() {
		location.href="/";
	});
	shortcut.add($("#shortcut_reflesh_0").val(),function() {
		location.href="/0/";
	});

	$("#show_shortcut_reflesh").text("(" + $("#shortcut_reflesh").val() + ")");
	$("#show_shortcut_reflesh_0").text("(" + $("#shortcut_reflesh_0").val() + ")");

	shortcut.add($("#shortcut_textarea").val(),function() {
		document.postfrom.content.focus();
	});
	$("#show_shortcut_textarea").text("(" + $("#shortcut_textarea").val() + ")");
}

function shortcutkey_get(store) {
	var pre_shortcut_string = store.get("shortcut_string");
	
	if (pre_shortcut_string !== null) {
		var shortcut_array = pre_shortcut_string.split(",");
		$("#shortcut_reflesh").val(shortcut_array[0]);
		$("#shortcut_reflesh_0").val(shortcut_array[1]);
		$("#shortcut_a_read").val(shortcut_array[2]);
		$("#shortcut_s_post").val(shortcut_array[3]);
		$("#shortcut_d_post").val(shortcut_array[4]);
		$("#shortcut_show_post").val(shortcut_array[5]);
		$("#shortcut_textarea").val(shortcut_array[6]);
	}
	if(typeof shortcut !== "undefined") {
		apply_shortcut_element();
	}
}

function shortcutkey_save(store) {
	var shortcut_string = "" +
		$("#shortcut_reflesh").val() + "," + 
		$("#shortcut_reflesh_0").val() + "," +
		$("#shortcut_a_read").val() + "," +
		$("#shortcut_s_post").val() + "," +
		$("#shortcut_d_post").val() + "," +
		$("#shortcut_show_post").val() + "," + 
		$("#shortcut_textarea").val();
	store.set("shortcut_string",shortcut_string);
}


