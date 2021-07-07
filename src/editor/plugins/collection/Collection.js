/**
 * @author lg<lirufei0808@gmail.com>
 * @date 3/5/20
 * @description
 */
import { options } from '../../lib/rappid/config'
import CollectionAttribute from './CollectionAttribute'
import { FORM_DATA_KEY } from '../../constants'
import i18n from '@/i18n'
import log from '../../../log'

export const collectionConfig = {
  type: 'app.Collection',
  shape: {
    extends: 'app.BaseElement',
    defaultInstanceProperties: {
      attrs: {
        image: {
          xlinkHref: 'static/editor/o-collection.svg'
        },
        label: {
          text: i18n.t('editor.cell.data_node.collection.name')
        }
      },
      [FORM_DATA_KEY]: {
        connectionId: '',
        name: '',
        freeTransform: false,
        type: 'collection'
      }
    },
    prototypeProperties: {
      portLabelMarkup: [
        {
          tagName: 'text',
          selector: 'portLabel'
        }
      ],
      isDataNode() {
        return true
      },

      /**
       * validate user-filled data
       * @param data
       *
       */
      validate: function (data) {
        data = data || this.getFormData()
        let name = this.attr('label/text')
        if (!data) throw new Error(`${name}: ${i18n.t('editor.cell.validate.none_setting')}`)
        if (!data.connectionId) throw new Error(`${name}: ${i18n.t('editor.cell.data_node.collection.none_database')}`)
        if (!data.tableName) throw new Error(`${name}: ${i18n.t('editor.cell.data_node.collection.none_collection')}`)
        // if (!data.primaryKeys)
        // 	throw new Error(`${name}: ${i18n.t('editor.cell.data_node.collection.none_pk')}`);
        return true
      },
      mergeOutputSchema(outputSchema) {
        let data = this.getFormData()
        log('collection.mergeOutputSchema', data, outputSchema)
        if (!outputSchema || !data) return outputSchema
        let fieldFilter = data.fieldFilter ? data.fieldFilter.split(',') : []
        if (fieldFilter.length === 0) return outputSchema
        let defaultFields = outputSchema.fields
        let newSchema = data.fieldFilterType === 'retainedField' ? [] : defaultFields
        fieldFilter.forEach(filedName => {
          let index = defaultFields.findIndex(f => filedName === f.field_name)
          if (index >= 0) {
            let field = defaultFields[index]
            if (data.fieldFilterType === 'retainedField') {
              newSchema.push(field)
              this.checkParent(defaultFields, field, newSchema)
            } else if (data.fieldFilterType === 'deleteField') {
              newSchema.splice(index, 1)
              this.checkChildren(fieldFilter, newSchema, field)
            }
          }
        })
        outputSchema.fields = newSchema
        log('collection.mergeOutputSchema', outputSchema)
        return outputSchema
      },

      checkParent(fields, field, schema) {
        if (field.parent && !schema.find(f => f.field_name === field.parent)) {
          let parentField = fields.find(f => f.field_name === field.parent)
          schema.push(parentField)
          this.checkParent(fields, parentField, schema)
        }
      },

      checkChildren(filter, schema, field) {
        let childrenFields = schema.filter(f => f.parent === field.field_name)
        if (childrenFields && childrenFields.length) {
          childrenFields.forEach(cf => {
            if (!filter.includes(cf.field_name)) {
              let index = schema.findIndex(f => f.field_name === cf.field_name)
              if (index >= 0) {
                let childField = schema[index]
                schema.splice(index, 1)
                this.checkChildren(filter, schema, childField)
              }
            }
          })
        }
      },

      /**
       * validate this allow connect to target
       * @param targetCell
       * @return {boolean}
       */
      allowTarget(targetCell) {
        return !['app.Database'].includes(targetCell.get('type'))
      },

      /**
       * validate accept source connection
       * @param sourceCell
       * @return {boolean}
       */
      allowSource(sourceCell) {
        return !['app.Database'].includes(sourceCell.get('type'))
      }
    }
    // staticProperties: {}
  },

  styleFormConfig: {
    inputs: {
      attrs: {
        label: {
          text: {
            type: 'content-editable',
            label: 'Text',
            group: 'text',
            index: 1
          },
          fontSize: {
            type: 'range',
            min: 5,
            max: 80,
            unit: 'px',
            label: 'Font size',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 2
          },
          fontFamily: {
            type: 'select-box',
            options: options.fontFamily,
            label: 'Font family',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 3
          },
          fontWeight: {
            type: 'select-box',
            options: options.fontWeight,
            label: 'Font thickness',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 4
          },
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'text',
            when: { ne: { 'attrs/label/text': '' } },
            index: 5
          }
        },
        body: {
          fill: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Fill',
            group: 'presentation',
            index: 1
          },
          stroke: {
            type: 'color-palette',
            options: options.colorPalette,
            label: 'Outline',
            group: 'presentation',
            index: 2
          },
          strokeWidth: {
            type: 'range',
            min: 0,
            max: 30,
            step: 1,
            defaultValue: 1,
            unit: 'px',
            label: 'Outline thickness',
            group: 'presentation',
            when: { ne: { 'attrs/body/stroke': 'transparent' } },
            index: 3
          },
          strokeDasharray: {
            type: 'select-box',
            options: options.strokeStyle,
            label: 'Outline style',
            group: 'presentation',
            when: {
              and: [{ ne: { 'attrs/body/stroke': 'transparent' } }, { ne: { 'attrs/body/strokeWidth': 0 } }]
            },
            index: 4
          }
        }
      }
    },
    groups: {
      presentation: {
        label: 'Presentation',
        index: 1
      },
      text: {
        label: 'Text',
        index: 2
      }
    }
  },

  /**
   * 配置显示到左侧图形列表中的图形默认样式
   * @type {object}
   */
  stencil: {
    /**
     * 左侧列表的分组名称，默认有：数据节点:data; 处理节点：process；标准图形：standard
     */
    group: 'data',
    /**
     * 界面显示的分组名称
     */
    // groupLabel: '',

    size: { width: 5, height: 4 },
    attrs: {
      root: {
        dataTooltip: i18n.t('editor.cell.data_node.collection.tip'),
        dataTooltipPosition: 'left',
        dataTooltipPositionSelector: '.joint-stencil'
      },
      body: {
        rx: 2,
        ry: 2,
        stroke: '#fff',
        fill: '#fff',
        strokeWidth: 0,
        strokeDasharray: '0'
      },
      image: {
        xlinkHref: 'static/editor/collection2.svg',
        refWidth: '60%',
        refHeight: '60%',
        refX: '2%',
        refY: '0%'
      },
      label: {
        text: i18n.t('editor.cell.data_node.collection.name'),
        textAnchor: 'middle',
        fill: '#666',
        fontFamily: 'Roboto Condensed',
        fontWeight: 'Normal',
        fontSize: 10,
        strokeWidth: 0,
        refX: '75%',
        refY: '40%',
        x: -32,
        y: 27
      }
    }
  },

  /**
   * 图形设置表单配置
   * @type {null}
   */
  settingFormConfig: {
    component: CollectionAttribute
  }
}
