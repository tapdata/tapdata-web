/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/4/20
 * @description
 */
import _ from "lodash";
import { stencilConfig, inspectorConfig } from "../lib/rappid/config";
import { vueAdapter } from "../vue-adapter";
import joint from "../lib/rappid/rappid";
import * as plugins from "./index";

export const loadPlugins = function() {
	const defineShape = (type, shape) => {
		if (!shape) {
			return;
		}

		let shapeType = type;

		let parentObj = _.get(joint.shapes, shape.extends);

		if (
			parentObj &&
			parentObj.define &&
			typeof parentObj.define === "function"
		) {
			let args = [shapeType];
			if (shape.defaultInstanceProperties)
				args.push(shape.defaultInstanceProperties);
			if (shape.prototypeProperties) {
				args.push(shape.prototypeProperties);
				let initialize = shape.prototypeProperties.initialize;
				if (typeof initialize === "function") {
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
	const addStencil = (type, stencil) => {
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
		if (
			stencil &&
			stencil.attrs &&
			stencil.attrs.label &&
			stencil.attrs.label.text
		) {
			stencil.attrs.label.text = joint.util.breakText(
				stencil.attrs.label.text,
				{ width: 60, height: 40 },
				{ "font-size": 12 },
				{ ellipsis: true }
			);
		}

		let replace = false;
		for (let i = 0; i < stencilConfig.shapes[group].length; i++) {
			if (stencilConfig.shapes[group][i].type === type) {
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
		if (name !== "loadPlugins" && typeof plugins[name] === "object") {
			let plugin = _.cloneDeep(plugins[name]);

			if (plugin.shape && !plugin.shape.extends) {
				throw Error(
					`Plugin ${name}.shape mast be extends exists shape.`
				);
			}

			if (plugin.stencil && !plugin.stencil.group) {
				throw Error(
					`Plugin ${name}.stencil is missing group configuration.`
				);
			}

			let type = plugin.type;

			defineShape(type, plugin.shape);
			addInspector(type, plugin.styleFormConfig);
			addStencil(type, plugin.stencil);
			addSettingForm(type, plugin.settingFormConfig);
		}
	});
};
