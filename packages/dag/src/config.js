export default {
  enablePan: true,
  // 动态锚点、位置自适应
  Anchors: ['Top', 'TopCenter', 'Right', 'Bottom', 'BottomCenter', 'Left'],
  Anchor: ['Perimeter', { shape: 'Dot' }],
  Connector: [
    'Flowchart',
    { cornerRadius: 8, gap: 0, alwaysRespectStubs: true, stub: 15 },
  ],
  ConnectionOverlays: [
    [
      'PlainArrow',
      {
        location: 1,
        width: 8,
        length: 8,
      },
    ],
  ],
  // 鼠标不能拖动删除线
  DragOptions: { cursor: 'pointer', zIndex: 2000 },
  // 删除线的时候节点不删除
  ConnectionsDetachable: false,
  // 是否打开jsPlumb的内部日志记录
  DeleteEndpointsOnDetach: false,
  LogEnabled: true,
}
