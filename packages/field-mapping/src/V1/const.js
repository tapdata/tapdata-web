/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2022/3/4
 * @description
 */
export const modeMapping = {
  all: {
    batch_field_rename: true,
    batch_field_type: false,
    field_rename: true,
    field_type: true,
    precision: true,
    scale: true,
    field_table_ops: true,
    rollback: true,
    batch_rollback: true
  },
  metaData: {
    batch_field_rename: false,
    batch_field_type: false,
    field_rename: false,
    field_type: true,
    precision: true,
    scale: true,
    field_table_ops: true,
    rollback: true,
    batch_rollback: true
  },
  readOnly: {
    batch_field_rename: false,
    batch_field_type: false,
    field_rename: false,
    field_type: false,
    precision: false,
    scale: false,
    field_table_ops: false,
    rollback: false,
    batch_rollback: false
  }
}
