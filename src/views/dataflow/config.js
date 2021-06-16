export default {
  enablePan: true,
  Anchor: ['Perimeter', { shape: 'Dot' }],
  Connector: ['Flowchart', { cornerRadius: 8, gap: 5 }],
  DragOptions: { cursor: 'pointer', zIndex: 2000 },
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
