import React, {
	Component
} from 'react';
import '../../style/index/effect.scss';

export default class EffectComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			index: 0,
			// isAsideEffect: true,
			ProWidth: 190, // 进度条长度 
			lowpassHz: 800, // 默认800Hz
			highpassHz: 800, // 默认800Hz
			maxHz: 3600, // 最大Hz
			isDropdownLowpass: false,
			isDropdownHighpass: false
		}
		this.AudioCtx = this.props.AudioCtx;
		// this.switchEffect = this.switchEffect.bind(this);
		this.reset = this.reset.bind(this);
		this.cancelEffect = this.cancelEffect.bind(this);
		this.stereo = this.stereo.bind(this);
		this.lowpassDropdown = this.lowpassDropdown.bind(this);
		this.lowpassFilter = this.lowpassFilter.bind(this);
		this.highpassDropdown = this.highpassDropdown.bind(this);
		this.highpassFilter = this.highpassFilter.bind(this);
		this.removeVocal = this.removeVocal.bind(this);
		this.enhanceVocal = this.enhanceVocal.bind(this);
		// this.lowshelfEnhance = this.lowshelfEnhance.bind(this);
		// this.lowshelfWeaken = this.lowshelfWeaken.bind(this);
		this.waveShaper = this.waveShaper.bind(this);
		this.compressor = this.compressor.bind(this);
		this.convolver = this.convolver.bind(this);
		this.delay = this.delay.bind(this);
		this.splitterMerger = this.splitterMerger.bind(this);
	}
	componentDidMount() {

	}
	stop(event) {
		event.stopPropagation();
		// event.nativeEvent.stopImmediatePropagation();
	}
	switchEffect() {
		// this.setState((prevState) => ({
		// 	isAsideEffect: !prevState.isAsideEffect
		// }));
	}
	reset() {
		this.setState({
			isDropdownLowpass: false,
			isDropdownHighpass: false
		});
	}
	cancelEffect() {
		this.AudioCtx.cancelEffect();
		this.setState({
			index: 0
		});
	}
	stereo() {
		this.AudioCtx.stereo();
		this.setState({
			index: 1
		});
	}
	lowpassDropdown() {
		if (!this.state.isDropdownLowpass) {
			this.AudioCtx.lowpassFilter(this.state.lowpassHz);
		}
		this.setState((prevState) => ({
			index: 2,
			isDropdownLowpass: !prevState.isDropdownLowpass,
			isDropdownHighpass: false
		}));
	}
	lowpassFilter(event) {
		let pct = event.nativeEvent.offsetX / this.state.ProWidth;
		let Hz = ~~(pct * this.state.maxHz);
		this.setState({
			lowpassHz: Hz
		});
		this.AudioCtx.lowpassFilter(Hz);
	}
	highpassDropdown() {
		if (!this.state.isDropdownHighpass) {
			this.AudioCtx.highpassFilter(this.state.highpassHz);
		}
		this.setState((prevState) => ({
			index: 3,
			isDropdownHighpass: !prevState.isDropdownHighpass,
			isDropdownLowpass: false
		}));
	}
	highpassFilter(event) {
		let pct = event.nativeEvent.offsetX / this.state.ProWidth;
		let Hz = ~~(pct * this.state.maxHz);
		this.setState({
			highpassHz: Hz
		});
		this.AudioCtx.highpassFilter(Hz);
	}
	enhanceVocal() {
		this.setState({
			index: 4
		});
		this.AudioCtx.enhanceVocal();
	}
	removeVocal() {
		this.setState({
			index: 5
		});
		this.AudioCtx.removeVocal();
	}
	waveShaper() {
		this.setState({
			index: 6
		});
		this.AudioCtx.waveShaper();
	}
	compressor() {
		this.setState({
			index: 7
		});
		this.AudioCtx.compressor();
	}
	convolver() {
		this.setState({
			index: 8
		});
		this.AudioCtx.convolver();
	}
	delay() {
		this.setState({
			index: 9
		});
		this.AudioCtx.delay();
	}
	splitterMerger() {
		this.setState({
			index: 10
		});
		this.AudioCtx.splitterMerger();
	}
	render() {
		let className = 'effect-component aside ';
		this.props.isLayin ?
			className += 'slide-in' :
			className += 'slide-out';
		return (
			<div className={className} onClick={this.stop}>
				<a href="javascript:void(0)" className="btn-func">
					<i className="icon-effect">❔</i>
				</a>
				<ul className="btn-group" onClick={this.reset}>
					<li className={this.state.index===0 ? 'active' : ''}>
						<a href="javascript:void(0);" onClick={this.cancelEffect}>原声</a>
					</li>
					<li className={this.state.index===1 ? 'active' : ''}>
						<a href="javascript:void(0);" onClick={this.stereo}>空间环绕声</a>
					</li>
					<li className={this.state.index===2 ? 'active' : ''} onClick={this.stop}>
						<a href="javascript:void(0)" onClick={this.lowpassDropdown}>低通滤波（<span>{this.state.lowpassHz}</span>Hz）</a>
						<div className={this.state.isDropdownLowpass ? 'dropdown show' : 'dropdown'} onClick={this.lowpassFilter}>
							<div className="progress">
								<div className="progress-bar" style={{width: this.state.lowpassHz / this.state.maxHz * 100 + '%'}}></div>
							</div>
						</div>
					</li>
					<li className={this.state.index===3 ? 'active' : ''} onClick={this.stop}>
						<a href="javascript:void(0)" onClick={this.highpassDropdown}>高通滤波（<span>{this.state.highpassHz}</span>Hz）</a>
						<div className={this.state.isDropdownHighpass ? 'dropdown show' : 'dropdown'} onClick={this.highpassFilter}>
							<div className="progress progress-nega">
								<div className="progress-bar" style={{width: this.state.highpassHz / this.state.maxHz * 100 + '%'}}></div>
							</div>
						</div>
					</li>
					<li className={this.state.index===4 ? 'active' : ''}>
						<a href="javascript:void(0)" onClick={this.enhanceVocal}>人声增益</a>
					</li>
					<li className={this.state.index==5 ? 'active' : ''}>
						<a href="javascript:void(0);" onClick={this.removeVocal}>人声消除</a>
					</li>
					<li className={this.state.index===6 ? 'active' : ''}>
						<a href="javascript:void(0);" onClick={this.waveShaper}>波形修改（温暖效果）</a>
					</li>
					<li className={this.state.index===7 ? 'active' : ''}>
						<a href="javascript:void(0);" onClick={this.compressor}>压缩高分贝（补偿失真）</a>
					</li>
					<li className={this.state.index===8 ? 'active' : ''}>
						<a href="javascript:void(0);" onClick={this.convolver}>convolver</a>
					</li>
					<li className={this.state.index===9 ? 'active' : ''}>
						<a href="javascript:void(0);" onClick={this.delay}>delay 礼堂回声</a>
					</li>
					<li className={this.state.index===10 ? 'active' : ''}>
						<a href="javascript:void(0);" onClick={this.splitterMerger}>splitter混响</a>
					</li>
				</ul>
			</div>
		);
	}
}