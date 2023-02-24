export const connectorActiveStyle = {
  paintStyle: { strokeWidth: 1, stroke: '#fa6303' },
  hoverPaintStyle: { stroke: '#fa6303' },
  cssClass: 'connector-selected',
  overlays: []
}

export const targetEndpoint = {
  cssClass: 'targetPoint',
  isTarget: true,
  anchor: 'Left',
  endpoint: 'Blank',
  maxConnections: -1,
  paintStyle: {
    cursor: 'pointer',
    stroke: '#dedee4',
    fill: '#FFF',
    radius: 6
  },
  hoverPaintStyle: {
    stroke: '#2c65ff',
    fill: '#f0f7ff',
    radius: 8
  },
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
    // stroke: '#9f9f9f',
    // fill: '#FFF',
    stroke: 'transparent',
    fill: 'transparent',
    radius: 6
  },
  hoverPaintStyle: {
    stroke: '#2c65ff',
    fill: '#f0f7ff',
    radius: 8
  },
  connectorStyle: {
    strokeWidth: 1.5,
    stroke: '#9f9f9f',
    outlineStroke: 'transparent',
    outlineWidth: 1.5
  },
  connectorHoverStyle: {
    stroke: '#2c65ff'
  }
}
