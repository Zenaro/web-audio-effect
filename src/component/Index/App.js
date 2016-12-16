import React, {
	Component
} from 'react';

import '../../style/index/app.scss';
import ID3 from '../../Lib/id3/id3';
import AudioCtx from '../../Lib/context/AudioCtx';
import CanvasCtx from '../../Lib/context/CanvasCtx';

import List from './ListComponent';
import Effect from './EffectComponent';
import Player from './PlayerComponent';

AudioCtx.init();
const Audio = AudioCtx.getAudio();
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
			isLayinEffect: false
		}
		this.restart = this.restart.bind(this);
		this.isSlide = this.isSlide.bind(this);
		this.onDragModal = this.onDragModal.bind(this);
		this.offDragModal = this.offDragModal.bind(this);
		this.filesChange = this.filesChange.bind(this);
	}
	componentDidMount() {
		this.canvas = new CanvasCtx(this.DOMCanvas, AudioAnalyser);
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
	filesChange(event) {
		this.setState({
			isDragEnter: false
		});
		let files = event.target.files;
		let newFileList = [];

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
	restart(index) {
		let title = this.state.FileList[index].title,
			file = this.state.FileList[index].file;

		this.setState({
			isPicReady: false,
			sign: index
		});

		ID3.loadTags(title, () => {
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
				this.canvas.drawRect();

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
	render() {
		let wrapStyle = 'wrap ';
		this.state.isPicReady ? 
			wrapStyle += 'float-in' : wrapStyle;
		return (
			<div className="container" onClick={this.isSlide}>
        		<List sign={this.state.sign} items={this.state.FileList} 
        			restart={this.restart} isLayin={this.state.isLayinList}
        		/>
        		<Effect AudioCtx={AudioCtx} isLayin={this.state.isLayinEffect}/>
        		<div className="maintain" onDragEnter={this.onDragModal}>
        			<div className={wrapStyle}>
						{this.state.album && 
							<img src={this.state.album} className="album" alt="album"/>
        				}
        			</div>
		    		<canvas ref={(canvas) => {this.DOMCanvas = canvas}}></canvas>
				</div>
				<div className={this.state.isDragEnter ? 'drag-component show' : 'drag-component'} 
					onDragOver={this.onDragover} onDrop={this.offDragModal} onClick={this.stop}>
		        	<input type="file" multiple="multiple" onChange={this.filesChange}/>
				</div>
				<Player audio={this.audio} audioCtx={AudioCtx} offDragModal={this.offDragModal}
						album={this.state.album} title={this.state.title} artist={this.state.artist}
						sign={this.state.sign} listLength={this.state.FileList.length}
						restart={this.restart}
				/>
      		</div>
		);
	}
}