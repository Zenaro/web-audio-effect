import React, {
	Component
} from 'react';

import '../../style/index/speaker.scss';

export default class SpeakerComponent extends Component {
	constructor(props) {
		super(props);
		this.Recorder = this.props.Recorder;

		this.record = this.record.bind(this);
	}
	restart() {

	}
	finish() {

	}
	record() {
		this.Recorder.init();
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
						onClick={this.record}>
					</a>
				</div>		
			</div>
		);
	}
}