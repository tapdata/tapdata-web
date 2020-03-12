/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import BaseObject from './BaseObject';
import {EditorEventType} from "./events";
import $ from 'jquery';
export default class Component extends BaseObject{

	constructor(opts){
		super();

		this.opts =  Object.assign( {
			hidden: false
		}, opts || {});

		this.el = null;
		this.childs = [];
	}

	init() {
		this.emit(EditorEventType.BEFORE_INIT, this);
		this.doInit();
		this.emit(EditorEventType.INIT, this);

		if( this.opts.hidden === true) {
			this.hide();
		}
	}

	doInit(){}

	render(container, prepend = false){
		this.emit(EditorEventType.BEFORE_RENDER, this);

		if( prepend ){
			$(container).prepend(this.el);
		} else {
			$(container).append(this.el);
		}
		this.emit(EditorEventType.AFTER_RENDER, this);
	}

	/**
	 * get current component content el
	 * @returns {null}
	 */
	getContentEl(){
		return this.el;
	}

	/**
	 * add child component
	 * @param child
	 */
	add(child){
		this.childs.push(child);
		child.render(this.getContentEl());
	}

	/**
	 * remove child component
	 * @param child
	 */
	remove(child){
		let index = this.childs.indexOf(child);
		if( index !== -1) {
			let current = this.childs.splice(index, 1);
			if( child.el )
				child.el.remove();
			return current;
		}
	}

	/**
	 * remove all child commend
	 */
	removeAll(){
		this.childs.splice(0, this.childs.length);
		if( this.getContentEl() ){
			this.getContentEl().find('>*').remove();
		}
	}

	show(){
		this.el.show();
		this.opts.hidden = false;
		this.emit(EditorEventType.SHOW);
	}

	hide() {
		this.el.hide();
		this.opts.hidden = true;
		this.emit(EditorEventType.HIDE);
	}

	getChildByName(name){
		for (let i = 0; i < this.childs.length; i++) {
			if( this.childs[i].opts && this.childs[i].opts.name === name)
				return this.childs[i];
		}
		return null;
	}

}
