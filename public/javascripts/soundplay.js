function sound_play() {
			$('embed').remove();
			$('body').append('<embed src="/sound/' + $("#sound_select").val() + '" autostart="true" hidden="true" loop="false">');
}
