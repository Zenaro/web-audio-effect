import React, {
	Component
} from 'react';

import '../../style/index/speaker.scss';

export default class SpeakerComponent extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="speaker bottom-bar">
				<div className="speaker-core">
					<a href="javascript:void(0)">重唱</a>
					<a href="javascript:void(0)" className="fa fa-microphone btn-speaker"></a>
					<a href="javascript:void(0)">结束</a>
				</div>		
			</div>
		);
	}
}