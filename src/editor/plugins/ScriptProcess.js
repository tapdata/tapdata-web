/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/5/20
 * @description
 */
import {options} from "../lib/rappid/config";
import Script from "../../view/job/Script";

export const scriptProcessConfig = {

	type: 'app.Script',
	shape: {
		extends: 'app.BaseElement',
		defaultInstanceProperties: {
			attrs: {
				root: {
					magnet: true
				},
				image:{
					xlinkHref: 'static/editor/database.svg',
				},
				label:{
					text:'script'
				}
			}
		},
		prototypeProperties: {
			portLabelMarkup: [{
				tagName: 'text',
				selector: 'portLabel'
			}]
		},
		//staticProperties: {}
	},

	styleFormConfig: {
		inputs: {
			attrs: {
				label: {
					text: {
						type: 'content-editable',
						label: 'Text',
						group: 'text',
						index: 1
					},
					fontSize: {
						type: 'range',
						min: 5,
						max: 80,
						unit: 'px',
						label: 'Font size',
						group: 'text',
						when: {ne: {'attrs/label/text': ''}},
						index: 2
					},
					fontFamily: {
						type: 'select-box',
						options: options.fontFamily,
						label: 'Font family',
						group: 'text',
						when: {ne: {'attrs/label/text': ''}},
						index: 3
					},
					fontWeight: {
						type: 'select-box',
						options: options.fontWeight,
						label: 'Font thickness',
						group: 'text',
						when: {ne: {'attrs/label/text': ''}},
						index: 4
					},
					fill: {
						type: 'color-palette',
						options: options.colorPalette,
						label: 'Fill',
						group: 'text',
						when: {ne: {'attrs/label/text': ''}},
						index: 5
					}
				},
				body: {
					fill: {
						type: 'color-palette',
						options: options.colorPalette,
						label: 'Fill',
						group: 'presentation',
						index: 1
					},
					stroke: {
						type: 'color-palette',
						options: options.colorPalette,
						label: 'Outline',
						group: 'presentation',
						index: 2
					},
					strokeWidth: {
						type: 'range',
						min: 0,
						max: 30,
						step: 1,
						defaultValue: 1,
						unit: 'px',
						label: 'Outline thickness',
						group: 'presentation',
						when: {ne: {'attrs/body/stroke': 'transparent'}},
						index: 3
					},
					strokeDasharray: {
						type: 'select-box',
						options: options.strokeStyle,
						label: 'Outline style',
						group: 'presentation',
						when: {
							and: [
								{ne: {'attrs/body/stroke': 'transparent'}},
								{ne: {'attrs/body/strokeWidth': 0}}
							]
						},
						index: 4
					}
				}
			}
		},
		groups: {
			presentation: {
				label: 'Presentation',
				index: 1
			},
			text: {
				label: 'Text',
				index: 2
			}
		}
	},

	/**
	 * 配置显示到左侧图形列表中的图形默认样式
	 * @type {object}
	 */
	stencil: {
		/**
		 * 左侧列表的分组名称，默认有：数据节点:data; 处理节点：processor；标准图形：standard
		 */
		group: 'processor',
		/**
		 * 界面显示的分组名称
		 */
		//groupLabel: '',

		size: {width: 5, height: 3},
		attrs: {
			root: {
				dataTooltip: 'script',
				dataTooltipPosition: 'left',
				dataTooltipPositionSelector: '.joint-stencil'
			},
			body: {
				rx: 2,
				ry: 2,
				stroke: '#fff',
				fill:'#fff',
				strokeWidth: 0,
				strokeDasharray: '0'
			},
			image: {
				xlinkHref: 'static/editor/database.svg',
				refWidth: '60%',
				refHeight: '60%',
				refX: '2%',
				refY: '0%'
			},
			label: {
				text: 'script',
				textAnchor: 'middle',
				fill: '#666',
				fontFamily: 'Roboto Condensed',
				fontWeight: 'Normal',
				fontSize: 10,
				strokeWidth: 0,
				refX: '75%',
				refY: '40%',
				x:-35,
				y:27
			}
		}
	},

	/**
	 * 图形设置表单配置
	 * @type {null}
	 */
	settingFormConfig: {
		component: Script,

		/**
		 * validate user-filled data
		 * @param data
		 *
		 */
		validate: (data) => {
			if( !data.type )
				throw new Error('Script type cannot be empty.');
			if( !data.script )
				throw new Error('Script cannot be empty.');
			return true;
		}
	}

};
