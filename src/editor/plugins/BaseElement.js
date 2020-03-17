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
			size: { width: 200, height: 40 },
			attrs: {
				root: {
					magnet: true
				},
				image: {
					xlinkHref: 'static/editor/file.svg',
					refWidth: '50%',
					refHeight: '40%',
					refX: '2%',
					refY: '0%'
				},
				body: {
					fill: '#f6f6f6',
					stroke: '#008cee',
					strokeWidth: 2
				},
				label: {
					textVerticalAnchor: 'middle',
					textAnchor: 'middle',
					refX: '75%',
					refY: '40%',
					fontSize: 10,
					fill: '#333333'
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
			}]
		},
		/**
		 * object that contains properties to be assigned on the subtype constructor.
		 */
		//staticProperties: {}
	},

};
