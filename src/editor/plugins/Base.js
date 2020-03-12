/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/4/20
 * @description
 */
import _ from 'lodash';
import {stencilConfig, inspectorConfig} from "../lib/rappid/config";
import {vueAdapter} from '../vue-adapter';
import joint from '../lib/rappid/rappid';
import * as plugins from './index';

export const loadPlugins = function(){

	const
		defineShape = (type, shape) => {
			if( !shape ){
				return;
			}

			let shapeType = type;

			let parentObj = _.get(joint.shapes, shape.extends);

			if( parentObj && parentObj.define && typeof parentObj.define === 'function'){
				let args = [shapeType];
				if( shape.defaultInstanceProperties )
					args.push(shape.defaultInstanceProperties);
				if( shape.prototypeProperties )
					args.push(shape.prototypeProperties);
				if( shape.staticProperties)
					args.push(shape.staticProperties);

				parentObj.define.apply(parentObj, args);
			}
		},

		addInspector = (type, config) => {
			if( !config )
				return;
			inspectorConfig[type] = config;
		},

		addStencil = (type, stencil) => {
			if( !stencil )
				return;
			let group = stencil.group;
			if( !stencilConfig.groups[group] ) {
				let maxIdx = 1;
				Object.values(stencilConfig.groups).forEach(g => {
					if( maxIdx < g.index)
						maxIdx = g.index;
				});
				stencilConfig.groups[group] = {
					index: maxIdx+1,
					label: stencil.groupLabel
				};
			}
			if(!stencilConfig.shapes[group]) {
				stencilConfig.shapes[group] = [];
			}
			delete stencil.group;
			delete stencil.groupLabel;
			stencil.type = type;

			let replace = false;
			for( let i = 0; i < stencilConfig.shapes[group].length; i++ ) {
				if( stencilConfig.shapes[group][i].type === type ){
					stencilConfig.shapes[group][i] = stencil;
					replace = true;
					break;
				}
			}

			if( !replace )
				stencilConfig.shapes[group].push(stencil);
		},

		addSettingForm = (type, config) => {
			if( vueAdapter && config.component){
				vueAdapter[type] = config;
			}
		};


	Object.keys(plugins).forEach(name => {
		if( name !== 'loadPlugins' ) {
			let plugin = _.cloneDeep(plugins[name]);

			if( plugin.shape && !plugin.shape.extends ){
				throw Error(`Plugin ${name}.shape mast be extends exists shape.`);
			}

			if( plugin.stencil && !plugin.stencil.group ){
				throw Error(`Plugin ${name}.stencil is missing group configuration.`);
			}

			let type = plugin.type;

			defineShape(type, plugin.shape);
			addInspector(type, plugin.styleFormConfig);
			addStencil(type, plugin.stencil);
			addSettingForm(type, plugin.settingFormConfig);

		}
	});

};
