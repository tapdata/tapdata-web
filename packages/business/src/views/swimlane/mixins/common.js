import { CancelToken, discoveryApi } from '@tap/api'

export default {
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
        routeName = task.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor'
      } else {
        routeName = task.syncType === 'migrate' ? 'MigrateEditor' : 'DataflowEditor'
      }

      this.openRoute({
        name: routeName,
        params: {
          id: task.id
        }
      })
    },

    loadObjects(node, isCurrent = true, queryKey, cancelToken) {
      let where = {
        page: 1,
        pageSize: 10000,
        tagId: node.id,
        range: isCurrent ? 'current' : undefined,
        sourceType: 'table',
        queryKey,
        regUnion: false,
        fields: {
          allTags: 1
        }
      }
      return discoveryApi
        .discoveryList(where, {
          cancelToken
        })
        .then(res => {
          return res.items.map(item =>
            Object.assign(item, {
              isLeaf: true,
              isObject: true,
              connectionId: item.sourceConId,
              LDP_TYPE: 'table'
            })
          )
        })
    },

    async searchObject(search) {
      this.cancelSource?.cancel()
      this.cancelSource = CancelToken.source()
      this.searchIng = true
      const result = await this.loadObjects(this.directory, false, search, this.cancelSource.token)
      const map = result.reduce((obj, item) => {
        let id = item.listtags[0].id
        let children = obj[id] || []
        children.push(item)
        obj[id] = children
        return obj
      }, {})

      const filterTree = node => {
        const { children } = node

        if (children?.length) {
          node.children = children.filter(child => {
            filterTree(child)
            return child.LDP_TYPE === 'folder' && (child.name.includes(search) || child.children.length)
          })
        }

        if (map[node.id]) {
          node.children.push(...map[node.id])
        }
      }

      let root = { ...this.directory }
      filterTree(root)
      this.searchIng = false
      this.filterTreeData = root.children
    }
  }
}