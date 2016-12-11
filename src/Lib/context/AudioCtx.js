/*
 * 	1. Create audio context
 *	2. Inside the context, create sources — such as <audio>, oscillator, stream
 *	3. Create effects nodes, such as reverb, biquad filter, panner, compressor
 *	4. Choose final destination of audio, for example your system speakers
 *	5. Connect the sources up to the effects, and the effects to the destination.
 *	https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API 图
 *  使用BiquadFilterNode调整音色（大量滤波器）、
 *  使用ChannelSplitterNode分割左右声道、
 *  使用GainNode调整增益值实现音乐淡入淡出。
 */

// 自定义播放器组件类
let AudioCtxUtil = {
	audio: null,
	audioCtx: null,
	source: null, // 音频源
	analyser: null, // 音频分析器
	panner: null, // panner实现立体声
	sec: 0.8, // 音量淡入淡出时长
	bufferLength: 256, // 频域分析 fft(快速傅里叶变换)的大小,默认调整为 512
	init: function() {
		this.audio = new Audio();
		this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
		this.source = this.audioCtx.createMediaElementSource(this.audio);
		this.analyser = this.audioCtx.createAnalyser();
		this.analyser.fftSize = 2048;

		// source  ->  analyser  ->  destination  播放的一条通路
		this.gainNode = this.audioCtx.createGain();

		this.source.connect(this.analyser);
		this.analyser.connect(this.gainNode);
		this.gainNode.connect(this.audioCtx.destination);
		// this.source.connect(this.analyser);
		// this.analyser.connect(this.audioCtx.destination);
	},

	/*
	 * 获取 Audio对象
	 */
	getAudio: function() {
		return this.audio;
	},

	/*
	 * 获取analyser对象及fft参数，canvas画图用
	 */
	getAnalyser: function() {
		return {
			bufferLength: this.bufferLength,
			analyser: this.analyser
		}
	},

	/*
	 * 淡入声音
	 */
	layinSound: function() {
		this.gainNode.gain.value = 0;
		this.audio.play();
		let currentTime = this.audioCtx.currentTime;
		this.gainNode.gain.linearRampToValueAtTime(1, currentTime + this.sec);
	},

	/*
	 * 淡出声音
	 */
	layoutSound: function() {
		// this.gainNode.gain.value = 0;
		let currentTime = this.audioCtx.currentTime;
		this.gainNode.gain.linearRampToValueAtTime(0, currentTime + this.sec);
		setTimeout(() => {
			this.audio.pause();
		}, this.sec * 1000); // 延时
		// this.gainNode.gain.linearRampToValueAtTime(1, currentTime)
	},

	/*
	 * 使用oscillator 创建音调
	 * 生成一段声音，可模仿线上钢琴
	 */
	createSound: function() {
		/*
		 * 标准 la 音为440hz， 高8音的频率为原音频的2倍
		 * 音阶换算公式: n个半音 = 12 * log2(f1 / f2) (其中, f1 < f2时n < 0, 反之n > 0);
		 * ->已知f2, 求f1, 其中 f1 小 f2 n个半音
		 * ->则 f1 = f2 * Math.pow(2, -n / 12);
		 */
		let i = Math.ceil(Math.random() * 10),
			hz = 440;

		// create Oscillator node
		let oscillator = this.audioCtx.createOscillator();

		oscillator.frequency.value = hz * i; // value in hertz
		oscillator.connect(this.audioCtx.destination);
		oscillator.start();
		setTimeout(() => {
			oscillator.stop();
		}, 300);
	},

	/*
	 * 使用 panner 来实现立体声
	 */
	stereo: function() {
		this.disconnect();
		let panner = this.audioCtx.createPanner();

		let gain = this.audioCtx.createGain();

		panner.setOrientation(0, 0, 0, 0, 1, 0);
		let index = 0,
			radius = 20;
		// 让声源绕着收听者以20的半径旋转
		this.effectTimer = setInterval(() => {
			panner.setPosition(Math.sin(index) * radius, 0, Math.cos(index) * radius);
			index += 1 / 100;
		}, 16);
		this.source.connect(panner);
		gain.gain.value = 5;
		panner.connect(gain);
		gain.connect(this.audioCtx.destination);
	},

	/*
	 * 低通滤波器
	 */
	lowpassFilter: function(freq) {
		this.disconnect();
		let biquadFilter = this.audioCtx.createBiquadFilter();
		biquadFilter.type = 'lowpass'; // 低阶通过
		biquadFilter.Q.value = 2;
		biquadFilter.frequency.value = freq || 800; // 临界点的 Hz，默认800Hz
		this.source.connect(biquadFilter);
		biquadFilter.connect(this.audioCtx.destination);
	},

	/*
	 * 高通滤波器
	 */
	highpassFilter: function(freq) {
		this.disconnect();
		let biquadFilter = this.audioCtx.createBiquadFilter();
		biquadFilter.type = 'highpass'; // 低阶通过
		biquadFilter.Q.value = 4;
		biquadFilter.frequency.value = freq || 800; // 临界点的 Hz，默认800Hz
		this.source.connect(biquadFilter);
		biquadFilter.connect(this.audioCtx.destination);
	},

	/*
	 * 39~392kHz人声增益 -- not complet
	 */
	lowshelfEnhance: function() {
		this.disconnect();
		let biquadFilter = this.audioCtx.createBiquadFilter();
		biquadFilter.type = 'lowshelf'; // 低于该频率将获得 10 增益
		biquadFilter.gain.value = 10;
		biquadFilter.frequency.value = 600; // 临界点的 Hz，默认800Hz
		this.source.connect(biquadFilter);
		biquadFilter.connect(this.audioCtx.destination);
	},

	/*
	 * 人声削弱 -- not complet
	 */
	lowshelfWeaken: function() {
		this.disconnect();
		let biquadFilter = this.audioCtx.createBiquadFilter();
		biquadFilter.type = 'lowshelf'; // 低于该频率将获得衰减
		biquadFilter.gain.value = -100;
		biquadFilter.frequency.value = 392; // 临界点的 Hz，默认800Hz
		this.source.connect(biquadFilter);
		biquadFilter.connect(this.audioCtx.destination);
	},

	/*
	 * 人声增益 -- perfect -- 
	 */
	enhanceVocal: function() {
		this.disconnect();
        let gain1 = this.audioCtx.createGain(),
            gain2 = this.audioCtx.createGain(),
            gain3 = this.audioCtx.createGain(),
            gain4 = this.audioCtx.createGain(),
            channelSplitter = this.audioCtx.createChannelSplitter(2),
            channelMerger = this.audioCtx.createChannelMerger(2);

        gain1.gain.value = 2;
        gain2.gain.value = 2;

        this.source.connect(gain3);
        gain3.connect(channelSplitter);

        // 2-1>2
        channelSplitter.connect(gain1, 0);
        gain1.connect(channelMerger, 0, 1);
        channelSplitter.connect(channelMerger, 1, 1);

        //1-2>1
        channelSplitter.connect(gain2, 1);
        gain2.connect(channelMerger, 0, 0);
        channelSplitter.connect(channelMerger, 0, 0);

        gain4.gain.value = 0.8;
        channelMerger.connect(gain4);
        gain4.connect(this.audioCtx.destination);
	},

	removeVocal: function() {
		this.disconnect();
        let gain1 = this.audioCtx.createGain(),
            gain2 = this.audioCtx.createGain(),
            gain3 = this.audioCtx.createGain(),
            gain4 = this.audioCtx.createGain(),
            channelSplitter = this.audioCtx.createChannelSplitter(2),
            channelMerger = this.audioCtx.createChannelMerger(2);
        //     filterlow = this.audioCtx.createBiquadFilter(),
        //     filterhigh = this.audioCtx.createBiquadFilter(),
        //     jsNode = this.audioCtx.createScriptProcessor(2048);

        // filterlow.type = filterlow.LOWPASS;
        // filterlow.frequency.value = 20;
        // filterlow.Q.value = 0;

        // filterhigh.type = filterhigh.HIGHPASS;
        // filterhigh.frequency.value = 20000;
        // filterhigh.Q.value = 0;

        // 反相音频组合
        gain1.gain.value = -1;
        gain2.gain.value = -1;

        this.source.connect(gain3);
        gain3.connect(channelSplitter);

        // 2-1>2
        channelSplitter.connect(gain1, 0);
        gain1.connect(channelMerger, 0, 1);
        channelSplitter.connect(channelMerger, 1, 1);

        //1-2>1
        channelSplitter.connect(gain2, 1);
        gain2.connect(channelMerger, 0, 0);
        channelSplitter.connect(channelMerger, 0, 0);

        // 高低频补偿合成
        // source.connect(filterhigh);
        // source.connect(filterlow);
        // filterlow.connect(channelMerger);
        // filterhigh.connect(channelMerger);
        // channelMerger.connect(audioContext.destination);
        // 普通合成
        gain4.gain.value = 1;
        channelMerger.connect(gain4);
        gain4.connect(this.audioCtx.destination);
	},

	/*
	 * 延时，回声效果
	 */
	delay: function() {
		this.disconnect();

		let delay = this.audioCtx.createDelay();
		let gain = this.audioCtx.createGain();

		delay.delayTime.value = 0.06; // 延时0.06s
		gain.gain.value = 1.2;

		// 两条平行通路

		// 1.source -> destination
		this.source.connect(this.audioCtx.destination);

		// 2.source -> delay -> gain -> destination
		this.source.connect(delay);
		delay.connect(gain);
		gain.connect(this.audioCtx.destination);
	},

	/*
	 * 波形修改器, WaveShaperNode接口表示一个非线性的扭曲。
	 * AudioNode 利用曲线来应用waveshaping扭曲。在扭曲效果里,常被用来添加温暖的感觉。
	 */
	waveShaper: function(amount) {
		this.disconnect();
		let shaper = this.audioCtx.createWaveShaper();
		let compressor = this.audioCtx.createDynamicsCompressor();
		let k = typeof amount === 'number' ? amount : 10,
			n_samples = 44100,
			curve = new Float32Array(n_samples),
			deg = Math.PI / 180;
		for (let x, i = 0; i < n_samples; i++) {
			x = i * 2 / n_samples - 1;
			curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
		}
		shaper.curve = curve;
		shaper.oversample = '4x';
		this.source.connect(shaper);
		shaper.connect(compressor);
		compressor.connect(this.audioCtx.destination);

		/*
			方案二： 未明显
		let s = [],
			l = 2048,
			i;
		for (i = 0; i <= l; i++) s.push(i / l * 2 - 1);
		shaper.curve = new Float32Array(s);
		// shaper.connect(this.audioCtx.destination);
		//连接：source → shaper → denstination
		this.source.connect(shaper);
		shaper.connect(this.audioCtx.destination);
		*/
	},

	/*
	 * 混响, Room Effect
	 */
	convolver: function() {
		let compressor = this.audioCtx.createDynamicsCompressor();
		let convolver = this.audioCtx.createConvolver();
		let gain = this.audioCtx.createGain();

		this.source.connect(compressor);
		compressor.connect(convolver);
		convolver.connect(gain);
		gain.connect(this.audioCtx.destination);
	},

	/*
	 * 
	 * createDynamicsCompressor()方法用于创建动态压缩器节点，可用于对音频信号应用压缩。
	 * 通过降低音量最大的部分的音量来帮助避免发生削波和失真。
	 */
	compressor: function() {
		this.disconnect();

		let masterCompression = this.audioCtx.createDynamicsCompressor();

		masterCompression.threshold.value = -50; // 分贝值，高于该分贝值，压缩将开始生效。
		masterCompression.knee.value = 40; //表示高于阈值的范围的分贝值，其中曲线平滑地过渡到压缩部分。
		masterCompression.ratio.value = 12; //表示输出中输出1 dB变化所需的变化量（以dB为单位）。
		// masterCompression.reduction.value = -20; //一个浮子表示压缩器当前对信号应用的增益减少量。
		masterCompression.attack.value = 0; //表示将增益降低10 dB所需的时间量（以秒为单位）。
		masterCompression.release.value = 0.25; //表示将增益增加10 dB所需的时间量（以秒为单位）。

		// 1
		// masterGain.connect(masterCompression);
		this.source.connect(masterCompression);
		masterCompression.connect(this.audioCtx.destination);

		// 2
		// convolver.normalize = true;
		// convolverGain.gain.value = 0;
		// convolverGain.connect(convolver);
		// convolver.connect(this.audioCtx.destination);
		/*
		let convolver = this.audioCtx.createConvolver();
		let gain1 = this.audioCtx.createGain();
		let gain2 = this.audioCtx.createGain();
		//模拟混响样本
		let length = 44100;
		let buffer = this.audioCtx.createBuffer(2, length, length);
		let data = [buffer.getChannelData(0), buffer.getChannelData(1)];
		for (let i = 0; i < length; i++) {
			//平方根衰减
			let v = 1 - Math.sqrt(i / length);
			//叠加24个不同频率
			for (let j = 1; j <= 24; j++) v *= Math.sin(i / j);
			//记录数据
			data[0][i] = data[1][i] = v;
		}
		//配置节点
		gain1.gain.value = 0.5;
		gain2.gain.value = 2;
		convolver.buffer = buffer;
		//连接：       → convolver → 
		//      source               destination
		//             →    gain   → 
		this.source.connect(convolver);
		this.source.connect(gain1);
		gain1.connect(this.audioCtx.destination);
		//动作
		convolver.connect(gain2);
		gain2.connect(this.audioCtx.destination);
		*/
	},

	/*
	 *  左声道和右声道的分离并单独处理，最后合并，左耳低阶增强，右耳伴奏增强
	 */
	splitterMerger: function() {
		this.disconnect();
		let lGain = this.audioCtx.createGain();
		let rGain = this.audioCtx.createGain();
		//创建声道离合器
		let splitter = this.audioCtx.createChannelSplitter(2);
		let merger = this.audioCtx.createChannelMerger(2);
		/*
		                 → lGain
		source → splitter         → merger → destination
		                 → rGain
		*/
		lGain.gain.value = 1;
		rGain.gain.value = 1;

		let leftFilter = this.audioCtx.createBiquadFilter();
		leftFilter.type = 'lowshelf';
		// leftFilter.Q.value = 2;
		leftFilter.gain.value = 10;
		leftFilter.frequency.value = 392;

		let rightFilter = this.audioCtx.createBiquadFilter();
		rightFilter.type = 'highshelf';
		// rightFilter.Q.value = 2;
		rightFilter.gain.value = 10;
		rightFilter.frequency.value = 82; // 临界点的 Hz，

		this.source.connect(splitter);
		splitter.connect(lGain, 0);
		splitter.connect(rGain, 1);
		lGain.connect(leftFilter);
		rGain.connect(rightFilter);
		leftFilter.connect(merger, 0, 0);
		rightFilter.connect(merger, 0, 1);
		// lGain.connect(merger, 0, 0);
		// rGain.connect(merger, 0, 1);
		merger.connect(this.audioCtx.destination);
	},

	/*
	 * 振荡器
	 */
	// audioOsci: function() {
	// 	this.disconnect();
	// 	let gain = this.audioCtx.createGain();
	// 	let oscillator = this.audioCtx.createOscillator();
	// 	//配置节点
	// 	// oscillator.frequency.value = 0.1;
	// 	// gain.gain.value = 1200;
	// 	//连接 source → gain 
	// 	//                ↓
	// 	// oscillator.frequency
	// 	//     ↓
	// 	// destination
	// 	// this.source.connect(gain);
	// 	this.source.connect(oscillator);
	// 	// gain.connect(oscillator);
	// 	oscillator.connect(this.audioCtx.destination);
	// 	//播放
	// 	oscillator.start(0);
	// },

	/*
	 * 清除音效，还原原声 
	 */
	cancelEffect: function() {
		this.disconnect();
		this.analyser.connect(this.audioCtx.destination);
		// this.source.connect(this.analyser);
		// this.analyser.connect(this.audioCtx.destination);
	},

	/*
	 * 用以source -> analyser -> destination 的重定向，即修改其传播路线，添加音频处理
	 * 重新指定音频到达speaker之前的路线，故要断开之前的连接
	 */
	disconnect: function() {
		this.source.disconnect(0);
		this.analyser.disconnect(0);
		// 先断开source的连接，重新确定路径
		this.source.connect(this.analyser);

		this.effectTimer && clearInterval(this.effectTimer);
	}
};

module.exports = AudioCtxUtil;