import React, {
	Component
} from 'react';

import '../../style/index/player.scss';

let defaultAlbum = require('../../images/player/default_album.jpg');

export default class PlayerComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			initLoading: true, // 首次加载 mp3
			isLoading: false, // 是否正在加载mp3
			isPlaying: false, // 是否正在播放
			isSeeking: false, // 是否正在拖拽歌曲进度条
			ProWidth: 415, // 进度条总长
			VlmOuterH: 110, // 音量条外高度
			VlmInnerH: 88, // 音量条内高度
			currentTime: 0, // 播放的当前时间
			duration: 0, // 总时长
			vlm: 0.5, // 音量
			vlmAdjust: false, // 是否显示音量条
			playingPct: 0, // 播放 百分比%
			loadingPct: 0, // 缓冲 百分比%
			isLopHint: false, // 是否显示循环方式的提示框
			lopIndex: 0, // 循环方式为第几个lopType
			lopType: [{
				text: '列表循环',
				className: 'icon-cycle'
			}, {
				text: '随机播放',
				className: 'icon-shuffle'
			}, {
				text: '单曲循环',
				className: 'icon-single'
			}],
		}
		this.Audio = props.audio;

		this.prevTrack = this.prevTrack.bind(this);
		this.nextTrack = this.nextTrack.bind(this);
		this.switchPlay = this.switchPlay.bind(this);
		this.proBtnDragstart = this.proBtnDragstart.bind(this);
		this.proBtnDrag = this.proBtnDrag.bind(this);
		this.proBtnDragend = this.proBtnDragend.bind(this);
		this.handleSeek = this.handleSeek.bind(this);
		this.onVlm = this.onVlm.bind(this);
		this.offVlm = this.offVlm.bind(this);
		this.vlmChange = this.vlmChange.bind(this);
		this.lopTypeChange = this.lopTypeChange.bind(this);
	}
	componentDidMount() {
		this.Audio.onloadstart = () => {
			// 首次初始化时不作loading处理
			let flag = this.state.initLoading;
			this.state.initLoading ? flag = false : flag = true

			this.setState({
				initLoading: flag
			});
		};
		this.Audio.oncanplay = () => {
			this.setState({
				isLoading: false
			});
		};
		this.Audio.onplay = () => {
			this.setState({
				isPlaying: true
			});
		};
		this.Audio.onpause = () => {
			this.setState({
				isPlaying: false
			});
		};
		this.Audio.ontimeupdate = () => {
			// 正在拖拽时 则取消前进
			if (!this.state.isSeeking) {
				let pct = ~~(this.Audio.currentTime / this.Audio.duration * 1000) / 10;
				this.setState({
					playingPct: pct,
					currentTime: this.Audio.currentTime
				});
			}
		};
		this.Audio.onprogress = () => {
			let pct = 0,
				index = this.Audio.buffered.length;

			// index大于0即可调用 buffered.end
			if (index > 0) {
				pct = ~~(this.Audio.buffered.end(index - 1) / this.Audio.duration * 1000) / 10;
				this.setState({
					loadingPct: pct
				});
			}
		};
		this.Audio.onended = () => {
			this.nextTrack();
		}
	}
	stop(event) {
		event.stopPropagation();
	}
	prevent(event) {
		event.preventDefault();
	}
	parseClock(num) {
		let min = ~~(num / 60);
		let sec = ~~(num % 60);
		if (min < 10) {
			min = '0' + min;
		}
		if (sec < 10) {
			sec = '0' + sec;
		}
		return min + ':' + sec;
	}
	prevTrack() {
		let index = this.props.sign,
			length = this.props.listLength;

		if (!length) return;

		index <= 0 ?
			index = length - 1 :
			index--;

		this.props.restart(index);
	}
	nextTrack() {
		let index = this.props.sign,
			length = this.props.listLength;
		switch (this.state.lopIndex) {
			case 0:
				index >= length - 1 ?
					index = 0 :
					index++;
				break;
			case 1:
				let rand = ~~(Math.random() * length);
				index = rand;
				break;
			case 2:
				break;
			default:
				;
		}
		this.props.restart(index);
	}
	switchPlay() {
		// 音量的淡入淡出，替换原先简单的暂停
		if (this.state.isPlaying) {
			this.props.audioCtx.layoutSound();

		} else {
			this.props.audioCtx.layinSound();
		}
		this.setState((prevState) => ({
			isPlaying: !prevState.isPlaying
		}));
	}
	proBtnDragstart() {
		this.setState({
			isSeeking: true
		});
	}
	proBtnDrag(event) {
		let pct = ~~(event.nativeEvent.offsetX / this.state.ProWidth * 1000) / 10;
		this.setState({
			playingPct: pct
		});
	}
	proBtnDragend(event) {
		let pct = ~~(event.nativeEvent.offsetX / this.state.ProWidth * 1000) / 10;
		if (this.Audio.duration) {
			this.Audio.currentTime = pct * this.Audio.duration / 100;
		}
		this.setState({
			isSeeking: false
		})
	}
	handleSeek(event) {
		this.setState({
			isSeeking: true
		});
		let pct = ~~(event.nativeEvent.offsetX / this.state.ProWidth * 1000) / 10;
		console.log(pct);
		this.setState({
			playingPct: pct
		});
		if (this.Audio.duration) {
			this.Audio.currentTime = pct * this.Audio.duration / 100;
		}
		this.setState({
			isSeeking: false
		});
	}
	onVlm() {
		let flag = false;
		this.state.vlmAdjust === false ? flag = true : flag = false;

		this.setState({
			vlmAdjust: flag
		});
	}
	offVlm() {
		this.setState({
			vlmAdjust: false
		});
	}
	vlmChange(event) {
		let path = event.nativeEvent.path,
			PlayerOffsetTop = 0;
		for (let i = 0; i < path.length; i++) {
			if (path[i].className === 'audio-player') {
				PlayerOffsetTop = path[i].offsetTop;
				break;
			}
		}
		let short = (this.state.VlmOuterH - this.state.VlmInnerH) / 2,
			pct = (PlayerOffsetTop - event.pageY - short) / this.state.VlmInnerH;
		if (pct > 0.95) pct = 0.95;
		if (pct < 0) pct = 0;
		this.setState({
			vlm: pct
		});
		this.Audio.volume = pct;
	}
	lopTypeChange() {
		let index = this.state.lopIndex,
			length = this.state.lopType.length;
		index >= length - 1 ?
			index = 0 :
			index++;

		this.setState({
			lopIndex: index,
			isLopHint: true
		});

		setTimeout(() => {
			this.setState({
				isLopHint: false
			});
		}, 1000);
	}
	render() {
		return (
			<div className="audio-player">
				<div className="audio-player-core">
					<div className="play-btns">
						<a href="javascript:void(0);" className="prv" onClick={this.prevTrack} 
							title="上一首">
						</a>
						<a href="javascript:void(0);" onClick={this.switchPlay} 
							className={this.state.isPlaying ? 'play-pas' : 'play-ply'}>
						</a>
						<a href="javascript:void(0);" className="nxt" onClick={this.nextTrack} 
							title="下一首"></a>
					</div>
					<div className="play-album">
						<a href="javascript:void(0);">
							<img src={this.props.album || defaultAlbum} alt=""/>
						</a>
					</div>
					<div className="play-progress">
						<div className="pro-title">
							<a href="javascript:void(0);" className="title" title="曲名">{this.props.title}</a>
							<a href="javascript:void(0);" className="singer" title="演绎者">{this.props.artist}</a>
						</div>
						<div className="pro-bar">
							<div className="barbg">
								<div className="rdy" style={{width: this.state.loadingPct + '%'}}></div>
								<div className="cur" draggable="true" 
											onDragStart={this.proBtnDragstart}
											onDrag={this.proBtnDrag}
											onDragOver={this.prevent}
											onDragEnd={this.proBtnDragend}
											onClick={this.handleSeek}>
									<div className="cur-inner" style={{width: this.state.playingPct + '%'}}>
										<span className="btn-cur">
											{this.state.isLoading && <i></i>}
										</span>
									</div>
								</div>
							</div>
							<span className="clock">
								<i>{this.parseClock(this.state.currentTime)}</i>
								<span> / </span>
								<em>{this.parseClock(this.state.duration)}</em>
							</span>
						</div>
					</div>
					<div className="play-ctrl">
						<div className={this.state.vlmAdjust?"vlm-bar show":"vlm-bar"} onMouseLeave={this.offVlm}>
							<div className="barbg" onClick={this.vlmChange}>
								<div className="cur" style={{height: this.state.vlm * 100 + '%'}}>
									<i className="btn-cur" draggable="true" 
										onDrag={this.vlmChange} onDragEnd={this.vlmChange}></i>
								</div>
							</div>
						</div>
						<a href="javascript:void(0);" className="icon-vol" onClick={this.onVlm} title="音量"></a>
						<a href="javascript:void(0);" onClick={this.lopTypeChange} 
							className={this.state.lopType[this.state.lopIndex].className}>
						</a>
						<div className={this.state.isLopHint ? 'show lop-hint': 'lop-hint'}>
							{this.state.lopType[this.state.lopIndex].text}
						</div>
					</div>
				</div>
			</div>
		);
	}
}