import React, {
	Component
} from 'react';

import '../../style/index/list.scss';

export default class ListComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isAsideList: false
		};
		// this.handleTouch = this.handleTouch.bind(this);
	}
	componentDidMount() {
		this.setState({
			isAsideList: true
		});
	}
	switchList() {
		this.setState((prevState) => ({
			isAsideList: prevState.isAsideList
		}));
	}
	handleTouch(index) {
		// this.props.restart(index);
		// console.log(index);
		// console.log('2');
	}
	render() {
		return (
			<div className={this.state.isAsideList ? 'list-component aside slide-in' : 'list-component aside slide-out'}>
				<a href="javascript:void(0)" className="btn-list" onClick={this.switchList}>
					<i className="icon-list"></i>
				</a>
				<ul>
					{this.props.items.map((item, index) => {
						return <li key={index} className={this.props.sign === index ? 'active' : ''} onClick={this.handleTouch(index)}>
									<a href="javascript:void(0)">
										{item.title}
									</a>
								</li>
					})}
				</ul>
				{this.props.items.length <= 0 &&
					<div className="empty">
						<p>播放列表为空~</p>
						<p>尝试把音乐文件拖拽进来吧</p>
					</div>
				}
			</div>
		);
	}
}