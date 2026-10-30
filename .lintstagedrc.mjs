export default {
  '*.{vue,js,ts,tsx,jsx}': (filenames) => {
    const files = filenames.map((f) => `'${f}'`).join(' ')
    return [
      `prettier --write ${files}`,
      `bash -c "eslint --fix --no-warn-ignored --quiet ${files} || true"`,
      `node scripts/check-i18n.js ${files}`,
      // 纯 JS 的 <script> 里混入 TS 注解会让整个页面 500，提交前按 SFC 编译检查一次
      `node scripts/check-vue-sfc.mjs ${files}`,
    ]
  },
}
