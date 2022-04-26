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
  env: {
    development: {
      // 解决热加载编译速度慢问题，引入按需加载插件 dynamic-import-node
      // babel-plugin-dynamic-import-node plugin only does one thing by converting all import() to require().
      // This plugin can significantly increase the speed of hot updates, when you have a large number of pages.
      plugins: ['dynamic-import-node']
    }
  }
}
