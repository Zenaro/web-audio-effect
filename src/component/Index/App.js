import React, {
	Component
} from 'react';

import '../../style/index/app.scss';
import ID3 from '../../Lib/id3/id3';
import AudioCtx from '../../Lib/context/AudioCtx';
import CanvasCtx from '../../Lib/context/CanvasCtx';
import Recorder from '../../Lib/context/Recorder';

import List from './ListComponent';
import Effect from './EffectComponent';
import Player from './PlayerComponent';
import Speaker from './SpeakerComponent';

AudioCtx.init();
const Audio = AudioCtx.getAudio();
const OriginAnalyser = AudioCtx.getOriginAnalyser();
const AudioAnalyser = AudioCtx.getAnalyser();

export default class App extends Component {
	constructor(props) {
		super(props);
		this.audio = Audio;
		this.state = {
			album: '',
			title: '',
			artist: '',
			FileList: [],
			sign: 0,
			isDragEnter: false,
			isPicReady: false,
			isLayinList: false,
			isLayinEffect: false,
			isOriginCanvas: false,
			isMedia: false,
		}
		this.restart = this.restart.bind(this);
		this.isSlide = this.isSlide.bind(this);
		this.onDragModal = this.onDragModal.bind(this);
		this.offDragModal = this.offDragModal.bind(this);
		this.filesAdd = this.filesAdd.bind(this);
		this.switchOriginCanvas = this.switchOriginCanvas.bind(this);
		this.switchMedia = this.switchMedia.bind(this);
	}
	componentDidMount() {
		this.OriginCanvas = new CanvasCtx(this.DOMOriginCanvas, OriginAnalyser);
		this.Canvas = new CanvasCtx(this.DOMCanvas, AudioAnalyser);
		this.setState({
			isLayinList: true,
			isLayinEffect: true
		})
	}
	stop(event) {
		event.stopPropagation();
	}
	isSlide() {
		if (this.state.isLayinList && this.state.isLayinEffect) {
			this.setState({
				isLayinList: false,
				isLayinEffect: false
			});
		} else {
			this.setState({
				isLayinList: true,
				isLayinEffect: true
			});
		}
	}
	onDragModal() {
		this.setState({
			isDragEnter: true
		});
	}
	onDragover(event) {
		event.preventDefault();
	}
	offDragModal() {
		this.setState({
			isDragEnter: false
		});
	}
	filesAdd(event, file) {
		let newFileList = [];
		if (file) {
			newFileList.push(file);

		} else {
			this.setState({
				isDragEnter: false
			});
			let files = event.target.files;

			for (let i = files.length - 1, file = null, title = '', src = ''; i >= 0; i--) {
				if (files[i].type.indexOf('audio') < 0) continue;
				file = files[i];
				title = files[i].name.substr(0, files[i].name.lastIndexOf('.'));
				src = URL.createObjectURL(files[i]);
				newFileList.push({
					'file': file,
					'title': title,
					'src': src
				});
			}
		}

		let originLength = this.state.FileList.length;
		// setState 是异步的，Attention
		this.setState((prevState) => ({
			FileList: prevState.FileList.concat(newFileList)
		}), () => {
			let index = 0,
				newLength = this.state.FileList.length;
			if (originLength == 0 && newLength > 0) {
				this.restart(0);

			} else if (originLength && originLength < newLength) {
				index = originLength;
				this.restart(originLength);

			} else {
				alert('The files you dragged may no be the audio');
			}
		});
	}
	switchOriginCanvas() {
		this.setState((prevState) => ({
			isOriginCanvas: !prevState.isOriginCanvas
		}));
	}
	restart(index) {
		let title = this.state.FileList[index].title,
			file = this.state.FileList[index].file;

		this.setState({
			isPicReady: false,
			sign: index
		});

		file && ID3.loadTags(title, () => {
			let tags = ID3.getAllTags(title);
			let image = tags.picture;
			if (image) {
				let base64String = "";
				for (let i = 0; i < image.data.length; i++) {
					base64String += String.fromCharCode(image.data[i]);
				}
				// 读取的解码后的封面格式为 base64
				let base64 = "data:" + image.format + ";base64," +
					window.btoa(base64String);
				this.Canvas.drawRect();
				this.OriginCanvas.drawRect();

				this.setState({
					title: tags.title,
					artist: tags.artist,
					album: base64,
					isPicReady: true
				});

			} else {
				// this.audioData.album = defaultAlbum;
			}

		}, {
			tags: ["title", "artist", "album", "picture"],
			dataReader: ID3.FileAPIReader(file)
		});

		this.audio.src = this.state.FileList[index].src;
		// this.audioData.audioSrc = this.FileList[index].src;
		// 2. 淡入音频
		// if (this.audioData.audioSrc !== '') {
		this.audio.play();

		// AudioCtx.layinSound();

		// }
		AudioCtx.layinSound();
	}
	switchMedia(event) {
		event.stopPropagation();
		this.setState((prevState) => ({
			isMedia: !prevState .isMedia
		}));
		// Recorder.init();
		// console.log(Recorder);
	}
	render() {
		let wrapStyle = 'wrap ';
		let originCanvasStyle = 'origin-canvas ';
		let mediaStyle = ' ';
		this.state.isPicReady ?
			wrapStyle += 'float-in' : '';
		this.state.isOriginCanvas ?
			originCanvasStyle += 'fadeIn' : '';
		this.state.isMedia ?
			mediaStyle += 'slide-up' : 
			mediaStyle += 'slide-down';
		return (
			<div className="container" onClick={this.isSlide}>
				<List sign={this.state.sign} items={this.state.FileList} 
	        			restart={this.restart} isLayin={this.state.isLayinList}
	        		/>
	        	<Effect AudioCtx={AudioCtx} isLayin={this.state.isLayinEffect}
        				switchOriginCanvas={this.switchOriginCanvas}/>
				<div className={'media-index' + mediaStyle}>
					<Player audio={this.audio} audioCtx={AudioCtx} offDragModal={this.offDragModal}
							album={this.state.album} title={this.state.title} artist={this.state.artist}
							sign={this.state.sign} listLength={this.state.FileList.length}
							restart={this.restart}
					/>
				</div>
				<div className={'media-speaker' + mediaStyle} onClick={this.stop}>
					<Speaker Recorder={Recorder} filesAdd={this.filesAdd} Audio={this.audio}
						switchMedia={this.switchMedia}/>
				</div>
        		<div className="maintain" onDragEnter={this.onDragModal}>
        			<div className={wrapStyle} onClick={this.switchMedia}>
        				<i className="fa fa-microphone icon-microphone" aria-hidden="true">
	        			</i>
						{this.state.album && 
							<img src={this.state.album} className="album" alt="album"/>
        				}
        			</div>
		    		<canvas className={originCanvasStyle} 
		    			ref={(canvas) => {this.DOMOriginCanvas = canvas}}>
		    		</canvas>
		    		<canvas className="canvas" 
		    			ref={(canvas) => {this.DOMCanvas = canvas}}>
		    		</canvas>
				</div>
				<div className={this.state.isDragEnter ? 'drag-component show' : 'drag-component'} 
					onDragOver={this.onDragover} onDrop={this.offDragModal} onClick={this.stop}>
		        	<input type="file" multiple="multiple" onChange={this.filesAdd}/>
				</div>
      		</div>
		);
	}
}