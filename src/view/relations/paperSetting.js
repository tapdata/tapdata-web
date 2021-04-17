export default function() {
	var joint = window.joint;
	(function(joint) {
		joint.anchors.mapping = function(view, magnet, ref) {
			var anchor;
			var model = view.model;
			var bbox = view.getNodeUnrotatedBBox(magnet);
			var center = model.getBBox().center();
			var angle = model.angle();
			var side = model.getItemSide(view.findAttribute('item-id', magnet));
			if (side === 'left') {
				anchor = bbox.leftMiddle();
			} else if (side === 'right') {
				anchor = bbox.rightMiddle();
			} else {
				var refPoint = ref;
				if (ref instanceof Element) {
					var refView = this.paper.findView(ref);
					refPoint = refView ? refView.getNodeBBox(ref).center() : new joint.g.Point();
				}
				refPoint.rotate(center, angle);
				anchor = refPoint.x <= bbox.x + bbox.width / 2 ? bbox.leftMiddle() : bbox.rightMiddle();
			}
			return anchor.rotate(center, -angle);
		};
	})(joint);

	(function(joint, g) {
		var DEFAULT_PADDING = 10;

		function getOutsidePoint(bbox, angle, anchor, padding) {
			var ref = anchor.clone();
			var center = bbox.center();
			if (angle) ref.rotate(center, angle);
			var point = new g.Point(bbox.x, ref.y);
			if (point.equals(anchor)) {
				point.x--;
				padding--;
			}
			point.move(ref, ref.x < center.x ? padding : -bbox.width - padding);
			if (angle) point.rotate(center, -angle);
			return point.round();
		}

		joint.routers.mapping = function(vertices, opt, linkView) {
			var link = linkView.model;
			var route = [];
			// Target Point
			var source = link.getSourceElement();
			if (source) {
				route.push(
					getOutsidePoint(
						source.getBBox(),
						source.angle(),
						linkView.sourceAnchor,
						opt.padding || opt.sourcePadding || DEFAULT_PADDING
					)
				);
			}
			// Vertices
			Array.prototype.push.apply(route, vertices);
			// Source Point
			var target = link.getTargetElement();
			if (target) {
				route.push(
					getOutsidePoint(
						target.getBBox(),
						target.angle(),
						linkView.targetAnchor,
						opt.padding || opt.targetPadding || DEFAULT_PADDING
					)
				);
			}
			return route;
		};
	})(joint, joint.g);

	(function(joint, util) {
		joint.shapes.standard.Link.define('mapping.Link', {
			z: -1,
			attrs: {
				line: {
					targetMarker: {
						type: 'path',
						fill: '#5755a1',
						d: 'M 10 -5 0 0 10 5 z'
					},
					sourceMarker: {
						type: 'path',
						fill: '#5755a1',
						d: 'M 0 -5 10 0 0 5 z'
					},
					stroke: 'gray'
				}
			},
			labels: [
				{
					markup: [
						{
							tagName: 'rect',
							selector: 'labelBody'
						},
						{
							tagName: 'text',
							selector: 'labelText'
						}
					],
					attrs: {
						labelText: {
							fill: '#7c68fc',
							fontSize: 10,
							textAnchor: 'middle',
							textVerticalAnchor: 'middle'
						},
						labelBody: {
							ref: 'labelText',
							refX: -2,
							refY: -2,
							refWidth: '100%',
							refHeight: '100%',
							refWidth2: 3,
							refHeight2: 2,
							stroke: '#7c68fc',
							fill: 'white',
							strokeWidth: 1,
							rx: 2,
							ry: 2
						}
					},
					position: {
						distance: 0.5,
						args: {
							keepGradient: true,
							ensureLegibility: true
						}
					}
				}
			]
		});

		joint.shapes.standard.HeaderedRecord.define(
			'mapping.Record',
			{
				itemHeight: 20,
				itemOffset: 15,
				itemMinLabelWidth: 110,
				padding: { top: 35, left: 10, right: 10, bottom: 5 },
				itemOverflow: true,
				attrs: {
					root: {
						magnet: false
					},
					header: {
						fill: '#f5f6fa',
						stroke: '#48b6e2',
						rx: 3,
						ry: 3
					},
					headerLabel: {
						fontSize: 12,
						textWrap: {
							ellipsis: true,
							height: 19
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
						cursor: 'pointer',
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
					},
					body: {
						stroke: '#48b6e2',
						rx: 3,
						ry: 3
					},

					itemTitle: {
						text: 'text',
						label: 'label'
					}
				}
			},
			{
				setName: function(name, opt) {
					this.attr(['headerLabel', 'textWrap', 'text'], name, opt);
				},

				setTitle(id, title) {
					this.attr([`itemLabel_${id}`, 'title'], title);
				},

				getDefaultItem: function() {
					return {
						id: util.uuid(),
						label: 'new_item',
						icon: 'images/document.svg'
					};
				},
				getItemTools: function() {
					return [{ action: 'edit', content: 'Edit Item' }];
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
			},
			{
				// attributes: {}
			}
		);

		joint.shapes.mapping.RecordView = joint.shapes.standard.RecordView;
	})(joint, joint.util);
}
