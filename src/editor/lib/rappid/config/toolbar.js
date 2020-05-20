/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/29/20
 * @description
 */
import i18n from "../../../../i18n/i18n";
export const toolbarConfig = {
  groups: {
    "undo-redo": { index: 1 },
    clear: { index: 2 },
    /* 'export': { index: 3 }, */
    print: { index: 4 },
    fullscreen: { index: 5 },
    order: { index: 6 },
    layout: { index: 7 },
    zoom: { index: 8 },
    /* 'grid': { index: 9 }, */
    snapline: { index: 10 }
  },
  tools: [
    {
      type: "undo",
      name: "undo",
      group: "undo-redo",
      attrs: {
        button: {
          "data-tooltip": i18n.t("editor.ui.toolbar.undo.tip"),
          "data-tooltip-position": "top",
          "data-tooltip-position-selector": ".graph-toolbar"
        }
      }
    },
    {
      type: "redo",
      name: "redo",
      group: "undo-redo",
      attrs: {
        button: {
          "data-tooltip": i18n.t("editor.ui.toolbar.redo.tip"),
          "data-tooltip-position": "top",
          "data-tooltip-position-selector": ".graph-toolbar"
        }
      }
    },
    {
      type: "button",
      name: "clear",
      group: "clear",
      attrs: {
        button: {
          id: "btn-clear",
          "data-tooltip": i18n.t("editor.ui.toolbar.clear_paper.tip"),
          "data-tooltip-position": "top",
          "data-tooltip-position-selector": ".graph-toolbar"
        }
      }
    },
    /* {
			type: 'button',
			name: 'svg',
			group: 'export',
			text: 'Export SVG',
			attrs: {
				button: {
					id: 'btn-svg',
					'data-tooltip': i18n.t('editor.ui.toolbar.export_svg.tip'),
					'data-tooltip-position': 'top',
					'data-tooltip-position-selector': '.graph-toolbar'
				}
			}
		}, */
    /* {
			type: 'button',
			name: 'png',
			group: 'export',
			text: 'Export PNG',
			attrs: {
				button: {
					id: 'btn-png',
					'data-tooltip': i18n.t('editor.ui.toolbar.export_png.tip'),
					'data-tooltip-position': 'top',
					'data-tooltip-position-selector': '.graph-toolbar'
				}
			}
		}, */
    /* {
			type: 'button',
			name: 'print',
			group: 'print',
			attrs: {
				button: {
					id: 'btn-print',
					'data-tooltip': i18n.t('editor.ui.toolbar.print.tip'),
					'data-tooltip-position': 'top',
					'data-tooltip-position-selector': '.graph-toolbar'
				}
			}
		}, */
    /* {
			type: 'button',
			name: 'to-front',
			group: 'order',
			text: 'Send To Front',
			attrs: {
				button: {
					id: 'btn-to-front',
					'data-tooltip': i18n.t('editor.ui.toolbar.to_front.tip'),
					'data-tooltip-position': 'top',
					'data-tooltip-position-selector': '.graph-toolbar'
				}
			}
		},
		{
			type: 'button',
			name: 'to-back',
			group: 'order',
			text: 'Send To Back',
			attrs: {
				button: {
					id: 'btn-to-back',
					'data-tooltip': i18n.t('editor.ui.toolbar.to_back.tip'),
					'data-tooltip-position': 'top',
					'data-tooltip-position-selector': '.graph-toolbar'
				}
			}
		}, */
    {
      type: "button",
      group: "layout",
      name: "layout",
      attrs: {
        button: {
          "data-tooltip": i18n.t("editor.ui.toolbar.layout.tip"),
          "data-tooltip-position": "top",
          "data-tooltip-position-selector": ".graph-toolbar"
        }
      }
    },
    {
      type: "zoom-to-fit",
      name: "zoom-to-fit",
      group: "zoom",
      attrs: {
        button: {
          "data-tooltip": i18n.t("editor.ui.toolbar.zoom_to_fit.tip"),
          "data-tooltip-position": "top",
          "data-tooltip-position-selector": ".graph-toolbar"
        }
      }
    },
    {
      type: "zoom-out",
      name: "zoom-out",
      group: "zoom",
      attrs: {
        button: {
          "data-tooltip": i18n.t("editor.ui.toolbar.zoom_out.tip"),
          "data-tooltip-position": "top",
          "data-tooltip-position-selector": ".graph-toolbar"
        }
      }
    },
    /* {
			type: 'label',
			name: 'zoom-slider-label',
			group: 'zoom',
			text: 'Zoom:'
		},
		{
			type: 'zoom-slider',
			name: 'zoom-slider',
			group: 'zoom'
		}, */
    {
      type: "zoom-in",
      name: "zoom-in",
      group: "zoom",
      attrs: {
        button: {
          "data-tooltip": i18n.t("editor.ui.toolbar.zoom_in.tip"),
          "data-tooltip-position": "top",
          "data-tooltip-position-selector": ".graph-toolbar"
        }
      }
    },
    {
      type: "separator",
      group: "zoom"
    },
    /* {
			type: 'separator',
			group: 'grid'
		},
		{
			type: 'label',
			name: 'grid-size-label',
			group: 'grid',
			text: 'Grid size:',
			attrs: {
				label: {
					'data-tooltip': i18n.t('editor.ui.toolbar.grid_size.tip'),
					'data-tooltip-position': 'top',
					'data-tooltip-position-selector': '.graph-toolbar'
				}
			}
		},
		{
			type: 'range',
			name: 'grid-size',
			group: 'grid',
			text: 'Grid size:',
			min: 1,
			max: 50,
			step: 1,
			value: 4
		}, */
    {
      type: "fullscreen",
      name: "fullscreen",
      group: "fullscreen",
      attrs: {
        button: {
          "data-tooltip": i18n.t("editor.ui.toolbar.fullscreen.tip"),
          "data-tooltip-position": "top",
          "data-tooltip-position-selector": ".graph-toolbar"
        }
      }
    }
  ]
};
