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
					<div className="fa fa-microphone btn-speaker"></div>
				</div>		
			</div>
		);
	}
}