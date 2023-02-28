<script>
// import TableBody from 'element-plus/lib/components/table/src/table-body'
// let TableBody = {}
// let TableRow = {}
export default {
  name: 'ProTableBody',
  // extends: TableBody,


  computed: {
    draggable() {
      return !!this.table.draggable
    }
  },

  methods: {
    handleDragStart(ev, row) {
      ev.stopPropagation()
      this.handleEvent(ev, row, 'dragstart')
    },

    handleDragOver(ev, row) {
      ev.stopPropagation()
      this.handleEvent(ev, row, 'dragover')
    },

    handleDragEnd(ev, row) {
      ev.stopPropagation()
      this.handleEvent(ev, row, 'dragend')
    },

    handleDragDrop(ev, row) {
      ev.stopPropagation()
      this.handleEvent(ev, row, 'drop')
    },

    rowRender({ row, $index, treeRowData, isSelected, isExpanded }) {
      const { treeIndent, columns, firstDefaultColumnIndex } = this

      const rowClasses = this.getRowClass(row, $index)
      let display = true
      if (treeRowData) {
        rowClasses.push('el-table__row--level-' + treeRowData.level)
        display = treeRowData.display
      }
      // 指令 v-show 会覆盖 row-style 中 display
      // 使用 :style 代替 v-show https://github.com/ElemeFE/element/issues/16995
      let displayStyle = display
        ? null
        : {
            display: 'none'
          }
      const height = this.getRowHeight($index)
      const heightStyle = height
        ? {
            height
          }
        : null

      return (
        <TableRow
          draggable={this.draggable}
          style={[displayStyle, this.getRowStyle(row, $index), heightStyle]}
          class={rowClasses}
          key={this.getKeyOfRow(row, $index)}
          nativeOn-dblclick={$event => this.handleDoubleClick($event, row)}
          nativeOn-click={$event => this.handleClick($event, row)}
          nativeOn-contextmenu={$event => this.handleContextMenu($event, row)}
          nativeOn-mouseenter={_ => this.handleMouseEnter($index)}
          nativeOn-mouseleave={this.handleMouseLeave}
          nativeOn-dragstart={$event => this.handleDragStart($event, row)}
          nativeOn-dragover={$event => this.handleDragOver($event, row)}
          nativeOn-dragend={$event => this.handleDragEnd($event, row)}
          nativeOn-drop={$event => this.handleDragDrop($event, row)}
          columns={columns}
          row={row}
          index={$index}
          store={this.store}
          context={this.context || this.table.$vnode.context}
          firstDefaultColumnIndex={firstDefaultColumnIndex}
          treeRowData={treeRowData}
          treeIndent={treeIndent}
          columnsHidden={this.columnsHidden}
          getSpan={this.getSpan}
          getColspanRealWidth={this.getColspanRealWidth}
          getCellStyle={this.getCellStyle}
          getCellClass={this.getCellClass}
          handleCellMouseEnter={this.handleCellMouseEnter}
          handleCellMouseLeave={this.handleCellMouseLeave}
          isSelected={isSelected}
          isExpanded={isExpanded}
          fixed={this.fixed}
        ></TableRow>
      )
    }
  }
}
</script>
