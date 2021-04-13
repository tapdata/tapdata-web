/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/29/20
 * @description
 */
export const options = {
  colorPalette: [
    { content: 'transparent', icon: 'editor/transparent-icon.svg' },
    { content: '#f6f6f6' },
    { content: '#dcd7d7' },
    { content: '#8f8f8f' },
    { content: '#c6c7e2' },
    { content: '#feb663' },
    { content: '#fe854f' },
    { content: '#b75d32' },
    { content: '#31d0c6' },
    { content: '#7c68fc' },
    { content: '#61549c' },
    { content: '#6a6c8a' },
    { content: '#4b4a67' },
    { content: '#3c4260' },
    { content: '#33334e' },
    { content: '#222138' }
  ],

  colorPaletteReset: [
    { content: undefined, icon: 'editor/no-color-icon.svg' },
    { content: '#f6f6f6' },
    { content: '#dcd7d7' },
    { content: '#8f8f8f' },
    { content: '#c6c7e2' },
    { content: '#feb663' },
    { content: '#fe854f' },
    { content: '#b75d32' },
    { content: '#31d0c6' },
    { content: '#7c68fc' },
    { content: '#61549c' },
    { content: '#6a6c8a' },
    { content: '#4b4a67' },
    { content: '#3c4260' },
    { content: '#33334e' },
    { content: '#222138' }
  ],

  fontWeight: [
    {
      value: '300',
      content: '<span style="font-weight: 300">Light</span>'
    },
    {
      value: 'Normal',
      content: '<span style="font-weight: Normal">Normal</span>'
    },
    {
      value: 'Bold',
      content: '<span style="font-weight: Bolder">Bold</span>'
    }
  ],

  fontFamily: [
    {
      value: 'Alegreya Sans',
      content: '<span style="font-family: Alegreya Sans">Alegreya Sans</span>'
    },
    {
      value: 'Averia Libre',
      content: '<span style="font-family: Averia Libre">Averia Libre</span>'
    },
    {
      value: 'Roboto Condensed',
      content: '<span style="font-family: Roboto Condensed">Roboto Condensed</span>'
    }
  ],

  strokeStyle: [
    { value: '0', content: 'Solid' },
    { value: '2,5', content: 'Dotted' },
    { value: '10,5', content: 'Dashed' }
  ],

  side: [
    { value: 'top', content: 'Top Side' },
    { value: 'right', content: 'Right Side' },
    { value: 'bottom', content: 'Bottom Side' },
    { value: 'left', content: 'Left Side' }
  ],

  portLabelPositionRectangle: [
    { value: { name: 'top', args: { y: -12 } }, content: 'Above' },
    { value: { name: 'right', args: { y: 0 } }, content: 'On Right' },
    { value: { name: 'bottom', args: { y: 12 } }, content: 'Below' },
    { value: { name: 'left', args: { y: 0 } }, content: 'On Left' }
  ],

  portLabelPositionEllipse: [
    { value: 'radial', content: 'Horizontal' },
    { value: 'radialOriented', content: 'Angled' }
  ],

  imageIcons: [
    {
      value: 'editor/image-icon1.svg',
      content: '<img height="42px" src="editor/image-icon1.svg"/>'
    },
    {
      value: 'editor/image-icon2.svg',
      content: '<img height="80px" src="editor/image-icon2.svg"/>'
    },
    {
      value: 'editor/image-icon3.svg',
      content: '<img height="80px" src="editor/image-icon3.svg"/>'
    },
    {
      value: 'editor/image-icon4.svg',
      content: '<img height="80px" src="editor/image-icon4.svg"/>'
    }
  ],

  imageGender: [
    {
      value: 'editor/member-male.png',
      content: '<img height="50px" src="editor/member-male.png" style="margin: 5px 0 0 2px;"/>'
    },
    {
      value: 'editor/member-female.png',
      content: '<img height="50px" src="editor/member-female.png" style="margin: 5px 0 0 2px;"/>'
    }
  ],

  arrowheadSize: [
    { value: 'M 0 0 0 0', content: 'None' },
    { value: 'M 0 -3 -6 0 0 3 z', content: 'Small' },
    { value: 'M 0 -5 -10 0 0 5 z', content: 'Medium' },
    { value: 'M 0 -10 -15 0 0 10 z', content: 'Large' }
  ],

  strokeWidth: [
    {
      value: 1,
      content: '<div style="background:#fff;width:2px;height:30px;margin:0 14px;border-radius: 2px;"/>'
    },
    {
      value: 2,
      content: '<div style="background:#fff;width:4px;height:30px;margin:0 13px;border-radius: 2px;"/>'
    },
    {
      value: 4,
      content: '<div style="background:#fff;width:8px;height:30px;margin:0 11px;border-radius: 2px;"/>'
    },
    {
      value: 8,
      content: '<div style="background:#fff;width:16px;height:30px;margin:0 8px;border-radius: 2px;"/>'
    }
  ],

  router: [
    {
      value: 'normal',
      content: '<p style="background:#fff;width:2px;height:30px;margin:0 14px;border-radius: 2px;"/>'
    },
    {
      value: 'orthogonal',
      content:
        '<p style="width:20px;height:30px;margin:0 5px;border-bottom: 2px solid #fff;border-left: 2px solid #fff;"/>'
    },
    {
      value: 'oneSide',
      content: '<p style="width:20px;height:30px;margin:0 5px;border: 2px solid #fff;border-top: none;"/>'
    }
  ],

  connector: [
    {
      value: 'normal',
      content: '<p style="width:20px;height:20px;margin:5px;border-top:2px solid #fff;border-left:2px solid #fff;"/>'
    },
    {
      value: 'rounded',
      content:
        '<p style="width:20px;height:20px;margin:5px;border-top-left-radius:30%;border-top:2px solid #fff;border-left:2px solid #fff;"/>'
    },
    {
      value: 'smooth',
      content:
        '<p style="width:20px;height:20px;margin:5px;border-top-left-radius:100%;border-top:2px solid #fff;border-left:2px solid #fff;"/>'
    }
  ],

  labelPosition: [
    { value: 30, content: 'Close to source' },
    { value: 0.5, content: 'In the middle' },
    { value: -30, content: 'Close to target' }
  ],

  portMarkup: [
    {
      value: [
        {
          tagName: 'rect',
          selector: 'portBody',
          attributes: {
            width: 20,
            height: 20,
            x: -10,
            y: -10
          }
        }
      ],
      content: 'Rectangle'
    },
    {
      value: [
        {
          tagName: 'circle',
          selector: 'portBody',
          attributes: {
            r: 10
          }
        }
      ],
      content: 'Circle'
    },
    {
      value: [
        {
          tagName: 'path',
          selector: 'portBody',
          attributes: {
            d: 'M -10 -10 10 -10 0 10 z'
          }
        }
      ],
      content: 'Triangle'
    }
  ]
}

