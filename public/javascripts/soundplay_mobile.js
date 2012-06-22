function sound_play() {
			$("#sound_effect").remove();
			$('body').append('<audio src="/sound/' + $("#sound_select").val() + '" hidden="true" autoplay="false" loop="false" id="sound_effect">');
			var sound_effect = document.getElementById('sound_effect');
			sound_effect.addEventListener('canplay',function() {
				this.play();
			});
			sound_effect.load();
}
