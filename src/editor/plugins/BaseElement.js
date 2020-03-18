/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/4/20
 * @description
 */
export const baseElementConfig = {

	/**
	 * the name of the subtype class.
	 *
	 */
	type: 'app.BaseElement',

	/**
	 * define shape
	 * docs see https://github.com/clientIO/joint/blob/master/tutorials/custom-elements.html
	 * @type {object}
	 */
	shape: {
		/**
		 * extends exists shape
		 */
		extends: 'standard.EmbeddedImage',

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
			freeTransform: false,
			size: { width: 130, height: 70 },
			attrs: {
				root: {
					magnet: true
				},
				image: {
					//xlinkHref: 'static/editor/table.svg',
					refWidth: '30%',
					refHeight: '30%',
					refX: '30%',
					refY: '5%'
				},
				body: {
					fill: '#fafafa',
					stroke: '#ccc',
					strokeWidth: 1,
					rx:5,
					ry:5
				},
				label: {
					textVerticalAnchor: 'middle',
					textAnchor: 'middle',
					refX: '75%',
					refY: '40%',
					fontSize: 11,
					fill: '#333333',
					x:-50,
					y:15
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
			portLabelMarkup: [{
				tagName: 'text',
				selector: 'portLabel'
			}],
			getFormData() {
				return this.get('')
			}
		},
		/**
		 * object that contains properties to be assigned on the subtype constructor.
		 */
		//staticProperties: {}
	},

};
