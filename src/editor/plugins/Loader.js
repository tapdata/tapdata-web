/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/4/20
 * @description
 */
import _ from 'lodash';
import { stencilConfig, inspectorConfig } from '../lib/rappid/config';
import { vueAdapter } from '../vue-adapter';
import joint from '../lib/rappid/rappid';
import * as plugins from './index';
import { FORM_DATA_KEY, DATABASE_TYPE_MAPPING, FILE_TYPE_MAPPING } from '../constants';

export const loadPlugins = function(cNodes) {
	const defineShape = (type, shape) => {
		if (!shape) {
			return;
		}
		let shapeType = type;

		let parentObj = _.get(joint.shapes, shape.extends);

		if (parentObj && parentObj.define && typeof parentObj.define === 'function') {
			let args = [shapeType];
			if (shape.defaultInstanceProperties) args.push(shape.defaultInstanceProperties);
			if (shape.prototypeProperties) {
				args.push(shape.prototypeProperties);
				let initialize = shape.prototypeProperties.initialize;
				if (typeof initialize === 'function') {
					shape.prototypeProperties.initialize = function() {
						parentObj.prototype.initialize.apply(this, arguments);
						initialize.apply(this, arguments);
					};
				}
			}
			if (shape.staticProperties) args.push(shape.staticProperties);

			parentObj.define.apply(parentObj, args);
		}
	};
	const addInspector = (type, config) => {
		if (!config) return;
		inspectorConfig[type] = config;
	};
	const addStencil = (type, stencil, formData, config) => {
		if (!stencil) return;
		let group = stencil.group;
		if (!stencilConfig.groups[group]) {
			let maxIdx = 1;
			Object.values(stencilConfig.groups).forEach(g => {
				if (maxIdx < g.index) maxIdx = g.index;
			});
			stencilConfig.groups[group] = {
				index: maxIdx + 1,
				label: stencil.groupLabel
			};
		}
		if (!stencilConfig.shapes[group]) {
			stencilConfig.shapes[group] = [];
		}
		delete stencil.group;
		delete stencil.groupLabel;
		stencil.type = type;
		if (stencil && stencil.attrs && stencil.attrs.label && stencil.attrs.label.text) {
			stencil.attrs.label.text = joint.util.breakText(
				stencil.attrs.label.text,
				{ width: 60, height: 40 },
				{ 'font-size': 12 },
				{ ellipsis: true }
			);
		}
		if (config) {
			stencil['config'] = config;
		}
		if (formData) {
			stencil[FORM_DATA_KEY] = formData;
		}
		if (!stencil[FORM_DATA_KEY]) {
			stencil[FORM_DATA_KEY] = {};
		}

		let replace = false;
		for (let i = 0; i < stencilConfig.shapes[group].length; i++) {
			// if (stencilConfig.shapes[group][i].type === type) {
			if (stencilConfig.shapes[group][i].attrs.label.text === stencil.attrs.label.text) {
				stencilConfig.shapes[group][i] = stencil;
				replace = true;
				break;
			}
		}

		if (!replace) stencilConfig.shapes[group].push(stencil);
	};
	const addSettingForm = (type, config) => {
		if (config && config.component) {
			vueAdapter[type] = config;
		}
	};
	let map = {
		'app.Dummy': 'dummy db',
		'app.GridFSNode': 'gridfs',
		'app.CustomNode': 'custom_connection',
		'app.ESNode': 'elasticsearch',
		'app.FileNode': 'file',
		'app.MemCache': 'mem_cache',
		'app.Redis': 'redis',
		'app.ApiNode': 'rest api'
	};
	Object.keys(plugins).forEach(name => {
		if (name !== 'loadPlugins' && typeof plugins[name] === 'object') {
			let plugin = _.cloneDeep(plugins[name]);

			if (plugin.shape && !plugin.shape.extends) {
				throw Error(`Plugin ${name}.shape mast be extends exists shape.`);
			}

			if (plugin.stencil && !plugin.stencil.group) {
				throw Error(`Plugin ${name}.stencil is missing group configuration.`);
			}

			let type = plugin.type;
			if (!map[type] || window.getSettingByKey('ALLOW_CONNECTION_TYPE').includes(map[type])) {
				defineShape(type, plugin.shape);
				addInspector(type, plugin.styleFormConfig);
				addSettingForm(type, plugin.settingFormConfig);

				if (type === 'app.Database' || type === 'app.FileFormBuilder') {
					let addData = type === 'app.Database' ? DATABASE_TYPE_MAPPING : FILE_TYPE_MAPPING;
					Object.keys(addData).forEach(key => {
						let database = addData[key];
						if (
							window.getSettingByKey('ALLOW_CONNECTION_TYPE').includes(database.type) ||
							type === 'app.FileFormBuilder'
						) {
							let cell = _.cloneDeep(database);
							let plugin = _.cloneDeep(plugins[name]);
							plugin.stencil['group'] = 'data';
							plugin.stencil['subType'] = cell.type;
							plugin.stencil['attrs']['image']['xlinkHref'] = cell.stencilImage;
							plugin.stencil['attrs']['label']['text'] = cell.name;
							plugin.stencil['attrs']['root']['dataTooltip'] = cell.name;
							let formData = {
								database_type: cell.type,
								shapeImage: cell.shapeImage,
								name: cell.name
							};
							if (type === 'app.FileFormBuilder') {
								formData['type'] = cell.type;
							}
							addStencil(type, plugin.stencil, formData);
						}
					});
				} else if (type === 'app.CustomProcessor') {
					cNodes.forEach(config => {
						let plugin = _.cloneDeep(plugins[name]);
						let nodeConfig = config.nodeConfig;
						config.nodeConfig.shapeImage = 'static/editor/o-table-processor.svg';
						// plugin.stencil['attrs']['image']['xlinkHref'] = nodeConfig.stencilImage;
						plugin.stencil['attrs']['image']['xlinkHref'] = 'static/editor/table-processor.svg';
						plugin.stencil['attrs']['label']['text'] = nodeConfig.name;
						plugin.stencil['attrs']['root']['dataTooltip'] = nodeConfig.tips;
						addStencil(
							type,
							plugin.stencil,
							{
								name: nodeConfig.name,
								type: 'custom_processor'
							},
							config
						);
					});
				} else {
					addStencil(type, plugin.stencil);
				}
			}
		}
	});
};
