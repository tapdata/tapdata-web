export const showMessage = {
  methods: {
    $showMessage(messageData) {
      messageData.dangerouslyUseHTMLString = true
      if (messageData.position === undefined) {
        messageData.position = 'bottom-right'
      }

      return this.$notify(messageData)
    },

    $showError(error, title, message) {
      this.$showMessage({
        title,
        message: `
					${message}
					<br>
					<i>${error.message}</i>
					${this.collapsableDetails(error)}`,
        type: 'error',
        duration: 0
      })
    },

    /**
     * 折叠详情
     * @param description
     * @param node
     * @returns {string}
     */
    collapsableDetails({ description, node }) {
      if (!description) return ''

      const errorDescription = description.length > 500 ? `${description.slice(0, 500)}...` : description

      return `
				<br>
				<br>
				<details>
					<summary
						style="color: #ff6d5a; font-weight: bold; cursor: pointer;"
					>
						详情
					</summary>
					<p>${node.name}: ${errorDescription}</p>
				</details>
			`
    }
  }
}
