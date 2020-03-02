/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/2/20
 * @description
 */
import Vue from 'vue';
import SourceDB from '../view/job/SourceDB';
import TargetDB from '../view/job/TargetDB';
import Link from '../view/job/Link';

export const formConfig = {
	'app.SourceDB': SourceDB,
	'app.TargetDB': TargetDB,
	'app.Link': Link,
};

export const render = function(containerEl, name, data, callback){
	if( formConfig[name] ){
		let vueComponentConfig = formConfig[name];
		let vm = new Vue({
			el: containerEl,
			components: { CustomComponent: vueComponentConfig },
			template: '<CustomComponent ref="customComponent"/>'
		});

		if( data ) {
			if( typeof vm.$refs.customComponent.setData === "function"){
				vm.$refs.customComponent.setData(data);
			} else {
				throw new Error(`Custom form component does not implement "${name}" method`);
			}
		}
		vm.$refs.customComponent.$on('dataChanged', callback);

		return vm;

	}
};
