import React, {
	Component
} from 'react';

import '../../style/index/list.scss';

export default class ListComponent extends Component {
	stop(event) {
		event.stopPropagation();
	}
	handleTouch(index) {
		this.props.restart(index);
	}
	render() {
		let className = 'list-component aside ';
		if (this.props.isLayin) {
			className += 'slide-in';
		} else {
			className += 'slide-out';
		}
		return (
			<div className={className} onClick={this.stop}>
				<a href="javascript:void(0)" className="btn-list">
					<i className="icon-list"></i>
				</a>
				<div className="file-control">
					<p>添加音乐文件 + </p>
					<input type="file" mutiple="multiple" onChange={this.props.filesAdd}/>
				</div>
				{this.props.items.length <= 0 &&
					<div className="empty">
						<p>播放列表为空~</p>
						<p>尝试把音乐文件拖拽进来吧</p>
					</div>
				}
				<ul>
					{this.props.items.map((item, index) => {
						return <li key={index} className={this.props.sign === index ? 'active' : ''} onDoubleClick={this.handleTouch.bind(this, index)}>
									<a href="javascript:void(0)">
										{item.title}
									</a>
								</li>
					})}
				</ul>
			</div>
		);
	}
}