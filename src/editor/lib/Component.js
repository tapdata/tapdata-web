/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import BaseObject from './BaseObject';
import {EditorEventType} from "../events";
import $ from 'jquery';
export default class Component extends BaseObject{

	constructor(opts){
		super();

		opts = this.opts = opts || {};

		if( opts.parent) {
			this.parent = opts.parent;
		}

		this.el = null;
	}

	init() {
		this.emit(EditorEventType.BEFORE_INIT, this);
		this.doInit();
		this.emit(EditorEventType.INIT, this);
	}

	doInit(){}

	getContainer(selector){
		if( this.container ) {
			return this.container;
		}
		if( this.parent && selector){
			return this.parent.el.find(selector);
		}
	}

	render(container, prepend = false){
		this.emit(EditorEventType.BEFORE_RENDER, this);

		if( ['string', 'undefined'].indexOf(typeof container) !== -1 )
			container = this.getContainer(container);

		if( prepend ){
			$(container).prepend(this.el);
		} else {
			$(container).append(this.el);
		}
		this.emit(EditorEventType.AFTER_RENDER, this);
	}

}
