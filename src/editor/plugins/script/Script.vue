<template>
  <div class="scriptNode">
    <div class="head-btns">
      <el-button
        v-if="disabled"
        class="e-button"
        type="primary"
        @click="seeMonitor"
      >
        {{$t("dataFlow.button.viewMonitoring")}}
      </el-button>
    </div>
    <el-form
      label-position="right"
      label-width="130px"
      :model="model"
      :disabled="disabled"
      ref="form"
    >
      <el-form-item
        :required="true"
        :label="$t('editor.cell.processor.script.form.name.label')"
        size="mini"
      >
        <el-input
          v-model="model.name"
          class="form-item-width"
          :placeholder="$t('editor.cell.processor.script.form.name.placeholder')"
        ></el-input>
      </el-form-item>

      <el-form-item
        :required="true"
        :label="$t('editor.cell.processor.script.form.type.label')"
        size="mini"
      >
        <el-select
          v-model="model.type"
          :placeholder="$t('editor.cell.processor.script.form.type.placeholder')"
          value="js_processor"
        >
          <el-option
            v-for="(item, idx) in scriptTypes"
            :label="item.label"
            :value="item.value"
            v-bind:key="idx"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        :required="true"
        :label="$t('editor.cell.processor.script.form.script.label')"
        size="mini"
      >
        <JsEditor
          :code.sync="model.script"
          ref="jsEditor"
          :width.sync="width"
        ></JsEditor>
        <!--						<el-input type="textarea" rows="10" v-model="model.script"></el-input>-->
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import JsEditor from "../../../components/JsEditor";
import log from "../../../log";
import { EditorEventType } from "../../lib/events";
let editorMonitor = null;
export default {
  name: "Script",
  components: { JsEditor },
  data() {
    return {
      disabled: false,
      scriptTypes: [
        {
          label: "JavaScript",
          value: "js_processor"
        },
        {
          label: "Java",
          value: "java_processor"
        }
      ],

      databases: [],
      rules: {
        connectionId: [
          {
            required: true,
            trigger: "blur",
            message: `Please select ${this.connection_type} database`
          }
        ]
      },
      model: {
        name: "JavaScript",
        type: "js_processor",
        script:
          "function process(record){\n\n\t// Enter you code at here\n\treturn record;\n}"
      },
      width: "500"
    };
  },
  mounted() {
    let self = this;
    self.$on(EditorEventType.RESIZE, width => {
      self.width = width;
    });
  },
  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit("dataChanged", this.getData());
      }
    }
  },

  methods: {
    setData(data, cell, isSourceDataNode, vueAdapter) {
      if (data) {
        Object.keys(data).forEach(key => (this.model[key] = data[key]));
        log("model script", this.model);
      }

      editorMonitor = vueAdapter.editor;
    },
    getData() {
      return JSON.parse(JSON.stringify(this.model));
    },

    setDisabled(disabled) {
      this.disabled = disabled;
    },

    seeMonitor() {
      editorMonitor.goBackMontior();
    }
  }
};
</script>

<style scoped>
.scriptNode {
	padding: 20px;
}
.form-item-width {
  width: 300px;
}
</style>
