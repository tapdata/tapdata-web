<template>
  <div>
    <el-button class="float-end" type="text" @click="visible = true">获取创建命令</el-button>
    <el-dialog :visible.sync="visible" width="50%" append-to-body :close-on-click-modal="false">
      <div slot="title">
        <span class="mr-2">创建命令</span>
        <ClipboardButton :tooltip="tooltip" :finishTooltip="finishTooltip" :content="sql"></ClipboardButton>
      </div>
      <CodeEditor class="border rounded-2" :value="sql" lang="javascript" :height="200" :options="options"></CodeEditor>
    </el-dialog>
  </div>
</template>

<script>
import CodeEditor from 'web-core/components/base/VCodeEditor'
import ClipboardButton from '../clipboard-button'

export default {
  name: 'ClipboardDialog',
  components: { CodeEditor, ClipboardButton },
  data() {
    return {
      visible: false,
      sql: 'CREATE TABLE Persons',
      tooltip: '复制创建命令',
      finishTooltip: '已复制',
      options: {
        readOnly: true
      }
    }
  }
}
</script>

<style scoped></style>
