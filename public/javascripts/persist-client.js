var store;

function load_store_data() {
	store = new Persist.Store('strange-node');
	
	if(store.get('soundon_check') === "true") {
		$("#sound_on").attr("checked","checked");
	}
	$("#css_custom_data").val(store.get('custom_css'));
	$("#custom").text(store.get('custom_css'));
}

function soundon_save() {
	if($("#sound_on").is(":checked")) {
		store.set('soundon_check','true');
	} else {
		store.set('soundon_check','false');
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
