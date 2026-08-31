export default {
  '*.{vue,js,ts,tsx,jsx}': (filenames) => {
    const files = filenames.map((f) => `'${f}'`).join(' ')
    return [
      `prettier --write ${files}`,
      `bash -c "eslint --fix --no-warn-ignored --quiet ${files} || true"`,
      `node scripts/check-i18n.js ${files}`,
    ]
  },
}
