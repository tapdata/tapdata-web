import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import { getNodeKey } from 'element-ui/packages/tree/src/model/util'

export default {
  methods: {
    handleDragStart(event) {
      if (!this.tree.draggable) return
      $emit(this.tree, 'tree-node-drag-start', event, this)
    },

    handleDragOver(event) {
      if (!this.tree.draggable) return
      $emit(this.tree, 'tree-node-drag-over', event, this)
      event.preventDefault()
    },

    handleDrop(event) {
      event.preventDefault()
    },

    handleDragEnd(event) {
      if (!this.tree.draggable) return
      $emit(this.tree, 'tree-node-drag-end', event, this)
    },
    creator(parent, nodeTag) {
      const node = this[nodeTag]

      if (parent.isTree) {
        this.tree = parent
      } else {
        this.tree = parent.tree
      }

      const tree = this.tree
      if (!tree) {
        console.warn("Can not find node's tree.")
      }

      const props = tree.props || {}
      const childrenKey = props['children'] || 'children'

      this.$watch(`${nodeTag}.data.${childrenKey}`, () => {
        node.updateChildren()
      })

      if (node.expanded) {
        this.expanded = true
        this.childNodeRendered = true
      }

      if (this.tree.accordion) {
        $on(this, 'tree-node-expand', (currentNode) => {
          if (node !== currentNode) {
            node.collapse()
          }
        })
      }
    },

    getNodeKey(node) {
      return getNodeKey(this.tree.nodeKey, node.data)
    },

    handleSelectChange(checked, indeterminate) {
      const node = this.node || this.source

      if (
        this.oldChecked !== checked &&
        this.oldIndeterminate !== indeterminate
      ) {
        $emit(this.tree, 'check-change', node.data, checked, indeterminate)
      }
      this.oldChecked = checked
      this.indeterminate = indeterminate
    },

    handleClick() {
      const node = this.node || this.source
      const store = this.tree.store

      store.setCurrentNode(node)
      $emit(
        this.tree,
        'current-change',
        store.currentNode ? store.currentNode.data : null,
        store.currentNode
      )
      this.tree.currentNode = this
      if (this.tree.expandOnClickNode) {
        this.handleExpandIconClick()
      }
      if (this.tree.checkOnClickNode && !node.disabled) {
        this.handleCheckChange(null, {
          target: { checked: !node.checked },
        })
      }

      $emit(this.tree, 'node-click', node.data, node, this)
    },

    handleContextMenu(event) {
      const node = this.node || this.source

      if (
        this.tree._events['node-contextmenu'] &&
        this.tree._events['node-contextmenu'].length > 0
      ) {
        event.stopPropagation()
        event.preventDefault()
      }
      $emit(this.tree, 'node-contextmenu', event, node.data, node, this)
    },

    handleExpandIconClick() {
      const node = this.node || this.source

      if (node.isLeaf) return
      if (this.expanded) {
        $emit(this.tree, 'node-collapse', node.data, node, this)
        node.collapse()
      } else {
        node.expand()
        $emit(this, 'node-expand', node.data, node, this)
      }
    },

    handleCheckChange(_, ev) {
      const node = this.node || this.source

      node.setChecked(ev.target.checked, !this.tree.checkStrictly)
      this.$nextTick(() => {
        const store = this.tree.store
        $emit(this.tree, 'check', node.data, {
          checkedNodes: store.getCheckedNodes(),
          checkedKeys: store.getCheckedKeys(),
          halfCheckedNodes: store.getHalfCheckedNodes(),
          halfCheckedKeys: store.getHalfCheckedKeys(),
        })
      })
    },

    handleChildNodeExpand(nodeData, node, instance) {
      this.broadcast('ElTreeNode', 'tree-node-expand', node)
      $emit(this.tree, 'node-expand', nodeData, node, instance)
    },
  },
  emits: [
    'tree-node-drag-start',
    'tree-node-drag-over',
    'tree-node-drag-end',
    'check-change',
    'current-change',
    'node-click',
    'node-contextmenu',
    'node-collapse',
    'node-expand',
    'check',
  ],
}
