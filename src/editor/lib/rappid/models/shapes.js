/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/29/20
 * @description
 */
import _ from 'lodash'
export default joint => {
  joint.shapes.standard.Rectangle.define(
    'app.SourceDB',
    {
      attrs: {
        root: {
          magnet: true
        }
      }
    },
    {
      portLabelMarkup: [
        {
          tagName: 'text',
          selector: 'portLabel'
        }
      ]
    }
  )
  joint.shapes.standard.Rectangle.define(
    'app.TargetDB',
    {
      attrs: {
        root: {
          magnet: true
        }
      }
    },
    {
      portLabelMarkup: [
        {
          tagName: 'text',
          selector: 'portLabel'
        }
      ]
    }
  )

  joint.shapes.standard.Link.define(
    'app.Link',
    {
      router: {
        name: 'normal'
      },
      connector: {
        name: 'rounded'
      },
      labels: [],
      attrs: {
        line: {
          stroke: '#8f8f8f',
          strokeDasharray: '0',
          strokeWidth: 2,
          fill: 'none',
          sourceMarker: {
            type: 'path',
            d: 'M 0 0 0 0',
            stroke: 'none'
          },
          targetMarker: {
            type: 'path',
            d: 'M 0 -5 -10 0 0 5 z',
            stroke: 'none'
          }
        }
      }
    },
    {
      defaultLabel: {
        attrs: {
          rect: {
            fill: '#ffffff',
            stroke: '#8f8f8f',
            strokeWidth: 1,
            refWidth: 10,
            refHeight: 10,
            refX: -5,
            refY: -5
          }
        }
      },

      getMarkerWidth: function (type) {
        var d = type === 'source' ? this.attr('line/sourceMarker/d') : this.attr('line/targetMarker/d')
        return this.getDataWidth(d)
      },

      getDataWidth: _.memoize(function (d) {
        return new joint.g.Path(d).bbox().width
      })
    },
    {
      connectionPoint: function (line, view, magnet, opt, type, linkView) {
        let markerWidth = linkView.model.getMarkerWidth(type)
        opt = { offset: markerWidth, stroke: true }
        // connection point for UML shapes lies on the root group containg all the shapes components
        let modelType = view.model.get('type')
        if (modelType.indexOf('uml') === 0) opt.selector = 'root'
        // taking the border stroke-width into account
        if (modelType === 'standard.InscribedImage') opt.selector = 'border'
        return joint.connectionPoints.boundary.call(this, line, view, magnet, opt, type, linkView)
      }
    }
  )
}
