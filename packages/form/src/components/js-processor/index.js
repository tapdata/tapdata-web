import { defineComponent, ref } from 'vue-demi'
import { FormLayout, FormItem, JsEditor } from '../index'
import { VCodeEditor } from '@tap/component'

export const JsProcessor = defineComponent({
  props: ['value'],
  setup(props, { emit }) {
    const inputRef = ref(JSON.stringify({ table: {} }), null, 2)
    const outputRef = ref('')
    return () => {
      return (
        <div class="js-processor">
          <FormItem.BaseItem label="脚本">
            <JsEditor
              value={props.value}
              onChange={val => {
                emit('change', val)
              }}
              height={350}
              options={{ showPrintMargin: false, useWrapMode: true }}
            ></JsEditor>
          </FormItem.BaseItem>

          <div class="text-end mb-2">
            <ElButton type="primary" size="small">
              试运行
            </ElButton>
          </div>

          <div class="flex align-center mb-2">
            <div class="flex align-center flex-1 mr-4">
              <div>调试输入</div>
              <ElInputNumber class="mx-4" controls-position="right"></ElInputNumber>
              <ElButton type="text" size="small">
                获取数据
              </ElButton>
            </div>
            <div class="flex-1">结果输出</div>
          </div>
          <div class="flex align-center">
            <div class="flex-1 mr-4">
              <VCodeEditor value={inputRef.value} lang="json" height={450}></VCodeEditor>
            </div>
            <div class="flex-1">
              <VCodeEditor lang="json" height={450}></VCodeEditor>
            </div>
          </div>
        </div>
      )
    }
  }
})
