/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/30/20
 * @description
 */
export default (joint) => {

	joint.shapes.standard.Rectangle.define('dataMap.Tapdata', {
		// defaultAttributes
		size: { width: 160, height: 80 },
		attrs: {
			body: {
				fill: "#8eb0d5",
				stroke: "#000000",
				strokeWidth: 1,
				rx: 5,
				ry: 5,
			},
			label: {
				fontSize: 18,
				text: "Tapdata"
			}
		}
	}, {
		// prototype properties
	}, {
		// staticProperties
	});

	joint.shapes.standard.EmbeddedImage.define('dataMap.Classification', {
		// defaultAttributes
		size: { width: 200, height: 80 },
		attrs: {
			image: {
				xlinkHref: "static/editor/o-DB.svg",
				refWidth: "19%",
				refHeight: "82%",
				refX: "-4%",
				refY: "-7%"
			},
			body: {
				fill: "#e699ab",
				stroke: "#000000",
				strokeWidth: 1,
				rx: 5,
				ry: 5,
				refWidth: "100%",
				refHeight: "100%"
			},
			label: {
				text: "Classification",
				textVerticalAnchor: "middle",
				textAnchor: "left",
				refX: "10%",
				refY: "50%",
				fontSize: 12,
				fill: "#333333",
				x: 0,
				y: 0
			}
		}
	});

	joint.shapes.standard.EmbeddedImage.define('dataMap.Database', {
		// defaultAttributes
		size: { width: 160, height: 30 },
		attrs: {
			image: {
				xlinkHref: "static/editor/o-DB.svg",
				refWidth: "19%",
				refHeight: "82%",
				refX: "-4%",
				refY: "-23%"
			},
			body: {
				fill: "#f2ca90",
				stroke: "#000000",
				strokeWidth: 1,
				rx: 5,
				ry: 5,
				refWidth: "100%",
				refHeight: "100%"
			},
			label: {
				text: "Database",
				textVerticalAnchor: "middle",
				textAnchor: "left",
				refX: "10%",
				refY: "50%",
				fontSize: 12,
				fill: "#333333",
				x: 0,
				y: 0
			}
		}
	});

	joint.shapes.standard.EmbeddedImage.define('dataMap.Table', {
		// defaultAttributes
		size: { width: 160, height: 30 },
		attrs: {
			image: {
				xlinkHref: "static/editor/o-table.svg",
				refWidth: "19%",
				refHeight: "82%",
				refX: "-4%",
				refY: "-23%"
			},
			body: {
				fill: "#f2ca90",
				stroke: "#000000",
				strokeWidth: 1,
				rx: 5,
				ry: 5,
				refWidth: "100%",
				refHeight: "100%"
			},
			label: {
				text: "Database",
				textVerticalAnchor: "middle",
				textAnchor: "left",
				refX: "10%",
				refY: "50%",
				fontSize: 12,
				fill: "#333333",
				x: 0,
				y: 0
			}
		}
	});

	joint.shapes.standard.EmbeddedImage.define('dataMap.Model', {
		// defaultAttributes
		size: { width: 160, height: 30 },
		attrs: {
			image: {
				xlinkHref: "static/editor/o-table.svg",
				refWidth: "19%",
				refHeight: "82%",
				refX: "-4%",
				refY: "-23%"
			},
			body: {
				fill: "#f2ca90",
				stroke: "#000000",
				strokeWidth: 1,
				rx: 5,
				ry: 5,
				refWidth: "100%",
				refHeight: "100%"
			},
			label: {
				text: "Database",
				textVerticalAnchor: "middle",
				textAnchor: "left",
				refX: "10%",
				refY: "50%",
				fontSize: 12,
				fill: "#333333",
				x: 0,
				y: 0
			}
		}
	});


	joint.shapes.standard.EmbeddedImage.define('dataMap.API', {
		// defaultAttributes
		size: { width: 160, height: 30 },
		attrs: {
			image: {
				xlinkHref: "static/editor/API-target1.svg",
				refWidth: "19%",
				refHeight: "82%",
				refX: "-4%",
				refY: "-23%"
			},
			body: {
				fill: "#b6a5c5",
				stroke: "#000000",
				strokeWidth: 1,
				rx: 5,
				ry: 5,
				refWidth: "100%",
				refHeight: "100%"
			},
			label: {
				text: "Database",
				textVerticalAnchor: "middle",
				textAnchor: "left",
				refX: "10%",
				refY: "50%",
				fontSize: 12,
				fill: "#333333",
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
				fill: "#feb663",
				"fill-opacity": 0.2,
				stroke: "#feb663",
				"stroke-width": 1,
				rx: 5,
				ry: 5
			},
			body: {
				rx: 5,
				ry: 5,
				fill: "#feb663",
				"fill-opacity": 0.2,
				stroke: "#feb663",
				"stroke-width": 3
			}
		}
	}, null, {
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
	});

	joint.shapes.standard.Link.define('dataMap.Link', {
		attrs: {
			line: {
				stroke: "#8f8f8f",
				strokeDasharray: "0",
				strokeWidth: 2,
				fill: "none",
				sourceMarker: {
					type: "path",
					d: "M 0 0 0 0",
					stroke: "none"
				},
				targetMarker: {
					type: "path",
					d: "M 0 -5 -10 0 0 5 z",
					stroke: "none"
				}
			}
		}
	});
};

