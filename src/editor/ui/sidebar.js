/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import Component from '../lib/Component';
import $ from 'jquery';
import { EditorEventType } from '../lib/events';
export default class Sidebar extends Component {
	constructor(opts) {
		super(
			Object.assign(
				{
					region: 'left',
					split: true,
					maxWidth: 400,
					minWidth: 180,
					maxHeight: 400,
					minHeight: 180
				},
				opts
			)
		);

		this.splitEl = null;

		this.init();
	}

	doInit() {
		this.el = $(
			`<div class="e-sidebar e-sidebar-${
				this.opts.region
			}" tabindex="-1"><div class="e-sidebar-content" style="${this.opts.bodyStyle || ''}"></div></div>`
		);
		this.splitEl = $(`<div class="e-slider e-slider-${this.opts.region}"><!--||--></div>`);

		if (this.opts.split) this.enableSplit();
		else this.disableSplit();

		if (this.opts.width) {
			this.width(this.opts.width);
		}
		if (this.opts.height) {
			this.height(this.opts.height);
		}
	}

	enableSplit() {
		const self = this;

		self.opts.split = true;
		self.el.append(self.splitEl);

		let overlayEl = null;
		let region = self.opts.region;

		self.splitEl.on('mousedown', e => {
			overlayEl = $(
				`<div class="resizable-overlay ${
					['top', 'bottom'].includes(region) ? 'y' : 'x'
				}-resizable-overlay"></div>`
			);
			$('body').append(overlayEl);

			let startX = e.clientX;
			let startY = e.clientY;
			let startWidth = self.el.width();
			let startHeight = self.el.height();

			let mouseMove = function(e) {
				self.splitEl.addClass('active');

				let offsetX = e.clientX - startX;
				let offsetY = e.clientY - startY;
				let _width = region === 'left' ? startWidth + offsetX : startWidth - offsetX;
				let _height = region === 'top' ? startHeight + offsetY : startHeight - offsetY;

				if (self.opts.minWidth) _width = _width < self.opts.minWidth ? self.opts.minWidth : _width;
				if (self.opts.maxWidth) _width = _width > self.opts.maxWidth ? self.opts.maxWidth : _width;

				if (self.opts.minHeight) _height = _height < self.opts.minHeight ? self.opts.minHeight : _height;
				if (self.opts.minHeight) _height = _height > self.opts.maxHeight ? self.opts.maxHeight : _height;

				if (region === 'left' || region === 'right') {
					if (self.el.width() !== _width) {
						self.width(_width);
						self.emit(EditorEventType.RESIZE, _width, startHeight, startWidth, startHeight, e);
					}
				} else if (region === 'bottom' || region === 'top') {
					if (self.el.height() !== _height) {
						self.height(_height);
						self.emit(EditorEventType.RESIZE, startWidth, _height, startWidth, startHeight, e);
					}
				}
			};
			let mouseUp = function() {
				self.splitEl.removeClass('active');
				if (overlayEl) {
					overlayEl.remove();
				}

				window.removeEventListener('mousemove', mouseMove);
				window.removeEventListener('mouseup', mouseUp);
			};

			window.addEventListener('mousemove', mouseMove);
			window.addEventListener('mouseup', mouseUp);
		});
	}

	width(w) {
		let self = this;
		if (w) {
			let _width = self.el.width();
			let _height = self.el.height();

			self.el.width(w);
			self.emit(EditorEventType.RESIZE, _width, _height, w, _height);
		} else {
			return this.el.width();
		}
	}

	height(h) {
		let self = this;
		if (h) {
			let _width = self.el.width();
			let _height = self.el.height();

			self.el.height(h);
			self.emit(EditorEventType.RESIZE, _width, _height, _width, h);
		} else {
			return this.el.width();
		}
	}

	disableSplit() {
		this.opts.split = false;
		this.splitEl.remove();
	}

	getContentEl() {
		return this.el.find('.e-sidebar-content');
	}
}