export const inspectorConfig = {
  /* 'app.Link': {
		inputs: {
			attrs: {
				line: {
					strokeWidth: {
						type: 'select-button-group',
						options: options.strokeWidth,
						group: 'connection',
						label: 'Link thickness',
						when: {ne: {'attrs/line/stroke': 'transparent'}},
						index: 4
					},
					strokeDasharray: {
						type: 'select-box',
						options: options.strokeStyle,
						group: 'connection',
						label: 'Link style',
						when: {ne: {'attrs/line/stroke': 'transparent'}},
						index: 5
					},
					stroke: {
						type: 'color-palette',
						options: options.colorPalette,
						group: 'connection',
						label: 'Color',
						index: 6
					},
					sourceMarker: {
						d: {
							type: 'select-box',
							options: options.arrowheadSize,
							group: 'marker-source',
							label: 'Source arrowhead',
							index: 1
						},
						fill: {
							type: 'color-palette',
							options: options.colorPaletteReset,
							group: 'marker-source',
							label: 'Color',
							when: {ne: {'attrs/line/sourceMarker/d': 'M 0 0 0 0'}},
							index: 2
						}
					},
					targetMarker: {
						d: {
							type: 'select-box',
							options: options.arrowheadSize,
							group: 'marker-target',
							label: 'Target arrowhead',
							index: 1
						},
						fill: {
							type: 'color-palette',
							options: options.colorPaletteReset,
							group: 'marker-target',
							label: 'Color',
							when: {ne: {'attrs/line/targetMarker/d': 'M 0 0 0 0'}},
							index: 2
						}
					}
				}
			},
			router: {
				name: {
					type: 'select-button-group',
					options: options.router,
					group: 'connection',
					label: 'Connection type',
					index: 1
				},
				args: {
					side: {
						type: 'select-box',
						options: options.side,
						placeholder: 'Pick a side',
						group: 'connection',
						label: 'Anchors side',
						when: {eq: {'router/name': 'oneSide'}, otherwise: {unset: true}},
						index: 2
					}
				}
			},
			connector: {
				name: {
					type: 'select-button-group',
					options: options.connector,
					group: 'connection',
					label: 'Connection style',
					index: 3
				}
			},
			labels: {
				type: 'list',
				group: 'labels',
				label: 'Labels',
				attrs: {
					label: {
						'data-tooltip': 'Set (possibly multiple) labels for the link',
						'data-tooltip-position': 'right',
						'data-tooltip-position-selector': '.joint-inspector'
					}
				},
				item: {
					type: 'object',
					properties: {
						attrs: {
							text: {
								text: {
									type: 'content-editable',
									label: 'text',
									defaultValue: 'label',
									index: 1,
									attrs: {
										label: {
											'data-tooltip': 'Set text of the label',
											'data-tooltip-position': 'right',
											'data-tooltip-position-selector': '.joint-inspector'
										}
									}
								},
								fill: {
									type: 'color-palette',
									options: options.colorPaletteReset,
									label: 'Text Color',
									index: 5
								}
							},
							rect: {
								fill: {
									type: 'color-palette',
									options: options.colorPaletteReset,
									label: 'Fill',
									index: 3
								},
								stroke: {
									type: 'color-palette',
									options: options.colorPaletteReset,
									label: 'Outline',
									index: 4
								}
							}
						},
						position: {
							type: 'select-box',
							options: options.labelPosition || [],
							defaultValue: 0.5,
							label: 'Position',
							placeholder: 'Custom',
							index: 2,
							attrs: {
								label: {
									'data-tooltip': 'Position the label relative to the source of the link',
									'data-tooltip-position': 'right',
									'data-tooltip-position-selector': '.joint-inspector'
								}
							}
						}
					}
				}
			}
		},
		groups: {
			connection: {
				label: 'Connection',
				index: 1
			},
			'marker-source': {
				label: 'Source marker',
				index: 2
			},
			'marker-target': {
				label: 'Target marker',
				index: 3
			},
			labels: {
				label: 'Labels',
				index: 4
			}
		}
	},
	'app.SourceDB': {
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
	'app.TargetDB': {
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
	}, */
  'standard.Rectangle': {
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
            when: { ne: { 'attrs/label/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
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
            when: { ne: { 'attrs/body/stroke': 'transparent' } },
            index: 3
          },
          strokeDasharray: {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/body/stroke': 'transparent' } }, { ne: { 'attrs/body/strokeWidth': 0 } }]
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
  'standard.Ellipse': {
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
            when: { ne: { 'attrs/label/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
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
            when: { ne: { 'attrs/body/stroke': 'transparent' } },
            index: 3
          },
          strokeDasharray: {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/body/stroke': 'transparent' } }, { ne: { 'attrs/body/stroke-width': 0 } }]
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
  'standard.Polygon': {
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
            when: { ne: { 'attrs/label/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
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
            when: { ne: { 'attrs/body/stroke': 'transparent' } },
            index: 3
          },
          strokeDasharray: {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/body/stroke': 'transparent' } }, { ne: { 'attrs/body/strokeWidth': 0 } }]
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
  'standard.Cylinder': {
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
            when: { ne: { 'attrs/label/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
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
            when: { ne: { 'attrs/body/stroke': 'transparent' } },
            index: 3
          },
          strokeDasharray: {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/body/stroke': 'transparent' } }, { ne: { 'attrs/body/strokeWidth': 0 } }]
            },
            index: 4
          }
        },
        top: {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'top',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'top',
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
            group: 'top',
            when: { ne: { 'attrs/body/stroke': 'transparent' } },
            index: 3
          },
          strokeDasharray: {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'top',
            when: {
              and: [{ ne: { 'attrs/body/stroke': 'transparent' } }, { ne: { 'attrs/body/strokeWidth': 0 } }]
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
      top: {
        label: 'Top',
        index: 2
      },
      text: {
        label: 'Text',
        index: 3
      }
    }
  },
  'standard.Image': {
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
            when: { ne: { 'attrs/label/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 5
          }
        },
        image: {
          xlinkHref: {
            type: 'select-box',
            options: options.imageIcons,
            label: 'Image',
            group: 'presentation',
            index: 1
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
  'standard.InscribedImage': {
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
            when: { ne: { 'attrs/label/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 5
          }
        },
        image: {
          xlinkHref: {
            type: 'select-box',
            options: options.imageIcons,
            label: 'Image',
            group: 'presentation',
            index: 1
          }
        },
        background: {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'presentation',
            index: 2
          }
        },
        border: {
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'presentation',
            index: 3
          },
          strokeWidth: {
            type: 'range',
            min: 0,
            max: 10,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/border/stroke': 'transparent' } },
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
  'standard.EmbeddedImage': {
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
            when: { ne: { 'attrs/label/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
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
            when: { ne: { 'attrs/body/stroke': 'transparent' } },
            index: 3
          },
          strokeDasharray: {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/body/stroke': 'transparent' } }, { ne: { 'attrs/body/strokeWidth': 0 } }]
            },
            index: 4
          }
        },
        image: {
          xlinkHref: {
            type: 'select-box',
            options: options.imageIcons,
            label: 'Image',
            group: 'image',
            index: 1
          }
        }
      }
    },
    groups: {
      image: {
        label: 'image',
        index: 1
      },
      presentation: {
        label: 'Presentation',
        index: 2
      },
      text: {
        label: 'Text',
        index: 3
      }
    }
  },
  'standard.HeaderedRectangle': {
    inputs: {
      attrs: {
        bodyText: {
          textWrap: {
            text: {
              type: 'content-editable',
              label: 'Wrapped text',
              group: 'text',
              index: 1
            }
          },
          fontSize: {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/bodyText/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/bodyText/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/bodyText/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/boduText/text': '' } },
            index: 5
          }
        },
        headerText: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'headerText',
            index: 1
          },
          fontSize: {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'headerText',
            when: { ne: { 'attrs/headerText/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'headerText',
            when: { ne: { 'attrs/headerText/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'headerText',
            when: { ne: { 'attrs/headerText/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'headerText',
            when: { ne: { 'attrs/headerText/text': '' } },
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
            when: { ne: { 'attrs/body/stroke': 'transparent' } },
            index: 3
          },
          strokeDasharray: {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/body/stroke': 'transparent' } }, { ne: { 'attrs/body/strokeWidth': 0 } }]
            },
            index: 4
          }
        },
        header: {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'header',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'header',
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
            group: 'header',
            when: { ne: { 'attrs/header/stroke': 'transparent' } },
            index: 3
          },
          strokeDasharray: {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'header',
            when: {
              and: [
                {
                  ne: { 'attrs/header/stroke': 'transparent' }
                },
                { ne: { 'attrs/header/strokeWidth': 0 } }
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
      },
      header: {
        label: 'Header',
        index: 3
      },
      headerText: {
        label: 'Header Text',
        index: 4
      }
    }
  },
  'fsa.StartState': {
    inputs: {
      attrs: {
        circle: {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'presentation',
            index: 1
          }
        }
      }
    },
    groups: {
      presentation: {
        label: 'Presentation',
        index: 1
      }
    }
  },
  'fsa.EndState': {
    inputs: {
      attrs: {
        '.outer': {
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
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [
                {
                  ne: { 'attrs/.outer/stroke': 'transparent' }
                },
                { ne: { 'attrs/.outer/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        },
        '.inner': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Inner fill',
            group: 'presentation',
            index: 2
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
  'fsa.State': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        circle: {
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
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/circle/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [
                {
                  ne: { 'attrs/circle/stroke': 'transparent' }
                },
                { ne: { 'attrs/circle/stroke-width': 0 } }
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
  'pn.Place': {
    inputs: {
      attrs: {
        '.label': {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/.label/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/.label/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/.label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/.label/text': '' } },
            index: 5
          }
        },
        '.root': {
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
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/.root/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/.root/stroke': 'transparent' } }, { ne: { 'attrs/.root/stroke-width': 0 } }]
            },
            index: 4
          }
        }
      },
      tokens: {
        type: 'number',
        min: 1,
        max: 500,
        group: 'data',
        index: 1
      }
    },
    groups: {
      presentation: {
        label: 'Presentation',
        index: 2
      },
      text: {
        label: 'Text',
        index: 3
      },
      data: {
        label: 'Data',
        index: 1
      }
    }
  },
  'pn.Transition': {
    inputs: {
      attrs: {
        '.label': {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/.label/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/.label/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/.label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/.label/text': '' } },
            index: 5
          }
        },
        rect: {
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
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/rect/stroke': 'transparent' } },
            index: 2
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/rect/stroke': 'transparent' } }, { ne: { 'attrs/rect/stroke-width': 0 } }]
            },
            index: 3
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
  'erd.Entity': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        '.outer': {
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
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/.outer/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [
                {
                  ne: { 'attrs/.outer/stroke': 'transparent' }
                },
                { ne: { 'attrs/.outer/stroke-width': 0 } }
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
  'erd.WeakEntity': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        '.outer': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'outer',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'outer',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'outer',
            when: { ne: { 'attrs/.outer/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'outer',
            when: {
              and: [
                {
                  ne: { 'attrs/.outer/stroke': 'transparent' }
                },
                { ne: { 'attrs/.outer/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        },
        '.inner': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'inner',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'inner',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'inner',
            when: { ne: { 'attrs/.inner/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'inner',
            when: {
              and: [
                {
                  ne: { 'attrs/.inner/stroke': 'transparent' }
                },
                { ne: { 'attrs/.inner/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        }
      }
    },
    groups: {
      text: {
        label: 'Text',
        index: 1
      },
      outer: {
        label: 'Outer rectangle',
        index: 2
      },
      inner: {
        label: 'Inner rectangle',
        index: 3
      }
    }
  },
  'erd.Relationship': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        '.outer': {
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
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/.outer/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [
                {
                  ne: { 'attrs/.outer/stroke': 'transparent' }
                },
                { ne: { 'attrs/.outer/stroke-width': 0 } }
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
  'erd.IdentifyingRelationship': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        '.outer': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'outer',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'outer',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'outer',
            when: { ne: { 'attrs/.outer/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'outer',
            when: {
              and: [
                {
                  ne: { 'attrs/.outer/stroke': 'transparent' }
                },
                { ne: { 'attrs/.outer/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        },
        '.inner': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'inner',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'inner',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'inner',
            when: { ne: { 'attrs/.inner/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'inner',
            when: {
              and: [
                {
                  ne: { 'attrs/.inner/stroke': 'transparent' }
                },
                { ne: { 'attrs/.inner/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        }
      }
    },
    groups: {
      text: {
        label: 'Text',
        index: 1
      },
      outer: {
        label: 'Outer polygon',
        index: 2
      },
      inner: {
        label: 'Inner polygon',
        index: 3
      }
    }
  },
  'erd.Key': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        '.outer': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'outer',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'outer',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'outer',
            when: { ne: { 'attrs/.outer/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'outer',
            when: {
              and: [
                {
                  ne: { 'attrs/.outer/stroke': 'transparent' }
                },
                { ne: { 'attrs/.outer/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        },
        '.inner': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'inner',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'inner',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'inner',
            when: { ne: { 'attrs/.inner/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'inner',
            when: {
              and: [
                {
                  ne: { 'attrs/.inner/stroke': 'transparent' }
                },
                { ne: { 'attrs/.inner/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        }
      }
    },
    groups: {
      text: {
        label: 'Text',
        index: 1
      },
      outer: {
        label: 'Outer ellipse',
        index: 2
      },
      inner: {
        label: 'Inner ellipse',
        index: 3
      }
    }
  },
  'erd.Normal': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        '.outer': {
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
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/.outer/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [
                {
                  ne: { 'attrs/.outer/stroke': 'transparent' }
                },
                { ne: { 'attrs/.outer/stroke-width': 0 } }
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
  'erd.Multivalued': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        '.outer': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'outer',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'outer',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'outer',
            when: { ne: { 'attrs/.outer/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'outer',
            when: {
              and: [
                {
                  ne: { 'attrs/.outer/stroke': 'transparent' }
                },
                { ne: { 'attrs/.outer/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        },
        '.inner': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'inner',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'inner',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'inner',
            when: { ne: { 'attrs/.inner/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'inner',
            when: {
              and: [
                {
                  ne: { 'attrs/.inner/stroke': 'transparent' }
                },
                { ne: { 'attrs/.inner/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        }
      }
    },
    groups: {
      text: {
        label: 'Text',
        index: 1
      },
      outer: {
        label: 'Outer ellipse',
        index: 2
      },
      inner: {
        label: 'Inner ellipse',
        index: 3
      }
    }
  },
  'erd.Derived': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        '.outer': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'outer',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'outer',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'outer',
            when: { ne: { 'attrs/.outer/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'outer',
            when: {
              and: [
                {
                  ne: { 'attrs/.outer/stroke': 'transparent' }
                },
                { ne: { 'attrs/.outer/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        },
        '.inner': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'inner',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'inner',
            index: 2
          },
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'inner',
            when: { ne: { 'attrs/.inner/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'inner',
            when: {
              and: [
                {
                  ne: { 'attrs/.inner/stroke': 'transparent' }
                },
                { ne: { 'attrs/.inner/stroke-width': 0 } }
              ]
            },
            index: 4
          }
        }
      }
    },
    groups: {
      text: {
        label: 'Text',
        index: 1
      },
      outer: {
        label: 'Outer ellipse',
        index: 2
      },
      inner: {
        label: 'Inner ellipse',
        index: 3
      }
    }
  },
  'erd.ISA': {
    inputs: {
      attrs: {
        text: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/text/text': '' } },
            index: 5
          }
        },
        polygon: {
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
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/polygon/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [
                {
                  ne: {
                    'attrs/polygon/stroke': 'transparent'
                  }
                },
                { ne: { 'attrs/polygon/stroke-width': 0 } }
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
  'uml.Class': {
    inputs: {
      attrs: {
        '.uml-class-name-rect': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'name',
            index: 4
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'name',
            index: 5
          }
        },
        '.uml-class-attrs-rect': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'attributes',
            index: 4
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'attributes',
            index: 5
          }
        },
        '.uml-class-methods-rect': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'methods',
            index: 4
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'methods',
            index: 5
          }
        }
      },
      name: {
        type: 'text',
        group: 'name',
        index: 1,
        label: 'Class name'
      },
      attributes: {
        type: 'list',
        item: {
          type: 'text'
        },
        group: 'attributes',
        index: 1,
        label: 'Attributes'
      },
      methods: {
        type: 'list',
        item: {
          type: 'text'
        },
        group: 'methods',
        index: 1,
        label: 'Methods'
      }
    },
    groups: {
      name: {
        label: 'Class name',
        index: 1
      },
      attributes: {
        label: 'Attributes',
        index: 2
      },
      methods: {
        label: 'Methods',
        index: 3
      }
    }
  },
  'uml.Interface': {
    inputs: {
      attrs: {
        '.uml-class-name-rect': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'name',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'name',
            index: 2
          }
        },
        '.uml-class-attrs-rect': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'attributes',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'attributes',
            index: 2
          }
        },
        '.uml-class-methods-rect': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'methods',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'methods',
            index: 2
          }
        }
      },
      name: {
        type: 'text',
        group: 'name',
        index: 0,
        label: 'Interface name'
      },
      attributes: {
        type: 'list',
        item: {
          type: 'text'
        },
        group: 'attributes',
        index: 0,
        label: 'Attributes'
      },
      methods: {
        type: 'list',
        item: {
          type: 'text'
        },
        group: 'methods',
        index: 0,
        label: 'Methods'
      }
    },
    groups: {
      name: {
        label: 'Interface name',
        index: 1
      },
      attributes: {
        label: 'Attributes',
        index: 2
      },
      methods: {
        label: 'Methods',
        index: 3
      }
    }
  },
  'uml.Abstract': {
    inputs: {
      attrs: {
        '.uml-class-name-rect': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'name',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'name',
            index: 2
          }
        },
        '.uml-class-attrs-rect': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'attributes',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'attributes',
            index: 2
          }
        },
        '.uml-class-methods-rect': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'methods',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'methods',
            index: 2
          }
        }
      },
      name: {
        type: 'text',
        group: 'name',
        index: 0,
        label: 'Abstract class name'
      },
      attributes: {
        type: 'list',
        item: {
          type: 'text'
        },
        group: 'attributes',
        index: 0,
        label: 'Attributes'
      },
      methods: {
        type: 'list',
        item: {
          type: 'text'
        },
        group: 'methods',
        index: 0,
        label: 'Methods'
      }
    },
    groups: {
      name: {
        label: 'Abstract class name',
        index: 1
      },
      attributes: {
        label: 'Attributes Text',
        index: 2
      },
      methods: {
        label: 'Methods Text',
        index: 3
      }
    }
  },
  'uml.State': {
    inputs: {
      name: {
        group: 'text',
        index: 1,
        type: 'text'
      },
      events: {
        group: 'events',
        index: 1,
        type: 'list',
        item: {
          type: 'text'
        }
      },
      attrs: {
        '.uml-state-name': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { name: '' } },
            index: 5
          }
        },
        '.uml-state-body': {
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
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: {
              ne: {
                'attrs/.uml-state-body/stroke': 'transparent'
              }
            },
            index: 4
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [
                {
                  ne: {
                    'attrs/.uml-state-body/stroke': 'transparent'
                  }
                },
                {
                  ne: {
                    'attrs/.uml-state-body/stroke-width': 0
                  }
                }
              ]
            },
            index: 5
          }
        },
        '.uml-state-separator': {
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Horizontal rule outline',
            group: 'presentation',
            index: 3
          }
        },
        '.uml-state-events': {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'events',
            when: { ne: { events: 0 } },
            index: 5
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
        label: 'State name text',
        index: 2
      },
      events: {
        label: 'State events text',
        index: 3
      }
    }
  },
  'org.Member': {
    inputs: {
      attrs: {
        '.rank': {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'rank',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'rank',
            when: { ne: { 'attrs/.rank/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'rank',
            when: { ne: { 'attrs/.rank/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'rank',
            when: { ne: { 'attrs/.rank/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'rank',
            when: { ne: { 'attrs/.rank/text': '' } },
            index: 5
          }
        },
        '.name': {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'name',
            index: 1
          },
          'font-size': {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'name',
            when: { ne: { 'attrs/.name/text': '' } },
            index: 2
          },
          'font-family': {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'name',
            when: { ne: { 'attrs/.name/text': '' } },
            index: 3
          },
          'font-weight': {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'name',
            when: { ne: { 'attrs/.name/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'name',
            when: { ne: { 'attrs/.name/text': '' } },
            index: 5
          }
        },
        '.card': {
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
          'stroke-width': {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/.card/stroke': 'transparent' } },
            index: 3
          },
          'stroke-dasharray': {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/.card/stroke': 'transparent' } }, { ne: { 'attrs/.card/stroke-width': 0 } }]
            },
            index: 4
          }
        },
        image: {
          'xlink:href': {
            type: 'select-button-group',
            options: options.imageGender,
            label: 'Gender',
            group: 'gender',
            index: 1
          }
        }
      }
    },
    groups: {
      presentation: {
        label: 'Presentation',
        index: 4
      },
      rank: {
        label: 'Rank',
        index: 2
      },
      name: {
        label: 'Name',
        index: 3
      },
      gender: {
        label: 'Gender',
        index: 1
      }
    }
  }
}
