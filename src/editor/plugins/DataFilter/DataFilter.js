/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/5/20
 * @description
 */
import {options} from "../../lib/rappid/config";
import DataFilterAttribute from "./DataFilterAttribute";
// import {FORM_DATA_KEY} from "../../constants";
import i18n from "../../../i18n/i18n";

export const DataFilterConfig = {

	type: 'app.DataFilter',
	shape: {
		extends: 'app.BaseElement',
		defaultInstanceProperties: {
			size:{width:120,height:28},
			attrs: {
				image:{
					xlinkHref: 'static/editor/o-js.svg',
					refWidth: '25%',
					refHeight: '84%',
					refX: '-8%',
					refY: '-28%'
				},
				body: {
					rx:14,
					ry:14
				},
				label:{
					text: i18n.t('editor.cell.processor.dataFilter.name'),
				}
			},

			/*[FORM_DATA_KEY]: {
				name: 'DataFilter',
			}*/
		},
		prototypeProperties: {
			portLabelMarkup: [{
				tagName: 'text',
				selector: 'portLabel'
			}],
			isProcess(){
				return true;
			},

			/**
			 * validate user-filled data
			 * @param data
			 *
			 */
			validate: function(data){
				data = data || this.getFormData();
				let name = this.attr('label/text');
				if( !data )
					throw new Error(`${name}: ${i18n.t('editor.cell.validate.none_setting')}`);
				if( !data.expression )
					throw new Error(`${name}: ${i18n.t('editor.cell.processor.dataFilter.validate.none_expression')}`);
				if( !data.action )
					throw new Error(`${name}: ${i18n.t('editor.cell.processor.dataFilter.validate.none_action')}`);
				return true;
			},

			/**
			 * validate this allow connect to target
			 * @param targetCell
			 * @return {boolean}
			 */
			allowTarget(targetCell) {
				return !['app.Database'].includes(targetCell.get('type'));
			},

			/**
			 * validate accept source connection
			 * @param sourceCell
			 * @return {boolean}
			 */
			allowSource(sourceCell) {
				return !['app.Database'].includes(sourceCell.get('type'));
			}
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
				dataTooltip: i18n.t('editor.cell.processor.dataFilter.tip'),
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
				xlinkHref: 'static/editor/js.svg',
				refWidth: '60%',
				refHeight: '60%',
				refX: '2%',
				refY: '0%'
			},
			label: {
				text: i18n.t('editor.cell.processor.dataFilter.name'),
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
		component: DataFilterAttribute,
	}

};
