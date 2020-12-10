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
import { FORM_DATA_KEY } from '../constants';

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
			if (stencilConfig.shapes[group][i].type === type && type !== 'app.Database') {
				stencilConfig.shapes[group][i] = stencil;
				replace = true;
				break;
			}
			if (
				type === 'app.Database' &&
				stencilConfig.shapes[group][i][FORM_DATA_KEY].database_type === formData.database_type
			) {
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

			defineShape(type, plugin.shape);
			addInspector(type, plugin.styleFormConfig);
			addSettingForm(type, plugin.settingFormConfig);

			if (type === 'app.Database') {
				let addData = {
					mysql: {
						name: 'MySQL',
						type: 'mysql',
						shapeImage: 'static/editor/o-mysql.svg',
						stencilImage: 'static/editor/mysql.svg'
					},
					oracle: {
						type: 'oracle',
						name: 'Oracle',
						shapeImage: 'static/editor/o-ora.svg',
						stencilImage: 'static/editor/ora2.svg'
					},
					mongo: {
						type: 'mongodb',
						name: 'MongoDB',
						shapeImage: 'static/editor/o-mongo.svg',
						stencilImage: 'static/editor/mongo.svg'
					},
					db2: {
						type: 'db2',
						name: 'DB2',
						shapeImage: 'static/editor/o-db2.svg',
						stencilImage: 'static/editor/DB2.svg'
					},
					pg: {
						type: 'postgres',
						name: 'Postgres',
						shapeImage: 'static/editor/o-pg.svg',
						stencilImage: 'static/editor/pg.svg'
					},
					sqlserver: {
						type: 'sqlserver',
						name: 'SQL Server',
						shapeImage: 'static/editor/o-sqlserver.svg',
						stencilImage: 'static/editor/sqlserver.svg'
					},
					gbase: {
						type: 'gbase-8s',
						name: 'GBase 8s',
						shapeImage: 'static/editor/o-gbase.svg',
						stencilImage: 'static/editor/gbase.svg'
					},
					sybase: {
						type: 'sybase ase',
						name: 'Sybase ASE',
						shapeImage: 'static/editor/o-sybase.svg',
						stencilImage: 'static/editor/sybase.svg'
					}
				};
				Object.keys(addData).forEach(database => {
					let cell = _.cloneDeep(addData[database]);
					let plugin = _.cloneDeep(plugins[name]);
					plugin.stencil['group'] = 'data';
					plugin.stencil['subType'] = cell.type;
					plugin.stencil['attrs']['image']['xlinkHref'] = cell.stencilImage;
					plugin.stencil['attrs']['label']['text'] = cell.name;
					plugin.stencil['attrs']['root']['dataTooltip'] = cell.name;

					addStencil(type, plugin.stencil, {
						database_type: cell.type,
						shapeImage: cell.shapeImage,
						name: cell.name
					});
				});
			} else if (type === 'app.TemplateProcess') {
				cNodes.forEach(config => {
					let nodeConfig = config.nodeConfig;
					plugin.stencil['attrs']['image']['xlinkHref'] = nodeConfig.stencilImage;
					plugin.stencil['attrs']['label']['text'] = nodeConfig.name;
					plugin.stencil['attrs']['root']['dataTooltip'] = nodeConfig.name;
					addStencil(type, plugin.stencil, null, config);
				});
			} else {
				addStencil(type, plugin.stencil);
			}
		}
	});
};
