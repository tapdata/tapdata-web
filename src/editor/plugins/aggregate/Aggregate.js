import { options } from '../../lib/rappid/config'
import AggregateAttribute from './AggregateAttribute'
import { FORM_DATA_KEY } from '../../constants'
import log from '../../../log'
import { uuid } from '../../util/Schema'
import _ from 'lodash'
import i18n from '@/i18n'

export const aggregateConfig = {
  type: 'app.Aggregate',
  shape: {
    extends: 'app.BaseElement',
    defaultInstanceProperties: {
      size: { width: 120, height: 28 },
      attrs: {
        image: {
          xlinkHref: 'static/editor/o-aggregator.svg',
          refWidth: '25%',
          refHeight: '84%',
          refX: '-8%',
          refY: '-28%'
        },
        body: {
          rx: 14,
          ry: 14
        },
        label: {
          text: i18n.t('editor.cell.processor.aggregate.name')
        },
        statusImage: {
          refWidth: '35%',
          refHeight: -15,
          refX: '70%',
          y: 8,
          visibility: 'hidden'
        }
      },
      [FORM_DATA_KEY]: {
        type: 'aggregation_processor',
        name: '',
        aggregations: []
      }
    },
    prototypeProperties: {
      portLabelMarkup: [
        {
          tagName: 'text',
          selector: 'portLabel'
        }
      ],
      initialize() {
        this.on('change:' + FORM_DATA_KEY, () => {
          this.updateOutputSchema()
        })
      },
      mergeOutputSchema(outputSchema) {
        let data = this.getFormData()
        log('aggregate.mergeOutputSchema', data, outputSchema)
        if (!outputSchema || !data) return

        let groupFields = []
        let functionNames = []
        data.aggregations.forEach(stage => {
          if (stage.groupByExpression) groupFields.push(...stage.groupByExpression)
          if (stage.aggFunction && !functionNames.includes(stage.aggFunction)) {
            functionNames.push(stage.aggFunction)
          }
        })

        let fields = outputSchema.fields || []
        outputSchema.fields = fields.filter(field => groupFields.includes(field.field_name)) || []

        functionNames.forEach(fnName => {
          outputSchema.fields.push(
            Object.assign(_.cloneDeep(fields[0] || {}), {
              field_name: fnName,
              data_type: 'DOUBLE',
              primary_key_position: 0,
              original_field_name: fnName,
              javaType: 'Double',
              autoincrement: false,
              id: uuid()
            })
          )
        })
        log('Aggregate.mergeOutputSchema', _.cloneDeep(fields), outputSchema)
        return outputSchema
      },

      isProcess() {
        return true
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
      },

      validate(data) {
        data = data || this.getFormData()
        let name = this.attr('label/text')
        if (!data) throw new Error(`${name}: ${i18n.t('editor.cell.validate.none_setting')}`)

        if (data.aggregations && data.aggregations.length === 0)
          throw new Error(`${name}: ${i18n.t('editor.cell.processor.aggregate.none_stage')}`)
        if (data.aggrCleanSecond < 3600)
          throw new Error(`${name}: ${i18n.t('editor.cell.processor.aggregate.cleanSecondTimeLess3600')}`)
        if (data.aggrFullSyncSecond < 3600)
          throw new Error(`${name}: ${i18n.t('editor.cell.processor.aggregate.fullSyncSecondTimeLess3600')}`)

        if (!data.name) throw new Error(`${name}: ${i18n.t('editor.cell.validate.empty_name')}`)
        let aggFunctionArr = []
        if (data.aggregations && data.aggregations.length > 0) {
          data.aggregations.forEach(item => {
            aggFunctionArr.push(item.name)
            if (!item.aggFunction)
              throw new Error(`${name}: ${i18n.t('editor.cell.processor.aggregate.none_function')}`)
            if (!item.groupByExpression)
              throw new Error(`${name}: ${i18n.t('editor.cell.processor.aggregate.none_group')}`)
            if (!item.aggExpression && item.aggFunction !== 'COUNT')
              throw new Error(`${name}: ${i18n.t('editor.cell.processor.aggregate.none_aggregation_expression')}`)
            if (!item.name)
              throw new Error(`${name}: ${i18n.t('editor.cell.processor.aggregate.none_subprocessingName')}`)
          })
        }
        if (new Set(aggFunctionArr).size !== aggFunctionArr.length)
          throw new Error(`${name}: ${i18n.t('editor.cell.processor.aggregate.name_notRepeated')}`)
        return true
      }
    }
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
     * 左侧列表的分组名称，默认有：数据节点:data; 处理节点：processor；标准图形：standard
     */
    group: 'processor',
    /**
     * 界面显示的分组名称
     */
    // groupLabel: '',

    size: { width: 5, height: 4 },
    attrs: {
      root: {
        dataTooltip: i18n.t('editor.cell.processor.aggregate.tip'),
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
        xlinkHref: 'static/editor/aggregator.svg',
        refWidth: '60%',
        refHeight: '60%',
        refX: '2%',
        refY: '0%'
      },
      label: {
        text: i18n.t('editor.cell.processor.aggregate.name'),
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
    component: AggregateAttribute
  }
}
