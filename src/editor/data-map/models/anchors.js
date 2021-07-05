export default function (joint) {
  joint.anchors.mapping = function (view, magnet, ref) {
    var anchor
    var model = view.model
    var bbox = view.getNodeUnrotatedBBox(magnet)
    var center = model.getBBox().center()
    var angle = model.angle()
    var side = model.getItemSide(view.findAttribute('item-id', magnet))
    if (side === 'left') {
      anchor = bbox.leftMiddle()
    } else if (side === 'right') {
      anchor = bbox.rightMiddle()
    } else {
      var refPoint = ref
      if (ref instanceof Element) {
        var refView = this.paper.findView(ref)
        refPoint = refView ? refView.getNodeBBox(ref).center() : new joint.g.Point()
      }
      refPoint.rotate(center, angle)
      anchor = refPoint.x <= bbox.x + bbox.width / 2 ? bbox.leftMiddle() : bbox.rightMiddle()
    }
    return anchor.rotate(center, -angle)
  }
}
