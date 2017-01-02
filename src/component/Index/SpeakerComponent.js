import React, {
	Component
} from 'react';

import '../../style/index/speaker.scss';

export default class SpeakerComponent extends Component {
	constructor(props) {
		super(props);
		this.Recorder = this.props.Recorder;

		this.restart = this.restart.bind(this);
		this.finish = this.finish.bind(this);
		this.record = this.record.bind(this);
	}
	restart() {
		this.props.Audio.currentTime = 0;
		this.Recorder.init(this.props.filesAdd);
	}
	finish(event) {
		this.Recorder.stop();
		this.props.switchMedia(event);
	}
	record() {
		this.props.Audio.currentTime = 0;
		this.Recorder.init(this.props.filesAdd);
	}
	render() {
		return (
			<div className="speaker bottom-bar">
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