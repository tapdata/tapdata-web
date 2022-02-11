<template>
  <el-container>
    <el-main>
      <el-row justify="center" type="flex">
        <el-col :span="12">
          <el-card class="node-form-card">
            <div slot="header" class="clearfix">
              <div class="flex align-center">新增节点 <el-tag class="ml-2" size="small">Alpha</el-tag></div>
            </div>
            <el-form label-position="left" label-width="100px" :model="form" :rules="rules" ref="form">
              <el-form-item prop="name" required label="节点名称">
                <el-input v-model="form.name" placeholder="请输入名称"></el-input>
              </el-form-item>
              <el-form-item prop="icon" required label="节点图标">
                <el-select v-model="form.icon" placeholder="请选择图标" class="icon-select">
                  <template #prefix v-if="form.icon">
                    <div class="flex align-center h-100">
                      <ElImage
                        style="width: 30px; height: 24px"
                        draggable="false"
                        class="lh-1"
                        :src="`static/editor/${form.icon}.svg`"
                      ></ElImage>
                    </div>
                  </template>
                  <el-option v-for="(item, i) in iconOptions" :key="i" :value="item.value">
                    <div class="flex align-center h-100">
                      <ElImage
                        draggable="false"
                        class="node-item-img"
                        :src="`static/editor/${item.value}.svg`"
                      ></ElImage>
                      <div class="node-item-txt ml-1">{{ item.value }}</div>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="所属组">
                <el-select v-model="form.group">
                  <el-option label="数据节点" value="data" />
                  <el-option label="处理节点" value="process" />
                </el-select>
              </el-form-item>
              <el-form-item prop="type" required label="节点类型">
                <el-select v-model="form.type">
                  <el-option label="数据库" value="database"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="attr.databaseType" required v-if="form.type === 'database'" label="数据库类型">
                <el-select
                  v-model="form.attr.databaseType"
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择数据库类型"
                >
                  <el-option
                    v-for="(item, i) in databaseOptions"
                    :key="i"
                    :label="item.name"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="attr.formSchema" label="节点表单Schema">
                <CodeEditor
                  v-model="form.attr.formSchema"
                  height="300px"
                  lang="json"
                  :options="{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true
                  }"
                  @init="editorInit"
                ></CodeEditor>
              </el-form-item>

              <el-form-item prop="attr.linkFormSchema" label="连线表单Schema">
                <CodeEditor
                  v-model="form.attr.linkFormSchema"
                  height="300px"
                  lang="json"
                  :options="{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true
                  }"
                  @init="editorInit"
                ></CodeEditor>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="onSubmit">立即创建</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import CodeEditor from '@/components/CodeEditor'
export default {
  name: 'AddNode',
  components: { CodeEditor },
  data() {
    return {
      databaseOptions: [
        {
          name: 'DB2',
          value: 'db2'
        },
        {
          name: 'GBase 8s',
          value: 'gbase-8s'
        },
        {
          name: 'Kafka',
          value: 'kafka'
        },
        {
          name: 'MariaDB',
          value: 'mariadb'
        },
        {
          name: 'MongoDB',
          value: 'mongodb'
        },
        {
          name: 'MySQL',
          value: 'mysql'
        },
        {
          name: 'Mysql PXC',
          value: 'mysql pxc'
        },
        {
          name: 'Oracle',
          value: 'oracle'
        },
        {
          name: 'Postgres',
          value: 'postgres'
        },
        {
          name: 'SQL Server',
          value: 'sqlserver'
        },
        {
          name: 'Sybase ASE',
          value: 'sybase ase'
        }
      ],
      iconOptions: [
        {
          name: 'DB2',
          value: 'db2'
        },
        {
          name: 'GBase 8s',
          value: 'gbase'
        },
        {
          name: 'Kafka',
          value: 'wKafka'
        },
        {
          name: 'MariaDB',
          value: 'maria'
        },
        {
          name: 'MongoDB',
          value: 'mongo'
        },
        {
          name: 'MySQL',
          value: 'mysql'
        },
        {
          name: 'Mysql PXC',
          value: 'mysqlpxc'
        },
        {
          name: 'Oracle',
          value: 'ora2'
        },
        {
          name: 'Postgres',
          value: 'pg'
        },
        {
          name: 'SQL Server',
          value: 'sqlserver'
        },
        {
          name: 'Sybase ASE',
          value: 'sybase'
        }
      ],
      form: {
        name: '',
        icon: '',
        group: 'data',
        type: '',
        constructor: 'Database',
        attr: {
          databaseType: '',
          formSchema: '',
          linkFormSchema: ''
        }
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        icon: [{ required: true, message: '请选择图标', trigger: 'change' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      }
    }
  },

  methods: {
    editorInit(editor, languageTools) {
      languageTools.addCompleter({
        getCompletions: (editor, session, pos, prefix, callback) => {
          callback(
            null,
            [
              {
                word: 'Checkbox',
                desc: '复选框'
              },
              {
                word: 'CheckboxGroup',
                desc: '复选框组'
              },
              {
                word: 'FormGrid',
                desc: '表单布局'
              },
              {
                word: 'FormGridColumn',
                desc: '表单布局'
              },
              {
                word: 'Input',
                desc: '输入框'
              },
              {
                word: 'ElFormItem',
                desc: '表单项'
              },
              {
                word: 'ElForm',
                desc: '表单'
              },
              {
                word: 'Radio',
                desc: '单选框'
              },
              {
                word: 'RadioGroup',
                desc: '单选框组'
              },
              {
                word: 'Select',
                desc: '选择器'
              },
              {
                word: 'ComboSelect',
                desc: '选择器'
              },
              {
                word: 'Row',
                desc: '布局'
              },
              {
                word: 'Col',
                desc: '布局'
              },
              {
                word: 'AddDatabaseBtn',
                desc: '添加数据库按钮'
              },
              {
                word: 'DatabaseInfo',
                desc: '数据库详情'
              },
              {
                word: 'FormLabel',
                desc: '表单标签'
              },
              {
                word: 'Transfer',
                desc: '穿梭框'
              },
              {
                word: 'Switch',
                desc: '开关'
              },
              {
                word: 'SyncObjects',
                desc: '对象同步'
              },
              {
                word: 'InputNumber',
                desc: '数字输入框'
              },
              {
                word: 'Space',
                desc: '间距'
              },
              {
                word: 'x-decorator',
                desc: '修饰组件'
              },
              {
                word: 'x-component',
                desc: '组件'
              }
            ].map(item => ({
              name: item.word,
              value: item.word,
              meta: item.desc
            }))
          )
        }
      })
    },

    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log(this.form)
          this.pushNodeType(this.form)
          this.$message.success('创建成功')
          this.$refs.form.resetFields()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    getNodeTypes() {
      let nodeTypes = localStorage['store.nodeTypes']
      if (nodeTypes) {
        return JSON.parse(nodeTypes)
      }
      return []
    },

    pushNodeType(node) {
      const nodeTypes = this.getNodeTypes()
      nodeTypes.push(node)
      localStorage['store.nodeTypes'] = JSON.stringify(nodeTypes)
    }
  }
}
</script>

<style lang="scss">
.el-select-dropdown {
  .node-item-img {
    width: 30px;
    height: 24px;
  }
  .node-item-txt {
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
  }
}
</style>

<style lang="scss" scoped>
.node-form-card {
  ::v-deep {
    .el-card__body {
      height: calc(100vh - 140px);
      overflow: auto;
    }

    .icon-select {
      input.el-input__inner:not(:placeholder-shown) {
        padding-left: 34px;
      }
    }
  }
}
</style>
