export default class CanvasComponent {
	constructor(DOMCanvas, AudioData) {
		this.canvas = DOMCanvas;
		this.WIDTH = DOMCanvas.width || 1040;
		this.HEIGHT = DOMCanvas.height || 150;
		this.canvasCtx = this.canvas.getContext('2d');
		this.AudioAnalyser = AudioData.analyser;
		this.bufferLength = AudioData.bufferLength;
		this.dataArray = new Float32Array(this.bufferLength);
		this.freqByteData = new Uint8Array(this.AudioAnalyser.frequencyBinCount);
	}
	drawWave() {
		requestAnimationFrame(this.drawWave.bind(this));

		this.AudioAnalyser.getFloatTimeDomainData(this.dataArray);
		this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

		this.canvasCtx.lineWidth = 1;
		this.canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

		this.canvasCtx.beginPath();

		let sliceWidth = this.WIDTH * 1.0 / this.bufferLength;
		let x = 0;

		for (let i = 0; i < this.bufferLength; i++) {
			let v = this.dataArray[i] * this.HEIGHT / 2;
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
	}
	drawRect() {
		requestAnimationFrame(this.drawRect.bind(this));

		this.AudioAnalyser.getByteFrequencyData(this.freqByteData); // length为 256 bufferLength的一半

		this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
		for (let i = 0, cellW = 3, length = this.bufferLength; i < length; i += cellW) {

			// requestAnimationFrame(() => {
			let y = this.freqByteData[length - i] / 4;
			y = y > 1 ? y : 1;
			this.canvasCtx.fillStyle = 'rgb(255, 255, 255)';
			this.canvasCtx.fillRect(i / cellW * (cellW + 1), this.HEIGHT - y, cellW, y);

			// });
		}
	}
	drawTimeDomainRect() {
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
	drawGSBlur(base64) {
		let img = new Image(),
			imageData = [];
		img.onload = () => {
			this.canvasCtx.drawImage(img, 0, 0, this.WIDTH, this.HEIGHT);
			// imageData = this.canvasCtx.getImageData(0, 0, this.WIDTH, this.HEIGHT);
            // const StackBlur = require('stackblur-canvas');
            // StackBlur.imageDataRGB(imageData, 0, 0, this.WIDTH, this.HEIGHT, 180);

            // this.GaussianBlur(imageData, 6);
            // this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
            // this.canvasCtx.putImageData(imageData, 0, 0);
		};
		img.src = base64;
	}

    // too slow
    GaussianBlur(imgData, radius, sigma) {
        let pixes = imgData.data,
            width = imgData.width,
            height = imgData.height;

        radius = radius || 5;
        sigma = sigma || radius / 3;

        let gaussEdge = radius * 2 + 1;    // 高斯矩阵的边长

        let gaussMatrix = [],
            gaussSum = 0,
            a = 1 / (2 * sigma * sigma * Math.PI),
            b = -a * Math.PI;

        for (let i=-radius; i<=radius; i++) {
            for (let j=-radius; j<=radius; j++) {
                let gxy = a * Math.exp((i * i + j * j) * b);
                gaussMatrix.push(gxy);
                gaussSum += gxy;    // 得到高斯矩阵的和，用来归一化
            }
        }
        let gaussNum = (radius + 1) * (radius + 1);
        for (let i=0; i<gaussNum; i++) {
            gaussMatrix[i] = gaussMatrix[i] / gaussSum;    // 除gaussSum是归一化
        }

        // 循环计算整个图像每个像素高斯处理之后的值
        for (let x=0; x<width;x++) {
            for (let y=0; y<height; y++) {
                let [r, g, b] = [0, 0, 0];

                // 计算每个点的高斯处理之后的值
                for (let i=-radius; i<=radius; i++) {
                    // 处理边缘
                    let m = this.handleEdge(i, x, width);
                    for (let j=-radius; j<=radius; j++) {
                        // 处理边缘
                        let mm = this.handleEdge(j, y, height);

                        let currentPixId = (mm * width + m) * 4;

                        let jj = j + radius;
                        let ii = i + radius;
                        r += pixes[currentPixId] * gaussMatrix[jj * gaussEdge + ii];
                        g += pixes[currentPixId + 1] * gaussMatrix[jj * gaussEdge + ii];
                        b += pixes[currentPixId + 2] * gaussMatrix[jj * gaussEdge + ii];
                    }
                }
                let pixId = (y * width + x) * 4;

                pixes[pixId] = ~~r;
                pixes[pixId + 1] = ~~g;
                pixes[pixId + 2] = ~~b;
            }
        }
    }
    handleEdge(i, x, w) {
        let  m = x + i;
        if (m < 0) {
            m = -m;
        } else if (m >= w) {
            m = w + i - x;
        }
        return m;
    }
};