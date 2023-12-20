import { defineComponent, ref } from 'vue'
import i18n from '@tap/i18n'
import { JsEditor } from '../../index'
import { GitBook } from '@tap/component'
import './style.scss'
export const JsEditorDialog = defineComponent({
  props: {
    value: String,
    beforeRegexp: String,
    after: {
      type: String,
      default: '',
    },
    afterRegexp: String,
    height: {
      type: [String, Number],
      default: 200,
    },
    disabled: Boolean,
    includeBeforeAndAfter: Boolean,
  },
  setup(props, { emit }) {
    const visible = ref(false)
    const webScript = ref('')
    const dialogScript = ref('')
    const doc = ref('')
    console.log('props!!!!!', props.value)
    webScript.value = props.value

    const handleOpenDialog = () => {
      console.log('handleOpenDialog')
      dialogScript.value = webScript.value
      visible.value = true
    }

    const handleCloseDialog = () => {
      console.log('handleOpenDialog')
      dialogScript.value = ''
      visible.value = false
    }

    const editScript = () => {
      dialogScript.value = webScript.value
      visible.value = true
    }

    const removeScript = () => {
      webScript.value = ''
      emit('change', webScript.value)
    }

    const submitScript = () => {
      console.log('submitScript', webScript.value, dialogScript.value)
      webScript.value = dialogScript.value
      emit('change', webScript.value)
      handleCloseDialog()
    }

    function onFocus() {
      bindEvent()
    }
    function onBlur(val) {
      if (val !== webScript.value) {
        if (props.includeBeforeAndAfter) {
          val = `${props.before}${val}${props.after}`
        }
        dialogScript.value = val
      }
      unbindEvent()
    }

    // 防止写代码时，不小心返回或者关闭页面
    function handleBeforeunload(ev) {
      ev.returnValue = ''
    }

    function bindEvent() {
      window.addEventListener('beforeunload', handleBeforeunload)
    }

    function unbindEvent() {
      window.removeEventListener('beforeunload', handleBeforeunload)
    }

    const loadDoc = () => {
      if (i18n.locale === 'en') {
        doc.value = `##### Advanced Verification Instructions
**The first step** The function input parameter is the source table data, you can call the **built-in function** according to the source table data to query the target data<br>
**Step 2** Custom verification logic<br>
**Step 3** The function returns the result<br>

- **result**: whether the verification is passed (passed: verification passed, failed: verification failed), if no or other characters are filled in, the verification fails, required <br>
- **message**: verification exception information, it is recommended to return if verification fails, optional<br>
- **data**: current verification target data, it is recommended to return if verification fails, optional<br>


Full Example: This is an example MongoDB query
\`\`\`\`javascript
function validate(sourceRow){
// step 1
var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
// step 2
if(sourceRow.USER_ID === targetRow[0].USER_ID){
// step 3
return {result: 'passed',message: "",data: ""}
}else{
return {result: 'failed', message: "Inconsistent records", data: targetRow}
}
}
\`\`\`\``
      } else if (i18n.locale === 'zh-TW') {
        doc.value = `##### 高級校驗說明
**第一步** 函數入參為源表數據，可以根據源表數據調用**內置函數**查詢出目標數據<br>
**第二步** 自定義校驗邏輯<br>
**第三步** 函數返回結果<br>

- **result**：是否通過校驗（passed：校驗通過，failed：校驗失敗），如果不填或填其它字符則校驗失敗，必填項<br>
- **message**：校驗異常信息，建議校驗失敗返回，選填項<br>
- **data**：當前校驗目標數據，建議校驗失敗返回，選填項<br>


完整示例：此為MongoDB查詢示例
\`\`\`javascript
function validate(sourceRow){
// 第1步
var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
// 第2步
if(sourceRow.USER_ID === targetRow[0].USER_ID){
// 第3步
return {result: 'passed',message: "",data: ""}
}else{
return {result: 'failed',message: "記錄不一致",data: targetRow}
}
}
\`\`\``
      } else {
        doc.value = `##### 高级校验说明
**第一步** 函数入参为源表数据，可以根据源表数据调用**内置函数**查询出目标数据<br>
**第二步** 自定义校验逻辑<br>
**第三步** 函数返回结果<br>

- **result**：是否通过校验（passed：校验通过，failed：校验失败），如果不填或填其它字符则校验失败，必填项<br>
- **message**：校验异常信息，建议校验失败返回，选填项<br>
- **data**：当前校验目标数据，建议校验失败返回，选填项<br>


完整示例：此为MongoDB查询示例
\`\`\`javascript
function validate(sourceRow){
// 第1步
var targetRow = target.executeQuery({database: "target",collection: "USER",filter: {USER_ID: sourceRow.USER_ID}});
// 第2步
if(sourceRow.USER_ID === targetRow[0].USER_ID){
// 第3步
return {result: 'passed',message: "",data: ""}
}else{
return {result: 'failed',message: "记录不一致",data: targetRow}
}
}
\`\`\`
`
      }
    }

    loadDoc()

    return () => {
      return (
        <div class="js-editor-dialog">
          {!webScript.value ? (
            <ElButton onClick={handleOpenDialog}>{i18n.t('packages_business_verification_addJS')}</ElButton>
          ) : (
            <div>
              <div>
                <ElLink type="primary" class="ml-4" onClick={editScript}>
                  {i18n.t('public_button_edit')}
                </ElLink>
                <ElLink type="primary" class="ml-4" onClick={removeScript}>
                  {i18n.t('public_button_delete')}
                </ElLink>
              </div>
              {/*<div v-html={webScript.value}></div>*/}
              <pre v-html={webScript.value} class="item-script"></pre>
            </div>
          )}

          <ElDialog
            title={i18n.t('packages_business_verification_JSVerifyLogic')}
            modelValue={visible.value}
            width="60%"
            // append-to-body
            // on={{
            //   'update:visible': (v) => {
            //     visible.value = v
            //   },
            // }}
          >
            <div class="js-wrap">
              <div class="jsBox">
                <div class="js-fixText">
                  <span style="color: #0000ff">function </span>
                  <span>{'validate(sourceRow){'}</span>
                </div>
                {/*<VCodeEditor v-model:value="webScript" height="500" class="js-editor"></VCodeEditor>*/}
                <JsEditor
                  value={dialogScript.value}
                  height={props.height}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  v-bind={props}
                ></JsEditor>
                <div class="js-fixText">{'}'}</div>
              </div>
              <GitBook value={doc.value} class="example ml-4 color-primary"></GitBook>
            </div>
            <div class="dialog-footer py-4 text-end">
              <ElButton onClick={handleCloseDialog}>{i18n.t('public_button_cancel')}</ElButton>
              <ElButton type="primary" onClick={submitScript}>
                {i18n.t('public_button_confirm')}
              </ElButton>
            </div>
          </ElDialog>
        </div>
      )
    }
  },
})
