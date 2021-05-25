const connectorPaintStyle = {
  strokeWidth: 2,
  stroke: '#a9b6c3',
  joinstyle: 'round',
  outlineStroke: 'transparent',
  outlineWidth: 2
}

const connectorHoverStyle = {
  stroke: '#1890ff'
}

export const connectorActiveStyle = {
  paintStyle: { strokeWidth: 2, stroke: '#1890ff' },
  hoverPaintStyle: { stroke: '#1890ff' },
  cssClass: 'connector-selected',
  overlays: []
}

const endpointHoverStyle = {
  stroke: '#40a9ff',
  fill: '#f0f7ff',
  radius: 7
}

export const targetEndpoint = {
  cssClass: 'targetPoint',
  isTarget: true,
  anchor: 'Left',
  endpoint: 'Dot',
  paintStyle: { stroke: '#dedee4', fill: '#FFF', radius: 5 },
  hoverPaintStyle: endpointHoverStyle,
  maxConnections: -1,
  dropOptions: {
    hoverClass: 'dropHover'
  }
}

export const sourceEndpoint = {
  cssClass: 'sourcePoint',
  connectorClass: 'cursor-pointer',
  isSource: true,
  anchor: 'Right',
  endpoint: 'Dot',
  maxConnections: -1,
  paintStyle: {
    cursor: 'pointer',
    stroke: '#dedee4',
    fill: '#FFF',
    radius: 5
  },
  connectorStyle: connectorPaintStyle,
  hoverPaintStyle: endpointHoverStyle,
  connectorHoverStyle
  // dragOptions: {}
}
