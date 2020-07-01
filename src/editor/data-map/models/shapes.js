/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/30/20
 * @description
 */
export default joint => {
	joint.shapes.standard.Rectangle.define(
		'dataMap.Tapdata',
		{
			// defaultAttributes
			size: { width: 220, height: 80 },
			attrs: {
				body: {
					fill: '#8eb0d5',
					stroke: '#000000',
					strokeWidth: 1,
					rx: 5,
					ry: 5
				},
				label: {
					fontSize: 18,
					text: 'Tapdata'
				}
			}
		},
		{
			// prototype properties
		},
		{
			// staticProperties
		}
	);

	joint.shapes.standard.EmbeddedImage.define('dataMap.Classification', {
		// defaultAttributes
		size: { width: 220, height: 80 },
		attrs: {
			image: {
				xlinkHref: 'static/editor/o-DB.svg',
				refWidth: '19%',
				refHeight: '82%',
				refX: '-4%',
				refY: '-7%'
			},
			body: {
				fill: '#e699ab',
				stroke: '#000000',
				strokeWidth: 1,
				rx: 5,
				ry: 5,
				refWidth: '100%',
				refHeight: '100%'
			},
			label: {
				text: 'Classification',
				textVerticalAnchor: 'middle',
				textAnchor: 'left',
				refX: '10%',
				refY: '50%',
				fontSize: 12,
				fill: '#333333',
				x: 0,
				y: 0
			}
		}
	});

	joint.shapes.standard.EmbeddedImage.define('dataMap.Database', {
		// defaultAttributes
		size: { width: 220, height: 42 },
		attrs: {
			image: {
				xlinkHref: 'static/editor/o-DB.svg',
				refWidth: '19%',
				refHeight: '82%',
				refX: '-4%',
				refY: '-15%'
			},
			body: {
				fill: '#f2ca90',
				stroke: '#000000',
				strokeWidth: 1,
				rx: 5,
				ry: 5,
				refWidth: '100%',
				refHeight: '100%'
			},
			label: {
				text: 'Database',
				textVerticalAnchor: 'middle',
				textAnchor: 'left',
				refX: '10%',
				refY: '50%',
				fontSize: 12,
				fill: '#333333',
				x: 0,
				y: 0
			}
		}
	});

	joint.shapes.standard.EmbeddedImage.define('dataMap.Table', {
		// defaultAttributes
		size: { width: 220, height: 30 },
		attrs: {
			image: {
				xlinkHref: 'static/editor/o-table.svg',
				refWidth: '19%',
				refHeight: '82%',
				refX: '-4%',
				refY: '-23%'
			},
			body: {
				fill: '#f2ca90',
				stroke: '#000000',
				strokeWidth: 1,
				rx: 5,
				ry: 5,
				refWidth: '100%',
				refHeight: '100%'
			},
			label: {
				text: 'Database',
				textVerticalAnchor: 'middle',
				textAnchor: 'left',
				refX: '10%',
				refY: '50%',
				fontSize: 12,
				fill: '#333333',
				x: 0,
				y: 0
			}
		}
	});

	joint.shapes.standard.EmbeddedImage.define('dataMap.API', {
		// defaultAttributes
		size: { width: 220, height: 42 },
		attrs: {
			image: {
				xlinkHref: 'static/editor/API-target1.svg',
				refWidth: '19%',
				refHeight: '82%',
				refX: '-4%',
				refY: '-15%'
			},
			body: {
				fill: '#b6a5c5',
				stroke: '#000000',
				strokeWidth: 1,
				rx: 5,
				ry: 5,
				refWidth: '100%',
				refHeight: '100%'
			},
			label: {
				text: 'Database',
				textVerticalAnchor: 'middle',
				textAnchor: 'left',
				refX: '10%',
				refY: '50%',
				fontSize: 12,
				fill: '#333333',
				x: 0,
				y: 0
			}
		}
	});

	joint.shapes.standard.HeaderedRectangle.define('dataMap.Lane', {
		size: {
			width: 200,
			height: 200
		},
		attrs: {
			header: {
				fill: '#bbbbbb',
				'fill-opacity': 0.4,
				stroke: '#dddddd',
				'stroke-width': 1,
				rx: 5,
				ry: 5
			},
			body: {
				rx: 5,
				ry: 5,
				fill: '#dddddd',
				'fill-opacity': 0.2,
				stroke: '#dddddd',
				'stroke-width': 3
			}
		}
	});

	joint.shapes.standard.Link.define('dataMap.Link', {
		attrs: {
			line: {
				targetMarker: {
					type: 'path',
					fill: '#999999',
					d: 'M 10 -5 0 0 10 5 z'
				},
				/*sourceMarker: {
					'type': 'path',
					'fill': '#5755a1',
					'd': 'M 0 -5 10 0 0 5 z'
				},*/
				stroke: '#999',
				strokeWidth: '1'
			}
		}
	});

	/*joint.shapes.standard.Link.define('mapping.Link', {
		z: -1,
		attrs: {
			line: {
				targetMarker: {
					'type': 'path',
					'fill': '#5755a1',
					'd': 'M 10 -5 0 0 10 5 z'
				},
				sourceMarker: {
					'type': 'path',
					'fill': '#5755a1',
					'd': 'M 0 -5 10 0 0 5 z'
				},
				stroke: 'gray'
			}
		}
	});*/

	joint.shapes.standard.HeaderedRecord.define(
		'mapping.Record',
		{
			itemHeight: 20,
			itemOffset: 15,
			itemMinLabelWidth: 70,
			padding: { top: 35, left: 10, right: 10, bottom: 5 },
			itemOverflow: true,
			attrs: {
				root: {
					magnet: false
				},
				header: {
					fill: '#31d0c6'
				},
				headerLabel: {
					fontFamily: 'Sans-serif',
					fontWeight: 'normal',
					fontSize: 14,
					textWrap: {
						ellipsis: true,
						height: 30
					}
				},
				buttonsGroups: {
					stroke: 'black'
				},
				forksGroups: {
					stroke: 'lightgray'
				},
				itemBodies: {
					itemHighlight: {
						stroke: '#000000'
					}
				},
				itemLabels: {
					magnet: 'true',
					/*cursor: 'pointer',*/
					fontSize: 12,
					fontFamily: 'Sans-serif',
					itemHighlight: {
						fill: '#fe854f'
					}
				},
				itemLabels_disabled: {
					magnet: null,
					fill: '#aaaaaa',
					cursor: 'not-allowed'
				}
			}
		},
		{
			setName: function(name, opt) {
				this.attr(['headerLabel', 'textWrap', 'text'], name, opt);
			},

			getDefaultItem: function() {
				return {
					id: joint.util.uuid(),
					label: 'new_item',
					icon: 'images/document.svg'
				};
			},

			getItemTools: function() {
				return [
					{ action: 'edit', content: 'Edit Item' },
					{ action: 'add-child', content: 'Add Child' },
					{ action: 'add-next-sibling', content: 'Add Next Sibling' },
					{ action: 'add-prev-sibling', content: 'Add Prev Sibling' },
					{ action: 'remove', content: 'Remove item' }
				];
			},

			getTools: function() {
				return [
					{ action: 'add-item', content: 'Add Child' },
					{ action: 'remove', content: 'Remove Record' }
				];
			},

			getInspectorConfig: function() {
				return {
					label: {
						label: 'Label',
						type: 'content-editable'
					},
					icon: {
						label: 'Icon',
						type: 'select-button-group',
						options: [
							{
								value: 'images/link.svg',
								content: '<img height="42px" src="images/link.svg"/>'
							},
							{
								value: 'images/document.svg',
								content: '<img height="42px" src="images/document.svg"/>'
							},
							{
								value: 'images/clipboard.svg',
								content: '<img height="42px" src="images/clipboard.svg"/>'
							},
							{
								value: 'images/file.svg',
								content: '<img height="42px" src="images/file.svg"/>'
							}
						]
					},
					highlighted: {
						label: 'Highlight',
						type: 'toggle'
					}
				};
			}
		}
	);

	joint.shapes.mapping.RecordView = joint.shapes.standard.RecordView;
};
