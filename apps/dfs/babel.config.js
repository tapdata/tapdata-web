module.exports = {
  presets: [
    [
      '@vue/cli-plugin-babel/preset',
      {
        jsx: {
          compositionAPI: true
        }
      }
    ]
  ],
  plugins: [
    ['@babel/plugin-transform-arrow-functions', { spec: true }],
    ['@babel/plugin-transform-typescript', { isTSX: true }]
  ]
}
