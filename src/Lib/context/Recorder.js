module.exports = {
	mediaRecorder: null,
	source: null,
	src: null,
	chunks: [],
	init: function(AudioCtx, filesAdd) {
		if (typeof filesAdd != 'function') {
			throw new Error("Recorder.init(): The second argument must be a function");
		}
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
					this.chunks.push(e.data);	// store the recorder
				};
				this.mediaRecorder.onstop = (e) => {	// over the recorder
					AudioCtx.audio.pause();
					let clipName = prompt('给刚才的录音起个名字吧:');
					let blob = new Blob(this.chunks, {
						'type': 'audio/ogg; codecs=opus'
					})
					let audioURL = window.URL.createObjectURL(blob);
					console.log(audioURL);
					filesAdd(e, {'file': null, 'title': clipName, 'src': audioURL});
					this.source.disconnect(0);
				}
				
				this.source = AudioCtx.audioCtx.createMediaStreamSource(stream);
				let recorder = AudioCtx.audioCtx.createScriptProcessor(1024, 1, 1);
				this.source.connect(recorder);
				recorder.connect(AudioCtx.audioCtx.destination);
				recorder.onaudioprocess = (e) => {
					let inputBuffer = e.inputBuffer;
					let outputBuffer = e.outputBuffer;
					for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
						let inputData = inputBuffer.getChannelData(channel);
						for (let sample = 0; sample < inputBuffer.length; sample++) {
							outputBuffer[sample] = inputData[sample];
						}
					}
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
	}
}