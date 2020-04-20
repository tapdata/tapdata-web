/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/4/20
 * @description
 */
import _ from 'lodash';
import joint from '../../lib/rappid/rappid';
import {options} from "../../lib/rappid/config";
import LinkAttribute from "./LinkAttribute";
import {FORM_DATA_KEY} from "../../constants";
import log from "../../../log";
import i18n from "../../../i18n/i18n";

export const link = {

	/**
	 * the name of the subtype class.
	 *
	 */
	type: 'app.Link',

	/**
	 * define shape
	 * docs see https://github.com/clientIO/joint/blob/master/tutorials/custom-elements.html
	 * @type {object}
	 */
	shape: {
		/**
		 * extends exists shape
		 */
		extends: 'standard.Link',

		/**
		 * object that contains properties to be assigned to every constructed instance of the subtype.
		 *
		 * @example <pre>
		 *     {
		 *        attrs: {
		 *           body: {
		 *              refWidth: '100%',
		 *              refHeight: '100%',
		 *              strokeWidth: 2,
		 *              stroke: '#000000',
		 *              fill: '#FFFFFF'
		 *           },
		 *           label: {
		 *              textVerticalAnchor: 'middle',
		 *              textAnchor: 'middle',
		 *              refX: '50%',
		 *              refY: '50%',
		 *              fontSize: 14,
		 *              fill: '#333333'
		 *           }
		 *        }
		 *     }
		 * </pre>
		 */
		defaultInstanceProperties: {
			router: {
				name: 'manhattan',
				//name: 'normal',
			},
			connector: {
				name: 'rounded'
			},
			labels: [],
			attrs: {
				line: {
					stroke: '#8f8f8f',
					strokeDasharray: '0',
					strokeWidth: 2,
					fill: 'none',
					sourceMarker: {
						type: 'path',
						d: 'M 0 0 0 0',
						stroke: 'none'
					},
					targetMarker: {
						type: 'path',
						d: 'M 0 -5 -10 0 0 5 z',
						stroke: 'none'
					}
				}
			}
		},
		/**
		 * object that contains properties to be assigned on the subtype prototype.
		 * Intended for properties intrinsic to the subtype, not usually modified.
		 *
		 * @example <pre>
		 *
		 * {
		 *     markup: [{
		 *          tagName: 'rect',
		 *          selector: 'body',
		 *     }, {
		 *          tagName: 'text',
		 *          selector: 'label'
		 *     }]
		 * }
		 *
		 * </pre>
		 */
		prototypeProperties: {
			defaultLabel: {
				attrs: {
					rect: {
						fill: '#ffffff',
						stroke: '#8f8f8f',
						strokeWidth: 1,
						refWidth: 10,
						refHeight: 10,
						refX: -5,
						refY: -5
					}
				}
			},
			initialize() {
				let self = this;
				self.on('change:' + FORM_DATA_KEY, () => {
					let formData = self.getFormData();

					log('Link.form_data.change', formData);

					if( formData && formData.label ){
						self.labels([{
							attrs: {
								text: {
									text: formData.label
								}
							},
							position: {
								offset: {
									x: 0, y: 0
								},
								distance: 0.5
							}
						}]);
					} else {
						self.labels([]);
					}
				});
			},
			getFormData() {
				return this.get(FORM_DATA_KEY);
			},

			setFormData(data) {
				this.set(FORM_DATA_KEY, data);
			},

			getMarkerWidth: function(type) {
				let d = (type === 'source') ? this.attr('line/sourceMarker/d') : this.attr('line/targetMarker/d');
				return this.getDataWidth(d);
			},

			getDataWidth: _.memoize(function(d) {
				return (new joint.g.Path(d)).bbox().width;
			}),

			showSettings(){
				return true;
			},

			configJoinTable(){
				let targetId = this.target().id;
				if( !targetId) return false;
				let targetCell = this.getTargetCell();
				return targetCell && targetCell.isDataNode && targetCell.isDataNode() && ['app.Table', 'app.Collection'].includes(targetCell.get('type'));
			},

			/**
			 * validate user-filled data
			 * @param data
			 *
			 */
			validate: function(data){
				data = data || this.getFormData();
				log(`Link.validate`, data);

				let configJoinTable = this.configJoinTable();

				if( data && configJoinTable ){
					let joinTable = data.joinTable;
					if( !joinTable )
						throw new Error(`${i18n.t('editor.cell.validate.none_setting')}`);
					/*if( !joinTable.tableName)
						throw new Error('Table name cannot be empty.');
					if( !joinTable.primaryKeys)
						throw new Error(`Table ${joinTable.tableName} primary key cannot be empty.`);*/
					if( !joinTable.joinType )
						throw new Error('JoinType cannot be empty.');

					if( 'append' !== joinTable.joinType) {
						if( !joinTable.joinKeys || joinTable.joinKeys.length === 0 )
							throw new Error(`${i18n.t('editor.cell.link.none_join_key')}`);
						let errorJoinKeys = joinTable.joinKeys.filter(v => !v.source || !v.target);
						if( errorJoinKeys && errorJoinKeys.length > 0) {
							throw new Error(`${i18n.t('editor.cell.link.none_join_key')}`);
						}
					}
					/*if( ['merge_embed', 'update'].includes(joinTable.joinType) ) {
						if( !joinTable.joinPath )
							throw new Error(`${i18n.t('editor.cell.link.none_join_path')}`);
					}*/
				}
				return true;
			}

		},
		/**
		 * object that contains properties to be assigned on the subtype constructor.
		 */
		staticProperties: {

			connectionPoint: function(line, view, magnet, opt, type, linkView) {
				let markerWidth = linkView.model.getMarkerWidth(type);
				opt = { offset: markerWidth, stroke: true };
				// connection point for UML shapes lies on the root group containg all the shapes components
				let modelType = view.model.get('type');
				if (modelType.indexOf('uml') === 0) opt.selector = 'root';
				// taking the border stroke-width into account
				if (modelType === 'standard.InscribedImage') opt.selector = 'border';
				return joint.connectionPoints.boundary.call(this, line, view, magnet, opt, type, linkView);
			}
		}
	},

	/**
	 * 图形(Element子类
	 * )样式表单配置
	 * @type {object}
	 */
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
	 * 图形设置表单配置
	 * @type {null}
	 */
	settingFormConfig: {
		component: LinkAttribute
	}

};
