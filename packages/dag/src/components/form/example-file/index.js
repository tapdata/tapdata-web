import i18n from '@tap/i18n'
import { connect, mapProps } from '@formily/vue'
import { observer } from '@formily/reactive-vue'
import { defineComponent } from '@vue/composition-api'
import './index.scss'
// import * as components from 'web-core/components/form'
// import { Form, FormItem, Switch, Input, Checkbox, Radio} from '@formily/element'

export const ExpressionExample = connect(
  observer(
    defineComponent({
      props: ['loading', 'options'],

      watch: {
        example: {
          handler(v) {
            this.form.setValuesIn('Example', v)
            this.$emit('change', v)
            console.log('scripts', v) // eslint-disable-line
          }
        }
      },

      render() {
        // eslint-disable-next-line no-console
        console.log('################')
        return (
          <div class="expression">
            <div style="color: #888888; font-size: 12px">
              <h3 style="font-size: 14px; font-weight: bold">
                {' '}
                {i18n.t('packages_form_example_file_index_biaodashishili')}
              </h3>
              <p style="text-indent: 2em">{i18n.t('packages_form_example_file_index_shaixuanchusuiyi')}</p>
              <p style="text-indent: 2em">
                <span style="color: red">(</span> record.gender <span style="color: #f5af3f">==</span> 0
                <span style="color: #f5af3f">&&</span> record.age <span style="color: #f5af3f">&gt;</span> 50
                <span style="color: red">)</span>
                <span style="color: #f5af3f"> || </span>
                <span style="color: red">(</span> record.age <span style="color: #f5af3f">&gt;=</span> 30
                <span style="color: #f5af3f">&&</span> record.salary <span style="color: #f5af3f">&lt;=</span> 10000
                <span style="color: red">)</span>
              </p>

              <h3 style="font-size: 14px; font-weight: bold">
                {i18n.t('packages_form_example_file_index_zhichidefuhao')}
              </h3>
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
                  <td style="width: 140px; text-align: left">{i18n.t('packages_form_example_file_index_dengyu')}</td>

                  <td style="width: 60px; text-align: center">
                    <span style="color: #f5af3f">!</span>
                  </td>
                  <td style="width: 140px; text-align: left">{i18n.t('packages_form_example_file_index_fei')}</td>
                </tr>
                <tr>
                  <td style="width: 60px; text-align: center">
                    <span style="color: #f5af3f">&&</span>
                  </td>
                  <td style="width: 140px; text-align: left">{i18n.t('packages_form_example_file_index_qie')}</td>

                  <td style="width: 60px; text-align: center">
                    <span style="color: #f5af3f">||</span>
                  </td>
                  <td style="width: 140px; text-align: left">{i18n.t('packages_form_example_file_index_huo')}</td>
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
          </div>
        )
      }
    })
  ),
  mapProps({ dataSource: 'options' })
)

export default ExpressionExample
