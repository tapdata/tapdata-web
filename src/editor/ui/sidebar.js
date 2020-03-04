/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import Component from "../lib/Component";
import $ from 'jquery';
import {EditorEventType} from "../lib/events";
export default class Sidebar extends Component{

	constructor(opts) {
		super(Object.assign({
			region: 'left',
			split: true,
			maxWidth: 400,
			minWidth: 180
		}, opts));

		this.splitEl = null;

		this.init();
	}

	doInit(){
		this.el = $(`<div class="e-sidebar e-sidebar-${this.opts.region}"><div class="e-sidebar-content"></div></div>`);
		this.splitEl = $(`<div class="e-slider e-slider-${this.opts.region}"><!--||--></div>`);

		if( this.opts.split )
			this.enableSplit();
		else
			this.disableSplit();

		if( this.opts.width ){
			this.width(this.opts.width);
		}

	}

	enableSplit(){
		const self = this;

		self.opts.split = true;
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
				let _width = self.opts.region === 'left' ? startWidth + offsetX : startWidth - offsetX;

				if( self.opts.minWidth )
					_width = _width < self.opts.minWidth ? self.opts.minWidth : _width;
				if( self.opts.maxWidth )
					_width = _width > self.opts.maxWidth ? self.opts.maxWidth : _width;

				if( self.el.width() !== _width){

					self.width(_width);
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

	width(w){
		let self = this;
		if( w ){
			let _width = self.el.width();
			let _height = self.el.height();

			self.el.width(w);
			self.emit(EditorEventType.RESIZE, _width, _height, w, _height);
		} else {
			return this.el.width();
		}
	}

	height(h){
		let self = this;
		if( h ){
			let _width = self.el.width();
			let _height = self.el.height();

			self.el.height(h);
			self.emit(EditorEventType.RESIZE, _width, _height, _width, h);
		} else {
			return this.el.width();
		}
	}

	disableSplit(){
		this.opts.split = false;
		this.splitEl.remove();
	}

	getContentEl(){
		return this.el.find('.e-sidebar-content');
	}
}
