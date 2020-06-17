export default function(joint) {
	let g = joint.g;
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
}
