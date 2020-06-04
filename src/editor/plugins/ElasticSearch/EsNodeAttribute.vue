<template>
  <div class="esNode nodeStyle">

    <head>
      <span
        class="headIcon iconfont icon-you2"
        type="primary"
      ></span>
      <span class="txt">{{ $t("editor.nodeSettings") }}</span>
    </head>
    <div class="nodeBody">
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
        class="e-form"
        label-position="top"
        :model="model"
        :disabled="disabled"
        ref="form"
      >
        <!-- <span class="addTxt">+新建文件</span> -->
        <el-form-item
          :label="$t('editor.cell.data_node.es.configurationES')"
          prop="connectionId"
          :rules="rules"
          required
        >
          <el-select
            filterable
            v-model="model.connectionId"
            :placeholder="$t('editor.cell.data_node.es.chooseESName')"
          >
            <el-option
              v-for="(item, idx) in databases"
              :label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
              :value="item.id"
              v-bind:key="idx"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div
        class="e-entity-wrap"
        style="text-align: center;"
      >
        <entity
          :schema="convertSchemaToTreeData(mergedSchema)"
          :editable="false"
        ></entity>
      </div>
    </div>
  </div>
</template>
<script>
import { convertSchemaToTreeData } from "../../util/Schema";
import Entity from "../link/Entity";
import _ from "lodash";
import factory from "../../../api/factory";
let connections = factory("connections");
let editorMonitor = null;
export default {
  name: "esNode",
  components: { Entity },
  props: {
    database_types: {
      type: Array,
      default: function() {
        return ["elasticsearch"];
      }
    }
  },

  data() {
    return {
      disabled: false,
      databases: [],
      rules: {
        connectionId: [
          {
            required: true,
            trigger: "blur",
            message: this.$t("editor.cell.data_node.es.chooseFileName")
          }
        ]
      },
      model: {
        connectionId: "",
        type: "elasticsearch"
      },
      mergedSchema: null
    };
  },

  async mounted() {
    let result = await connections.get({
      filter: JSON.stringify({
        where: {
          database_type: "elasticsearch"
        },
        fields: {
          name: 1,
          id: 1,
          database_type: 1,
          connection_type: 1,
          status: 1
        },
        order: "name ASC"
      })
    });

    if (result.data) {
      this.databases = result.data;
    }
  },

  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit("dataChanged", this.getData());
      }
    },
    mergedSchema: {
      handler() {
        if (
          !this.model.primaryKeys &&
          this.mergedSchema &&
          this.mergedSchema.fields &&
          this.mergedSchema.fields.length > 0
        ) {
          let primaryKeys = this.mergedSchema.fields
            .filter(f => f.primary_key_position > 0)
            .map(f => f.field_name);
          let unique = {};
          primaryKeys.forEach(key => (unique[key] = 1));
          primaryKeys = Object.keys(unique);
          if (primaryKeys.length > 0)
            this.model.primaryKeys = primaryKeys.join(",");
        }
      }
    }
  },

  methods: {
    convertSchemaToTreeData,

    async loadDataSource() {
      let result = await connections.get({
        filter: JSON.stringify({
          where: {
            database_type: { in: this.database_types }
          },
          fields: {
            name: 1,
            id: 1,
            database_type: 1,
            connection_type: 1,
            status: 1
          }
        })
      });

      if (result.data) {
        this.databases = result.data;
      }
    },

    loadDataModels(connectionId) {
      if (!connectionId) {
        return;
      }
      let self = this;
      connections.get([connectionId]).then(result => {
        if (result.data) {
          let schemas = (result.data.schema && result.data.schema.tables) || [];
          schemas = schemas.sort((t1, t2) =>
            t1.table_name > t2.table_name
              ? 1
              : t1.table_name === t2.table_name
              ? 0
              : -1
          );
          self.schemas = schemas;
        }
      });
    },

    handlerConnectionChange() {
      this.model.tableName = "";
      for (let i = 0; i < this.databases.length; i++) {
        if (this.model.connectionId === this.databases[i].id) {
          this.model.databaseType = this.databases[i]["database_type"];
        }
      }
    },

    setData(data, cell, isSourceDataNode, vueAdapter) {
      if (data) {
        Object.keys(data).forEach(key => (this.model[key] = data[key]));
      }

      this.mergedSchema = cell.getOutputSchema();
      cell.on("change:outputSchema", () => {
        this.mergedSchema = cell.getOutputSchema();
      });

      editorMonitor = vueAdapter.editor;
    },

    getData() {
      let result = _.cloneDeep(this.model);
      if (result.connectionId) {
        let database = this.databases.filter(
          db => db.id === result.connectionId
        );
        if (database && database.length > 0) {
          result.name = database[0].name;
        }
      }
      return result;
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
