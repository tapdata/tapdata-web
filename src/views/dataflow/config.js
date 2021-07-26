export default {
  enablePan: true,
  // 动态锚点、位置自适应
  Anchors: ['Top', 'TopCenter', 'Right', 'Bottom', 'BottomCenter', 'Left'],
  Anchor: ['Perimeter', { shape: 'Dot' }],
  Connector: ['Flowchart', { cornerRadius: 8, gap: 5 }],
  DragOptions: { cursor: 'pointer', zIndex: 2000 },
  // 鼠标不能拖动删除线
  ConnectionsDetachable: false,
  // 删除线的时候节点不删除
  DeleteEndpointsOnDetach: false,
  // 是否打开jsPlumb的内部日志记录
  LogEnabled: true,
  ConnectionOverlays: [
    [
      'PlainArrow',
      {
        location: 1,
        width: 10,
        length: 10
      }
    ]
  ]
}
