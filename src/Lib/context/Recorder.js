module.exports = {
	mediaRecorder: null,
	src: null,
	chunks: [],
	init: function(filesAdd) {
		navigator.getUserMedia = navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia;
		if (navigator.getUserMedia) {
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
					filesAdd(e, {'file': null, 'title': clipName, 'src': audioURL});
				}
			}, (err) => {
				console.log('The following gUM error occured: ' + err);
			});

		} else {
			alert('您的浏览器未支持麦克风');
		}
	},
	stop: function() {
		this.mediaRecorder.stop();
	},
	getSrc: function() {
		return this.src;
	}
}