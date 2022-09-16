module.exports = {
  // 这里不使用翻译API，因为容易断线
  defaultTranslateKeyApi: 'Pinyin',
  // 引入国际化
  importI18N: "import i18n from '@/i18n'",
  importI18NPackages: "import i18n from '@tap/i18n'",
  // 检查是否已引入国际化
  checkImportI18N: 'import i18n',
  // checkImportI18NTemplatePackages: 'import Locale',
  checkImportI18NTemplatePackages: '',
  checkImportI18NJsPackages: 'import { locale }', // js调用
  // 忽略的目录
  ignoreDir: '.idea,i18n,mock,node_modules,public,locales,locale',
  // 忽略的文件
  ignoreFile: 'vue.config.js,VSelect.vue,VIcon.vue,const.js,zh-CN.js,zh-TW.js,en.js,showMessage.js',
  // 提取的国际化key的拼接符
  suggestionJoin: '_',
  // 导出中文文案的文件地址；input是会读取内容后再替换，避免创建重复内容的国际化
  extract: {
    default: {
      input: '.\\apps\\daas\\src\\i18n\\langs\\zh-CN.js',
      output: '.\\apps\\daas\\src\\i18n\\langs\\zh-CN.js'
    },
    // daas目录的路径，如果不是平级，也可以写绝对路径
    daas: {
      input: '.\\apps\\daas\\src\\i18n\\langs\\zh-CN.js',
      output: '.\\apps\\daas\\src\\i18n\\langs\\zh-CN.js'
    },
    // dfs目录的路径，如果不是平级，也可以写绝对路径
    dfs: {
      input: '.\\apps\\dfs\\src\\i18n\\langs\\zh-CN.js',
      output: '.\\apps\\dfs\\src\\i18n\\langs\\zh-CN.js'
    },
    packages: {
      input: '\\src\\locale\\lang\\zh-CN.js',
      output: '\\src\\locale\\lang\\zh-CN.js'
    }
  },
  check: {
    default: {
      input: '.\\apps\\daas\\src\\i18n\\langs\\zh-CN.js',
      output: '.\\apps\\daas\\src\\i18n\\langs\\zh-CN.js'
    },
    daas: {
      input: '.\\apps\\daas\\src\\i18n\\langs\\zh-CN.js',
      output: '.\\apps\\daas\\src\\i18n\\langs\\zh-CN.js',
      replace: {
        en: '.\\apps\\daas\\src\\i18n\\langs\\en.js',
        'zh-TW': '.\\apps\\daas\\src\\i18n\\langs\\zh-TW.js',
        'zh-CN': '.\\apps\\daas\\src\\i18n\\langs\\zh-CN.js'
      }
    },
    dfs: {
      input: '.\\apps\\dfs\\src\\i18n\\langs\\zh-CN.js',
      output: '.\\apps\\dfs\\src\\i18n\\langs\\zh-CN.js',
      replace: {
        en: '.\\apps\\dfs\\src\\i18n\\langs\\en.js',
        'zh-TW': '.\\apps\\dfs\\src\\i18n\\langs\\zh-TW.js',
        'zh-CN': '.\\apps\\dfs\\src\\i18n\\langs\\zh-CN.js'
      }
    },
    packages: {
      input: '\\src\\locale\\lang\\zh-CN.js',
      output: '\\src\\locale\\lang\\zh-CN.js'
    },
    ignoreDir: '.idea,i18n,mock,node_modules,public,locales,locale',
    ignoreFile: 'vue.config.js,zh-CN.js,zh-TW.js,en.js'
  },
  configFile: 'lang.config.js',
  // 国际化的模板格式 $t('key', {val1, val2})
  I18NTemplate: 'i18n.t',
  i18nKeyInVueTemplate: '$t',
  i18nKeyInJs: 'i18n.t',
  i18nKeyInVueTemplatePackages: '$t',
  i18nKeyInJsPackages: 'i18n.t',
  inModules: ['component', 'dag', 'field-mapping', 'form'] // 需要处理的公共模块
}
