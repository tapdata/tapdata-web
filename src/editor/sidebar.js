/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import Component from "./lib/Component";
import $ from 'jquery';
import {EditorEventType} from "./events";
export default class Sidebar extends Component{

	constructor(opts) {
		super(Object.assign({
			region: 'left',
			split: true,
			maxWidth: 400,
			minWidth: 180
		}, opts));

		this.splitEl = null;

		this.minWidth = 180;
		this.maxWidth = 400;

		this.init();
	}

	doInit(){
		this.el = $(`<div class="e-sidebar e-sidebar-${this.region}"><div class="e-sidebar-content"></div></div>`);
		this.splitEl = $(`<div class="e-slider e-slider-${this.region}"><!--||--></div>`);

		if( this.split )
			this.enableSplit();
		else
			this.disableSplit();

	}

	enableSplit(){
		const self = this;

		self.split = true;
		self.el.append(self.splitEl);

		let overlayEl = null;

		self.splitEl.on('mousedown', (e)=> {
			overlayEl = $('<div class="resizable-overlay x-resizable-overlay"></div>');
			$('body').append(overlayEl);

			let startX = e.clientX;
			let startWidth = self.el.width();
			let startHeight = self.el.height();

			let mouseMove = function(e){

				self.splitEl.addClass('active');

				let offsetX = e.clientX - startX;
				let _width = self.region === 'left' ? startWidth + offsetX : startWidth - offsetX;

				if( self.minWidth )
					_width = _width < self.minWidth ? self.minWidth : _width;
				if( self.maxWidth )
					_width = _width > self.maxWidth ? self.maxWidth : _width;

				if( self.el.width() !== _width){

					self.el.width(_width);
					self.emit(EditorEventType.RESIZE, _width, startHeight, startWidth, startHeight, e);

				}
			};
			let mouseUp = function(){
				self.splitEl.removeClass('active');
				if( overlayEl ){
					overlayEl.remove();
				}

				window.removeEventListener('mousemove', mouseMove);
				window.removeEventListener('mouseup', mouseUp);
			};

			window.addEventListener('mousemove', mouseMove);
			window.addEventListener('mouseup', mouseUp);
		});

	}

	disableSplit(){
		this.split = false;
		this.splitEl.remove();
	}

	getContentEl(){
		return this.el.find('.e-sidebar-content');
	}
}
