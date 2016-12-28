module.exports = {
	mediaRecorder: null,
	chunks: [],
	init: function() {
		navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia;
		if (navigator.getUserMedia) {
			console.log('getUserMedia supported.');
			navigator.getUserMedia({
				audio: true
			}, (stream) => {
				this.mediaRecorder = new window.MediaRecorder(stream);
				this.mediaRecorder.start();
				this.mediaRecorder.ondataavailable = (e) => {
					this.chunks.push(e.data);
				};
				this.mediaRecorder.onstop = (e) => {
					let clipName = prompt('Enter a name for your sound clip');
					let blob = new Blob(this.chunks, {
						'type': 'audio/ogg; codecs=opus'
					})
					let audioURL = window.URL.createObjectURL(blob);
					// this.audio.src = audioURL;
				}
			}, (err) => {
				console.log('The following gUM error occured: ' + err);
			});

		} else {
			console.log('getUserMedia not supported on your browser');
		}
	},
	stop: function() {
		this.mediaRecorder.stop();
	}
}