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
    }
  }
}
