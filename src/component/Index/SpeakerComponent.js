import React, {
	Component
} from 'react';

import '../../style/index/speaker.scss';

export default class SpeakerComponent extends Component {
	constructor(props) {
		super(props);
		this.Recorder = this.props.Recorder;
		this.Audio = this.props.Audio;

		this.restart = this.restart.bind(this);
		this.finish = this.finish.bind(this);
		this.record = this.record.bind(this);
		this.state = {
			isRecording: false,
			playingPct: 0,
			currentTime: 0,
			duration: 0
		}
	}
	componentDidMount() {
		this.Audio.ontimeupdate = () => {
			let pct = ~~(this.Audio.currentTime / this.Audio.duration * 1000) / 10;
			this.setState({
				playingPct: pct,
				currentTime: this.Audio.currentTime,
				duration: this.Audio.duration
			});
		}
	}
	restart() {
		this.setState({
			isRecording: true
		});
		this.Audio.currentTime = 0;
		this.Recorder.init(this.props.filesAdd);
		this.props.AudioCtx.layinSound();
		this.props.AudioCtx.removeVocal();
	}
	finish(event) {
		this.setState({
			isRecording: false
		});
		this.Recorder.stop();
		this.props.switchMedia(event);
	}
	record() {
		this.setState({
			isRecording: true
		});
		this.Audio.currentTime = 0;
		this.Recorder.init(this.props.filesAdd);
		this.props.AudioCtx.layinSound();
		this.props.AudioCtx.removeVocal();
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
	render() {
		return (
			<div className="speaker bottom-bar">
				{this.state.isRecording && <div className="progress">
					<i className="progress-bar" style={{width: this.state.playingPct + '%'}}></i>
					<div className="progress-info">
						<span>录制<strong>{this.parseClock(this.state.currentTime)}</strong></span>
						<span className="pull-right">{this.parseClock(this.state.duration)}</span>
					</div>
				</div>}	
				<div className="speaker-core">
					<a href="javascript:void(0)" className="btn-restart" onClick={this.restart}>
						重唱
					</a>
					<a href="javascript:void(0)" className="btn-over" onClick={this.finish}>
						结束
					</a>
					<a href="javascript:void(0)" className="fa fa-microphone btn-speaker"
						title="开始录音" onClick={this.record}>
					</a>
				</div>		
			</div>
		);
	}
}