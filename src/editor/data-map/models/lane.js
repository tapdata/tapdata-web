/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/30/20
 * @description
 */
import joint from "../../lib/rappid/rappid";

export default class Lane {
	constructor(props) {
		props = props || {};

		this.color = props.color || "#feb663";
		this.borderSize = props.borderSize || 3;
		this.opacity = props.opacity || 0.2;
		this.padding = props.borderSize || 10;

		this.title = props.title || "";
		this.titleHeight = props.titleHeight || 30;

		this.width = props.width || 100;
		this.height = props.height || 100;
		this.x = props.x || 10;
		this.y = props.y || 10;

		this.__title = this.createBoundary(this.color, 1);
		this.__body = this.createBoundary(this.color, this.borderSize);

		this.__title.text(this.title, {
			attrs: {
				"font-size": 18,
				fill: "#000",
				x: 50,
				y: 0
			}
		});

		this.updateLayout();
	}

	createBoundary(color, borderSize) {
		let boundary = joint.V("path").attr({
			fill: color,
			"fill-opacity": this.opacity,
			stroke: color,
			"stroke-width": borderSize || 1
		});

		return boundary;
	}

	createData(points, radius) {
		let origin = new joint.g.Line(points[0], points[points.length - 1]).midpoint();
		return joint.connectors.rounded(origin, origin, points, {
			radius: radius || 30
		});
	}

	updateLayout(){
		let points = [{
			x: this.x, y: this.y
		}, {
			x: this.x + this.width, y: this.y
		}, {
			x: this.x + this.width, y: this.y + this.height
		}, {
			x: this.x, y: this.y + this.height
		}];
		this.__body.attr("d", this.createData(points, 10));

		let titlePoints = [{
			x: points[0].x + this.padding,
			y: points[0].y + this.padding,
		}, {
			x: points[1].x - this.padding,
			y: points[1].y + this.padding,
		}, {
			x: points[1].x - this.padding,
			y: points[1].y + this.padding + this.titleHeight,
		}, {
			x: points[0].x + this.padding,
			y: points[0].y + this.padding + this.titleHeight,
		}];
		this.__title.attr("d", this.createData(titlePoints, 5));
	}

	/**
	 * {
	 *     w: 100, // width
	 *     h: 100, // height
	 *     x: 100, // x
	 *     y: 100, // y
	 * }
	 * @param bbox
	 */
	setBBox(bbox){
		Object.assign(this, bbox);
		this.updateLayout();
	}

	addTo(paper) {
		joint.V(paper.viewport).prepend(this.__body);
		joint.V(paper.viewport).prepend(this.__title);
	}

}
