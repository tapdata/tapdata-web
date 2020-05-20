/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/29/20
 * @description
 */
import i18n from "../../../../i18n/i18n";
export const stencilConfig = {
  groups: {
    data: { index: 1, label: i18n.t("editor.ui.sidebar.data_nodes") },
    processor: { index: 2, label: i18n.t("editor.ui.sidebar.processor") }
    // standard: {index: 3, label: 'Standard shapes', closed: true},
  },
  shapes: {
    data: [
      /* {
				type: 'app.SourceDB',
				size: {width: 5, height: 3},
				attrs: {
					root: {
						dataTooltip: 'Rectangle',
						dataTooltipPosition: 'left',
						dataTooltipPositionSelector: '.joint-stencil'
					},
					body: {
						rx: 2,
						ry: 2,
						width: 50,
						height: 30,
						fill: '#f6f6f6',
						stroke: '#008cee',
						strokeWidth: 2,
						strokeDasharray: '0'
					},
					label: {
						text: 'Source Database',
						fill: '#555555',
						fontFamily: 'Roboto Condensed',
						fontWeight: 'Normal',
						fontSize: 13,
						strokeWidth: 0
					}
				}
			},
			{
				type: 'app.TargetDB',
				size: {width: 5, height: 3},
				attrs: {
					root: {
						dataTooltip: 'Rectangle',
						dataTooltipPosition: 'left',
						dataTooltipPositionSelector: '.joint-stencil'
					},
					body: {
						rx: 2,
						ry: 2,
						width: 50,
						height: 30,
						fill: '#f6f6f6',
						stroke: '#008cee',
						strokeWidth: 2,
						strokeDasharray: '0'
					},
					label: {
						text: 'Target Database',
						fill: '#555555',
						fontFamily: 'Roboto Condensed',
						fontWeight: 'Normal',
						fontSize: 13,
						strokeWidth: 0
					}
				}
			} */
    ],
    processor: []
    /* standard: [
			{
				type: 'standard.Rectangle',
				size: {width: 5, height: 3},
				attrs: {
					root: {
						dataTooltip: 'Rectangle',
						dataTooltipPosition: 'left',
						dataTooltipPositionSelector: '.joint-stencil'
					},
					body: {
						rx: 2,
						ry: 2,
						width: 50,
						height: 30,
						fill: 'transparent',
						stroke: '#008cee',
						strokeWidth: 2,
						strokeDasharray: '0'
					},
					label: {
						text: 'rect',
						fill: '#555555',
						fontFamily: 'Roboto Condensed',
						fontWeight: 'Normal',
						fontSize: 11,
						strokeWidth: 0
					}
				}
			},
			{
			type: 'standard.Ellipse',
			size: {width: 5, height: 3},
			attrs: {
				root: {
					dataTooltip: 'Ellipse',
					dataTooltipPosition: 'left',
					dataTooltipPositionSelector: '.joint-stencil'
				},
				body: {
					width: 50,
					height: 30,
					fill: 'transparent',
					stroke: '#008cee',
					strokeWidth: 2,
					strokeDasharray: '0'
				},
				label: {
					text: 'ellipse',
					fill: '#555555',
					fontFamily: 'Roboto Condensed',
					fontWeight: 'Normal',
					fontSize: 11,
					strokeWidth: 0
				}
			}
		},
			{
			type: 'standard.Cylinder',
			size: {width: 5, height: 3},
			attrs: {
				root: {
					dataTooltip: 'Cylinder',
					dataTooltipPosition: 'left',
					dataTooltipPositionSelector: '.joint-stencil'
				},
				body: {
					fill: 'transparent',
					stroke: '#008cee',
					strokeWidth: 2,
					strokeDasharray: '0'
				},
				top: {
					fill: '#008cee',
					stroke: '#008cee',
					strokeWidth: 2,
					strokeDasharray: '0'
				},
				label: {
					text: 'cylinder',
					fill: '#555555',
					fontFamily: 'Roboto Condensed',
					fontWeight: 'Normal',
					fontSize: 11,
					strokeWidth: 0
				}
			}
		},
			{
			type: 'standard.Image',
			size: {width: 53, height: 42},
			attrs: {
				root: {
					dataTooltip: 'Image',
					dataTooltipPosition: 'left',
					dataTooltipPositionSelector: '.joint-stencil'
				},
				image: {
					xlinkHref: 'static/editor/image-icon1.svg'
				},
				body: {
					fill: 'transparent',
					stroke: '#008cee',
					strokeWidth: 2,
					strokeDasharray: '0'
				},
				label: {
					text: 'image',
					fontFamily: 'Roboto Condensed',
					fontWeight: 'Normal',
					fontSize: 11,
					fill: '#555555'
				}
			}
		},
			{
				type: 'standard.EmbeddedImage',
				size: {width: 5, height: 3},
				attrs: {
					root: {
						dataTooltip: 'Card',
						dataTooltipPosition: 'left',
						dataTooltipPositionSelector: '.joint-stencil'
					},
					body: {
						fill: 'transparent',
						stroke: '#008cee',
						strokeWidth: 2,
						strokeDasharray: '0'
					},
					image: {
						xlinkHref: 'static/editor/image-icon1.svg'
					},
					label: {
						text: 'card',
						fill: '#555555',
						fontFamily: 'Roboto Condensed',
						fontWeight: 'Normal',
						fontSize: 11,
						strokeWidth: 0
					}
				}
			},
			{
			type: 'standard.InscribedImage',
			size: {width: 1, height: 1},
			attrs: {
				root: {
					dataTooltip: 'Icon',
					dataTooltipPosition: 'left',
					dataTooltipPositionSelector: '.joint-stencil'
				},
				border: {
					stroke: '#008cee',
					strokeWidth: 3,
					strokeDasharray: '0'
				},
				background: {
					fill: 'transparent'
				},
				image: {
					xlinkHref: 'static/editor/image-icon1.svg'
				},
				label: {
					text: 'icon',
					fill: '#555555',
					fontFamily: 'Roboto Condensed',
					fontWeight: 'Normal',
					fontSize: 11,
					strokeWidth: 0
				}
			}
		},
			{
			type: 'standard.HeaderedRectangle',
			size: {width: 5, height: 3},
			attrs: {
				root: {
					dataTooltip: 'Rectangle with header',
					dataTooltipPosition: 'left',
					dataTooltipPositionSelector: '.joint-stencil'
				},
				body: {
					fill: 'transparent',
					stroke: '#008cee',
					strokeWidth: 2,
					strokeDasharray: '0'
				},
				header: {
					stroke: '#008cee',
					fill: '#008cee',
					strokeWidth: 2,
					strokeDasharray: '0',
					height: 20
				},
				bodyText: {
					textWrap: {
						text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur molestie.',
						width: -10,
						height: -20,
						ellipsis: true
					},
					fill: '#555555',
					fontFamily: 'Roboto Condensed',
					fontWeight: 'Normal',
					fontSize: 11,
					strokeWidth: 0,
					refY2: 12,
				},
				headerText: {
					text: 'header',
					fill: '#f6f6f6',
					fontFamily: 'Roboto Condensed',
					fontWeight: 'Normal',
					fontSize: 11,
					strokeWidth: 0,
					refY: 12
				}
			}
		}
		] */
  }
};
