import { Dialog, Button } from 'element-ui'
import { observable } from '@formily/reactive'
import { observer } from '@formily/reactive-vue'
import { FragmentComponent } from '@formily/vue'
import { usePrefix, useTheme } from '../../../hooks'
import { TextWidget } from '../../widgets'
import { DataSettingPanel } from './DataSettingPanel'
import { TreePanel } from './TreePanel'
import { transformDataToValue, transformValueToData } from './shared'
import './styles.scss'
import { defineComponent, ref, watch } from 'vue-demi'

export const DataSourceSetter = observer(
  defineComponent({
    props: {
      value: {
        type: Array,
        default: () => []
      },
      allowTree: {
        type: Boolean,
        default: true
      },
      allowExtendOption: {
        type: Boolean,
        default: true
      },
      defaultOptionValue: {},
      effects: {}
    },
    setup: (props, { attrs, emit }) => {
      const { allowTree = true, allowExtendOption = true, defaultOptionValue, effects = () => {} } = props
      const theme = useTheme()
      const prefix = usePrefix('data-source-setter')
      const modalVisible = ref(false)
      const treeDataSource = observable({
        dataSource: transformValueToData(props.value),
        selectedKey: ''
      })

      watch(
        () => [props.value, modalVisible],
        () => {
          // eslint-disable-next-line
          console.log('watch.inner')
        }
      )
      /*const treeDataSource = computed(() => {
        console.log('modalVisible', modalVisible.value)
        return observable({
          dataSource: transformValueToData(props.value),
          selectedKey: ''
        })
      })*/
      // eslint-disable-next-line
      console.log('treeDataSource', treeDataSource)
      const openModal = () => (modalVisible.value = true)
      const closeModal = () => (modalVisible.value = false)

      return () => (
        <FragmentComponent>
          <Button block onClick={openModal}>
            <TextWidget token="SettingComponents.DataSourceSetter.configureDataSource" />
          </Button>
          <Dialog
            width="65%"
            bodyStyle={{ padding: 10 }}
            transitionName=""
            maskTransitionName=""
            visible={modalVisible.value}
            appendToBody={true}
            onClose={closeModal}
          >
            <span slot="title">
              <TextWidget token="SettingComponents.DataSourceSetter.configureDataSource" />
            </span>
            <div class={`${prefix} ${attrs.class} ${prefix + '-' + theme} ${prefix + '-layout'}`}>
              <div class={`${prefix + '-layout-item left'}`}>
                <TreePanel
                  defaultOptionValue={defaultOptionValue}
                  allowTree={allowTree}
                  treeDataSource={treeDataSource}
                />
              </div>
              <div class={`${prefix + '-layout-item right'}`}>
                <DataSettingPanel
                  allowExtendOption={allowExtendOption}
                  treeDataSource={treeDataSource}
                  effects={effects}
                />
              </div>
            </div>

            <span slot="footer" class="dialog-footer">
              <el-button onClick={closeModal}>取 消</el-button>
              <el-button
                type="primary"
                onClick={() => {
                  emit('change', transformDataToValue(treeDataSource.dataSource))
                  closeModal()
                }}
              >
                确 定
              </el-button>
            </span>
          </Dialog>
        </FragmentComponent>
      )
    }
  })
)
