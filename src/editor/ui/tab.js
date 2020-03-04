/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/1/20
 * @description
 */
import Component from "../lib/Component";
import $ from 'jquery';

export default class Tab extends Component{

	constructor(opts) {
		super(opts);

		this.init();
	}

	doInit() {
		this.el = $(`
		<div class="e-tab-panel">
			<div class="e-tab-bar"></div>
			<div class="e-tab-content"></div>
		</div>
		`);
	}

	__id = 1;
	generatorId(){
		return this.__id++;
	}

	add(tab){
		let self = this;
		self.childs.push(tab);

		tab.id = self.generatorId();

		let titleEl = $(`<div class="e-tab-title">${tab.title || tab.opts.title}</div>`);
		let tabEl = $(`<div class="e-tab"></div>`);

		titleEl.attr('data-target', `${tab.id}`);
		tabEl.attr('data-value', `${tab.id}`);

		self.el.find('.e-tab-bar').append(titleEl);
		self.el.find('.e-tab-content').append(tabEl);
		tabEl.append(tab.el);

		titleEl.on('click', () => {
			self.select(tab);
		});

		if( self.childs.length === 1 ){
			self.select(tab);
		}
	}

	select(tab){
		this.el.find('.active').removeClass('active');
		let id = tab.id ? tab.id : tab.target ? $(tab.target).data('target') : '';
		if( id ){
			this.el.find(`>.e-tab-bar>.e-tab-title[data-target=${id}]`).addClass('active');
			this.el.find(`>.e-tab-content>.e-tab[data-value=${id}]`).addClass('active');
		}

	}

	remove(child) {
		super.remove(child);
		let id = child.id ;
		if( id ){
			this.el.find(`>.e-tab-bar>.e-tab-title[data-target=${id}]`).remove();
			this.el.find(`>.e-tab-content>.e-tab[data-value=${id}]`).remove();
		}
	}

	removeAll() {
		super.removeAll();
		this.el.find(`>.e-tab-bar>.e-tab-title`).remove();
		this.el.find(`>.e-tab-content>.e-tab`).remove();
	}

	getContentEl() {
		return this.el.find('>.e-tab-content');
	}


}
