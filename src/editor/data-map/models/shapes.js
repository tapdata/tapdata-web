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
		body: { fill: 'blue' },
		size: { width: 160, height: 50 },
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
		body: { fill: 'blue' },
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


	joint.shapes.standard.EmbeddedImage.define('dataMap.API', {
		// defaultAttributes
		body: { fill: 'blue' },
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
};

