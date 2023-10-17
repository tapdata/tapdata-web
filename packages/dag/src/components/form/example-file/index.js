import { $on, $off, $once, $emit } from '../../../../utils/gogocodeTransfer'
import * as Vue from 'vue'
import i18n from '@tap/i18n'
import { connect, mapProps, HighlightCode } from '@tap/form'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from '@vue/composition-api'
import './index.scss'
// import { Form, FormItem, Switch, Input, Checkbox, Radio} from '@formily/element'

export const ExpressionExample = connect(
  observer(
    defineComponent({
      props: ['loading', 'options'],

      watch: {
        example: {
          handler(v) {
            this.form.setValuesIn('Example', v)
            $emit(this, 'change', v)
            console.log('scripts', v) // eslint-disable-line
          },
        },
      },

      render() {
        return (
          <div class="font-color-light">
            <div class="fw-sub">
              {i18n.t('packages_form_example_file_index_biaodashishili')}
            </div>
            <p>{i18n.t('packages_form_example_file_index_shaixuanchusuiyi')}</p>
            <pre
              class="javascript bg-subtle rounded-4 px-1 mt-0 mb-2 overflow-x-auto"
              style="font-family:monospace;"
            >
              <span style="color: #009900;">&#40;</span>record.
              <span style="color: #660066;">gender</span>{' '}
              <span style="color: #339933;">==</span>{' '}
              <span style="color: #CC0000;">0</span>{' '}
              <span style="color: #339933;">&amp;&amp;</span> record.
              <span style="color: #660066;">age</span>{' '}
              <span style="color: #339933;">&gt;</span>{' '}
              <span style="color: #CC0000;">50</span>
              <span style="color: #009900;">&#41;</span>{' '}
              <span style="color: #339933;">||</span>{' '}
              <span style="color: #009900;">&#40;</span>record.
              <span style="color: #660066;">age</span>{' '}
              <span style="color: #339933;">&gt;=</span>{' '}
              <span style="color: #CC0000;">30</span>{' '}
              <span style="color: #339933;">&amp;&amp;</span> record.
              <span style="color: #660066;">salary</span>{' '}
              <span style="color: #339933;">&lt;=</span>{' '}
              <span style="color: #CC0000;">10000</span>
              <span style="color: #009900;">&#41;</span>
            </pre>
            <p>{i18n.t('packages_form_example_file_index_timestamp')}</p>
            <pre
              class="javascript bg-subtle rounded-4 px-1 mt-0 mb-2 overflow-x-auto"
              style="font-family:monospace;"
            >
              record.<span style="color: #660066;">CLAIM_DATE</span>.
              <span style="color: #660066;">getEpochSecond</span>
              <span style="color: #009900;">&#40;</span>
              <span style="color: #009900;">&#41;</span>
              <span style="color: #339933;">*</span>
              <span style="color: #CC0000;">1000</span>{' '}
              <span style="color: #339933;">&gt;=</span> DateUtil.
              <span style="color: #660066;">parse</span>
              <span style="color: #009900;">&#40;</span>
              <span style="color: #3366CC;">'2023-07-03 00:00:00'</span>
              <span style="color: #339933;">,</span>{' '}
              <span style="color: #CC0000;">8</span>
              <span style="color: #009900;">&#41;</span>.
              <span style="color: #660066;">getTime</span>
              <span style="color: #009900;">&#40;</span>
              <span style="color: #009900;">&#41;</span>
            </pre>
            <div class="fw-sub">
              {i18n.t('packages_form_example_file_index_zhichidefuhao')}
            </div>
            <table>
              <tr>
                <td style="width: 80px; text-align: center">
                  <span style="color: #f5af3f">&gt;, &lt;</span>
                  <span style="color: #f5af3f"></span>
                </td>
                <td style="width: 140px; text-align: left">
                  {i18n.t('packages_form_example_file_index_dayuxiaoyu')}
                </td>

                <td style="width: 80px; text-align: center">
                  <span style="color: #f5af3f">&gt;=, &lt;=</span>
                </td>
                <td style="width: 140px; text-align: left">
                  {i18n.t('packages_form_example_file_index_dayudengyuxiao')}
                </td>
              </tr>
              <tr>
                <td style="width: 60px; text-align: center">
                  <span style="color: #f5af3f">==</span>
                </td>
                <td style="width: 140px; text-align: left">
                  {i18n.t('packages_form_example_file_index_dengyu')}
                </td>

                <td style="width: 60px; text-align: center">
                  <span style="color: #f5af3f">!</span>
                </td>
                <td style="width: 140px; text-align: left">
                  {i18n.t('packages_form_example_file_index_fei')}
                </td>
              </tr>
              <tr>
                <td style="width: 60px; text-align: center">
                  <span style="color: #f5af3f">&&</span>
                </td>
                <td style="width: 140px; text-align: left">
                  {i18n.t('packages_form_example_file_index_qie')}
                </td>

                <td style="width: 60px; text-align: center">
                  <span style="color: #f5af3f">||</span>
                </td>
                <td style="width: 140px; text-align: left">
                  {i18n.t('packages_form_example_file_index_huo')}
                </td>
              </tr>
              <tr>
                <td style="width: 60px; text-align: center">
                  <span style="color: #f5af3f">/^.*$/.test( )</span>
                </td>
                <td style="width: 140px; text-align: left">
                  {i18n.t('packages_form_example_file_index_zhengzebiaodashi')}
                </td>

                <td style="width: 60px; text-align: center">
                  <span style="color: #f5af3f">( )</span>
                </td>
                <td style="width: 140px; text-align: left">
                  {i18n.t('packages_form_example_file_index_tiaojianfenzu')}
                </td>
              </tr>
            </table>
          </div>
        )
      },
    })
  ),
  mapProps({ dataSource: 'options' })
)

export default ExpressionExample
