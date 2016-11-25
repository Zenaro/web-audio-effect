let CanvasComponent = {
	canvas: {},
	canvasCtx: {},
	WIDTH: 630,
	HEIGHT: 630,
	bufferLength: 0,
	dataArray: null, // 时域时的采样数据
	freqByteData: null, // 频域时的采样数据
	AudioAnalyser: null,
	init: function(AudioData, DOMCanvas) { /* 获取analyser的三个必要参数，以确保draw方法的运行 */
		this.AudioAnalyser = AudioData.analyser;

		this.canvas = DOMCanvas;
		this.canvasCtx = this.canvas.getContext('2d');
		this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

		this.bufferLength = AudioData.bufferLength;
		this.dataArray = new Float32Array(this.bufferLength);
		this.freqByteData = new Uint8Array(this.AudioAnalyser.frequencyBinCount);

	},
	drawWave: function() {
		requestAnimationFrame(this.drawWave.bind(this));

		this.AudioAnalyser.getFloatTimeDomainData(this.dataArray);
		this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

		this.canvasCtx.lineWidth = 1;
		this.canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

		this.canvasCtx.beginPath();

		let sliceWidth = this.WIDTH * 1.0 / this.bufferLength;
		let x = 0;

		for (let i = 0; i < this.bufferLength; i++) {
			let v = this.dataArray[i] * 150.0;
			let y = this.HEIGHT / 4 + v;

			if (i === 0) {
				this.canvasCtx.moveTo(x, y);
			} else {
				this.canvasCtx.lineTo(x, y);
			}
			x += sliceWidth;
		}

		this.canvasCtx.lineTo(this.WIDTH, this.HEIGHT / 2);
		this.canvasCtx.stroke();
	},
	drawRect: function() {
		requestAnimationFrame(this.drawRect.bind(this));

		this.AudioAnalyser.getByteFrequencyData(this.freqByteData); // length为 256 bufferLength的一半

		this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
		for (let i = 0, cellW = 6, length = this.bufferLength; i < length; i += cellW) {

			// requestAnimationFrame(() => {
			// 考虑丢弃前10个数据
			let y = this.freqByteData[length / 2 - i] / 8;
			y = y > 1 ? y : 1;
			this.canvasCtx.fillStyle = 'rgb(255, 255, 255)';
			this.canvasCtx.fillRect(i / cellW * (cellW + 1), 150 - y, cellW, y);

			// });
		}
	},
	drawTimeDomainRect: function() {
		// let drawVisual = requestAnimationFrame(this.drawRect.bind(this));

		this.AudioAnalyser.getFloatTimeDomainData(this.dataArray);

		// this.canvasCtx.fillStyle = 'rgb(250, 250, 250)';
		this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
		for (let i = 0, cellW = 6; i < this.bufferLength; i++) {
			// let y0 = 0;
			// if (i > 0) y0 = this.dataArray[i - 1] * 100;
			// requestAnimationFrame(() => {
			let y = this.dataArray[i] * 300;
			y = y > 10 ? y : 10;
			// if (y < y0) this.canvasCtx.clearRect(i * (cellW + 1), 0, cellW, 149);
			// this.canvasCtx.clearRect(i * (cellW + 1), 0, cellW, 149);
			this.canvasCtx.fillStyle = 'rgb(255, 255, 255)';
			this.canvasCtx.fillRect(i * (cellW + 1), 150 - y, cellW, y);

			// });
		}

		setTimeout(this.drawTimeDomainRect.bind(this), 80); // 传递this进去

		/*
		 *若使用request代替定时器，则clearRect()函数要缓冲一会再执行，否则没有动画
		 */
		// requestAnimationFrame(this.drawRect.bind(this));
	}
};
module.exports = CanvasComponent;