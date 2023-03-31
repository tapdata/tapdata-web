export default {
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
    }
  }
}
