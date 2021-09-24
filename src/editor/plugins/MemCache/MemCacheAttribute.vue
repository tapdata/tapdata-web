<template>
  <div class="e-memery-cache nodeStyle">
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form
        class="e-form"
        label-position="top"
        label-width="130px"
        :rules="rules"
        :disabled="disabled"
        :model="model"
        ref="form"
      >
        <el-form-item
          prop="cacheName"
          :required="true"
          :label="$t('editor.cell.data_node.memCache.form.cacheName.label')"
        >
          <el-input
            v-model.trim="model.cacheName"
            size="mini"
            :placeholder="$t('editor.cell.data_node.memCache.form.cacheName.placeholder')"
            @input="nameHandler"
          ></el-input>
        </el-form-item>
        <el-form-item
          prop="cacheKeys"
          :required="true"
          :label="$t('editor.cell.data_node.memCache.form.cacheKeys.label')"
        >
          <MultiSelection
            v-model="model.cacheKeys"
            :options="primaryKeyOptions"
            @change="handleCacheKey"
            :placeholder="$t('editor.cell.data_node.memCache.form.cacheKeys.placeholder')"
          ></MultiSelection>
        </el-form-item>
        <el-form-item :required="true">
          <div class="e-label" slot="label">
            <label class="el-form-item__label">{{ $t('dag_data_node_label_memcache_type') }}</label>
            <el-tooltip effect="dark" :content="$t('dag_data_node_label_memcache_type_tip')" placement="top">
              <!-- <div style="max-width: 300px" slot="content">
                {{ $t('dag_data_node_label_memcache_type_tip') }}
              </div> -->
              <span class="icon iconfont icon-tishi1" style="padding-left: 5px; vertical-align: bottom"></span>
            </el-tooltip>
          </div>
          <el-radio-group v-model="model.cacheType" size="mini">
            <el-radio label="all">{{ $t('dag_data_node_label_memcache_type_all') }}</el-radio>
            <el-radio label="local">{{ $t('dag_data_node_label_memcache_type_local') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :required="true" :label="$t('editor.cell.data_node.memCache.form.maxSize.label')">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-select
                size="mini"
                v-model="maxSizeLimited"
                :placeholder="$t('editor.cell.data_node.memCache.form.maxSize.placeholder')"
                @change="maxSizeLimitedHandler"
              >
                <el-option
                  v-for="opt in sizeLimitedOptions"
                  :key="opt.label"
                  :label="opt.label"
                  :value="opt.value"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-input
                v-show="maxSizeLimited < 0"
                type="tel"
                v-model="model.maxSize"
                size="mini"
                maxlength="8"
                :placeholder="$t('editor.cell.data_node.memCache.form.maxSize.placeholder')"
              >
                <template slot="append">M</template>
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item :required="true" :label="$t('editor.cell.data_node.memCache.form.maxRows.label')">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-select
                size="mini"
                v-model="maxRowsLimited"
                :placeholder="$t('editor.cell.data_node.memCache.form.maxRows.placeholder')"
                @change="maxRowLimitedHancler"
              >
                <el-option
                  :label="$t('editor.cell.data_node.memCache.form.maxRows.options.custom')"
                  :value="true"
                ></el-option>
                <el-option
                  :label="$t('editor.cell.data_node.memCache.form.maxRows.options.unlimited')"
                  :value="false"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-input
                v-show="maxRowsLimited"
                type="number"
                v-model="model.maxRows"
                size="mini"
                :placeholder="$t('editor.cell.data_node.memCache.form.maxRows.placeholder')"
              >
                <template slot="append">{{ $t('editor.cell.data_node.memCache.form.maxRows.unit') }}</template>
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
        <div class="code-template">
          <label>{{ $t('editor.cell.data_node.memCache.applicationCode') }}:</label>
          <div class="code">
            <span class="color-primary">var</span> cachedRow = CacheService.getCache(
            <span class="color-danger">'{{ model.cacheName || 'cachename' }}'</span>
            <template v-if="!model.cacheKeys || !model.cacheKeys.length">
              ,<span class="bold">record</span>.<span class="color-danger">category_code</span>
            </template>
            <span v-for="key in model.cacheKeys.split(',')" :key="key">
              <template v-if="key">
                , <span class="bold">record</span>.<span class="color-danger">{{ key }}</span>
              </template>
            </span>
            );<br />
            <span class="bold">record</span>.category_name = cachedRow.category_name;<br />
          </div>
          <span>OR</span>
          <div class="code">
            <span class="bold">record</span>.category_name = CacheService.getCacheItem(
            <span class="color-danger">'{{ model.cacheName || 'cachename' }}'</span>, <span>'category_name'</span>,
            defaultValue
            <span v-for="key in model.cacheKeys.split(',')" :key="key">
              <template v-if="key">
                ,<span class="bold">record</span>.<span class="color-danger">{{ key }}</span>
              </template>
            </span>
            );
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
// import { convertSchemaToTreeData, mergeJoinTablesToTargetSchema } from "../../util/Schema";
import MultiSelection from '../../../components/MultiSelection'
// import log from '../../../log';
import _ from 'lodash'
import { removeDeleted } from '../../util/Schema'
// let editorMonitor = null;
export default {
  name: 'memCache',
  components: { MultiSelection },

  data() {
    return {
      disabled: false,
      databases: [],

      sizeLimitedOptions: [
        { label: '50M', value: 50 },
        { label: '100M', value: 100 },
        { label: '200M', value: 200 },
        { label: '512M', value: 512 },
        { label: '1G', value: 1024 },
        { label: '10G', value: 1024 * 10 },
        { label: '50G', value: 1024 * 50 },
        { label: '100G', value: 1024 * 100 },
        { label: '200G', value: 1024 * 200 },
        {
          label: this.$t('editor.cell.data_node.memCache.form.maxSize.options.unlimited'),
          value: 0
        },
        {
          label: this.$t('editor.cell.data_node.memCache.form.maxSize.options.custom'),
          value: -1
        }
      ],
      model: {
        type: 'mem_cache',
        name: '',
        cacheName: '',
        cacheType: 'all',
        cacheKeys: '',
        maxSize: 50,
        maxRows: 10000,
        cacheConnectionId: '',
        cacheTableName: ''
      },
      vueAdapter: null,
      primaryKeyOptions: [],
      maxSizeLimited: 0,
      maxRowsLimited: 0,
      rules: {
        cacheName: [
          { required: true, trigger: 'blur', message: this.$t('editor.cell.data_node.memCache.form.cacheName.none') }
        ],
        cacheKeys: {
          required: true,
          trigger: 'blur',
          message: this.$t('editor.cell.data_node.memCache.form.cacheKeys.none')
        }
      }
    }
  },

  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
      }
    }
    // 'model.cacheKeys': {
    //   deep: true,
    //   handler(val) {
    //     this.handelDuplicate(this.vueAdapter, '', val)
    //   }
    // }
  },

  methods: {
    setData(data, cell, isSourceDataNode, vueAdapter) {
      this.vueAdapter = vueAdapter
      if (data) {
        _.merge(this.model, data)
        this.setLimited(data.maxSize)
        this.maxRowsLimited = data.maxRows > 0
      }
      let schema = cell.getInputSchema()[0]
      let cacheKeys = this.model.cacheKeys
      if (schema && schema.sourceSchema) {
        if (!this.model.name) {
          this.model.name = this.model.cacheName = schema.tableName
        }
        let fields = schema.sourceSchema.fields || []
        if (fields) {
          fields = removeDeleted(fields)
        }
        this.primaryKeyOptions = fields.map(f => f.field_name)
        if (!cacheKeys) {
          let primaryKeys = fields
            .filter(f => f.primary_key_position > 0)
            .map(f => f.field_name)
            .join(',')
          this.model.cacheKeys = primaryKeys || this.primaryKeyOptions[0] || ''
        }

        // if (!window.App.$route.query.id) {
        this.handelDuplicate(vueAdapter)
        // }
      }
      // this.cacheMap = map
      // this.config.items.find(it => it.field === 'cacheId').options = cacheList

      // editorMonitor = vueAdapter.editor;
    },
    // 重复
    handelDuplicate(vueAdapter, cacheName, cacheKeys) {
      let dataCells = vueAdapter.editor.getAllCells()
      let dataflow = vueAdapter.editor.scope.getDataFlowData()
      let cacheList = []
      // 获取当前所有缓存节点数据
      dataCells.forEach(item => {
        let attr = item.attributes
        if (attr.type === 'app.MemCache') {
          let formData = item.getFormData()
          cacheList.push({
            name: cacheName || formData.name,
            cacheKeys: cacheKeys || formData.cacheKeys,
            tableName: formData.cacheTableName,
            connectionId: formData.cacheConnectionId
          })
        }
      })
      // 判断当前缓存节点是否有重命名或重复键值
      let nameData = []
      let keyData = []
      let keygroupBy = []
      const map = new Map()
      cacheList.forEach(v => {
        if (map.get(v.name) && nameData.every(nD => nD.name != v.name)) {
          nameData.push(v)
        } else {
          map.set(v.name, v)
        }
        let key = v.connectionId + v.tableName + v.cacheKeys
        keygroupBy.push({
          name: v.name,
          connectionId: v.connectionId,
          tableName: v.tableName,
          cacheKeys: v.cacheKeys,
          key: key
        })
      })
      // 获取缓存节点同数据源同表同缓存值的值
      for (let i = 0; i < keygroupBy.length - 1; i++) {
        for (let j = 0; j < keygroupBy.length - 1; j++) {
          if (i !== j && keygroupBy[i].key === keygroupBy[j].key) {
            keyData.push(keygroupBy[i])
            break
          }
        }
      }
      if (nameData.length) {
        let name = []
        nameData.filter(n => {
          if (n.name !== this.model.name) {
            name.push(n.name)
          }
        })
        if (name.length) {
          this.handleconfirm(name.join(','), dataflow.name)
        }
      } else if (keyData.length) {
        let name = []
        keyData.filter(n => {
          if (n.name && n.name !== this.model.name) {
            name.push(n.name)
          }
        })
        if (name.length) {
          this.handleconfirm(name.join(','), dataflow.name)
        }
      }
      console.log('------', nameData, keyData, keygroupBy, dataflow, window.App.$route.query)
      // handleconfirm(res.data[0].name, res.data[0].name)
      let where = {
        or: [
          { 'stages.type': 'mem_cache', 'stages.name': this.model.name },
          {
            'stages.type': 'mem_cache',
            'stages.cacheKeys': this.model.cacheKeys,
            'stages.connectionId': this.model.cacheConnectionId,
            'stages.tableName': this.model.cacheCocacheTableNamennectionId
          }
        ]
      }
      if ((dataflow && dataflow.id) || window.App.$route.query.id) {
        let id = dataflow && dataflow.id ? dataflow.id : window.App.$route.query && window.App.$route.query.id
        where.id = { neq: id }
      }
      let filter = {
        where
      }

      this.$api('DataFlows')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          if (res?.data?.length) {
            let taskName = res.data.map(name => {
              return name.name
            })
            this.handleconfirm(this.model.cacheName, taskName.join(','))
          }
        })
    },
    handleCacheKey() {
      this.handelDuplicate(this.vueAdapter, '', this.model.cacheKeys)
    },
    handleconfirm(name, task) {
      if (name || task) {
        const h = this.$createElement
        let strArr = this.$t('task_job_tip_text').split('xxx')
        let taskArr = strArr[1].split('###')
        let msg = h('p', null, [
          strArr[0],
          h(
            'span',
            {
              class: 'color-primary'
            },
            name
          ),
          taskArr[0],
          h(
            'span',
            {
              class: 'color-primary'
            },
            task
          ),
          taskArr[1]
        ])
        // let message = h('p', [
        //   this.$t('message.deleteOrNot') + ' ',
        //   h('span', { style: { color: '#409EFF' } }, item.clientName)
        // ])
        this.$confirm(msg, this.$t('task_job_setting_tip_title'), {
          type: 'warning'
        })
      }
    },

    getData() {
      return _.cloneDeep(this.model)
    },

    setLimited(val) {
      let option = this.sizeLimitedOptions.find(opt => opt.value === val)
      this.maxSizeLimited = option ? val : -1
    },

    nameHandler(val) {
      this.model.name = val
      this.handelDuplicate(this.vueAdapter, val, '')
    },

    maxSizeLimitedHandler(value) {
      if (value < 0) {
        this.model.maxSize = 50
      } else {
        this.model.maxSize = value
      }
    },
    maxRowLimitedHancler(limited) {
      if (limited) {
        this.model.maxRows = 10000
      } else {
        this.model.maxRows = 0
      }
    },

    setDisabled(disabled) {
      this.disabled = disabled
    }

    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // }
  }
}
</script>

<style lang="scss" scoped>
.e-memery-cache {
  .code-template {
    margin-top: 20px;
    line-height: 30px;
    font-size: 12px;
    color: #333;
    .code {
      padding: 5px 15px;
      background: #fff;
      overflow-x: auto;
      white-space: nowrap;
      .color-primary {
        color: #409eff;
      }
      .color-danger {
        color: #ee5353;
      }
      .bold {
        font-weight: bold;
      }
    }
  }
}
</style>
