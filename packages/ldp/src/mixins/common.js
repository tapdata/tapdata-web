import { CancelToken, discoveryApi, taskApi } from '@tap/api'
import { validateCron } from '@tap/form/src/shared/validate'
import i18n from '@tap/i18n'
import { mapState } from 'vuex'

export default {
  data() {
    const validateTaskName = async (rule, value, callback) => {
      value = value.trim()
      if (!value) {
        callback(
          new Error(this.$t('packages_business_relation_list_qingshururenwu')),
        )
      } else {
        try {
          const isExist = await taskApi.checkName({
            name: value,
          })
          if (isExist) {
            callback(
              new Error(this.$t('packages_dag_task_form_error_name_duplicate')),
            )
          } else {
            callback()
          }
        } catch {
          callback()
        }
      }
    }
    const validatePrefix = (rule, value, callback) => {
      value = value.trim()
      if (!value) {
        callback(new Error(this.$t('public_form_not_empty')))
      } else if (!/\w+/.test(value)) {
        callback(
          new Error(this.$t('packages_business_data_server_drawer_geshicuowu')),
        )
      } else {
        callback()
      }
    }
    const validateCrontabExpression = (rule, value, callback) => {
      value = value.trim()
      if (!value) {
        callback(new Error(this.$t('public_form_not_empty')))
      } else if (!validateCron(value)) {
        callback(this.$t('packages_dag_migration_settingpanel_cronbiao'))
      } else {
        callback()
      }
    }

    const cronOptions = [
      {
        label: i18n.t('packages_ldp_run_only_once'),
        value: 'once',
      },
      {
        label: i18n.t('packages_ldp_run_every_10_minutes'),
        value: '0 */10 * * * ?',
      },
      {
        label: i18n.t('packages_ldp_run_every_hour'),
        value: '0 0 * * * ?',
      },
      {
        label: i18n.t('packages_ldp_run_every_day'),
        value: '0 0 0 * * ?',
      },
      {
        label: i18n.t('packages_ldp_custom_cron_expression'),
        value: 'custom',
      },
    ]
    return {
      cronOptions,
      formRules: {
        taskName: [{ validator: validateTaskName, trigger: 'blur' }],
        newTableName: [{ required: true }],
        prefix: [{ validator: validatePrefix, trigger: 'blur' }],
        'task.crontabExpression': [
          {
            required: true,
            message: this.$t('public_form_not_empty'),
            trigger: ['blur', 'change'],
          },
          { validator: validateCrontabExpression, trigger: ['blur', 'change'] },
        ],
      },
    }
  },

  computed: {
    startingTour() {
      return this.$store.getters.startingTour
    },
    ...mapState(['highlightBoard']),
  },
  unmounted() {
    this.debouncedSearch?.cancel()
    this.cancelSource?.cancel()
  },
  methods: {
    toggleEnableSearch() {
      if (this.enableSearch) {
        this.search = ''
        this.enableSearch = false
      } else {
        this.enableSearch = true
        this.$nextTick(() => {
          this.$refs.search?.focus()
        })
      }
    },

    handleSearch(val) {
      if (!val) {
        this.searchIng = false
        this.debouncedSearch.cancel()
        return
      }
      this.searchIng = true
      this.debouncedSearch(val)
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    handleClickName(task) {
      if (!task?.id) return

      let routeName

      if (!['edit', 'wait_start'].includes(task.status)) {
        routeName =
          task.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor'
      } else {
        routeName =
          task.syncType === 'migrate' ? 'MigrateEditor' : 'DataflowEditor'
      }

      this.openRoute({
        name: routeName,
        query: {
          tour: this.startingTour ? true : undefined,
        },
        params: {
          id: task.id,
        },
      })
    },

    loadObjects(node, isCurrent = true, queryKey, cancelToken) {
      const where = {
        page: 1,
        pageSize: 10000,
        tagId: node.id,
        range: isCurrent ? 'current' : undefined,
        sourceType: 'table',
        queryKey,
        regUnion: false,
        fields: {
          allTags: 1,
        },
      }
      return discoveryApi
        .discoveryList(where, {
          cancelToken,
        })
        .then((res) => {
          return res.items.map((item) =>
            Object.assign(item, {
              isLeaf: true,
              isObject: true,
              connectionId: item.sourceConId,
              LDP_TYPE: 'table',
              parent_id: node.id,
              isVirtual: item.status === 'noRunning',
            }),
          )
        })
    },

    async searchObject(search) {
      this.cancelSource?.cancel()
      this.cancelSource = CancelToken.source()
      this.searchIng = true
      const result = await this.loadObjects(
        this.directory,
        false,
        search,
        this.cancelSource.token,
      )
      const map = result.reduce((obj, item) => {
        const id = item.listtags?.[0]?.id || this.directory.id
        const children = obj[id] || []
        children.push(item)
        obj[id] = children
        return obj
      }, {})

      const filterTree = (node) => {
        const newNode = { ...node }

        if (node.children?.length) {
          newNode.children = node.children
            .map((child) => filterTree(child))
            .filter(
              (child) =>
                child.LDP_TYPE === 'folder' &&
                (child.name.includes(search) || child.children.length),
            )
        } else {
          newNode.children = []
        }

        if (map[node.id]) {
          newNode.children.push(...map[node.id].map((child) => ({ ...child })))
        }

        return newNode
      }

      const root = filterTree(this.directory)
      this.searchIng = false
      this.filterTreeData = root.children
    },

    handleFindParent(event) {
      const parentNode = event.target?.parentElement
      this.$emit('find-parent', parentNode)
    },

    handleChangeCronType(val) {
      if (val === 'once') {
        this.taskDialogConfig.task.crontabExpressionFlag = false
      } else {
        this.taskDialogConfig.task.crontabExpressionFlag = true
        if (val !== 'custom') {
          this.taskDialogConfig.task.crontabExpression = val
        }
      }
    },

    setExpand(id, isExpand) {
      const i = this.expandedKeys.indexOf(id)
      if (!isExpand) {
        if (~i) this.expandedKeys.splice(i, 1)
      } else if (!~i) this.expandedKeys.push(id)
    },

    handeNodeCollapse(data) {
      this.setExpand(data.id, false)
    },

    async makeTaskName(source) {
      const taskNames = await taskApi.get({
        filter: JSON.stringify({
          limit: 9999,
          fields: { name: 1 },
          where: { name: { like: `^${source}\\d+$` } },
        }),
      })
      let def = 1
      if (taskNames?.items.length) {
        const arr = [0]
        taskNames.items.forEach((item) => {
          const res = item.name.match(new RegExp(`^${source}(\\d+)$`))
          if (res && res[1]) arr.push(+res[1])
        })
        arr.sort((a, b) => a - b)
        def = arr.pop() + 1
      }
      return `${source}${def}`
    },

    findParentByClassName(parent, cls) {
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },
  },
}
