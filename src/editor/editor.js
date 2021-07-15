/**
 * @author lg<lirufei0808@gmail.com>
 * @date 2/26/20
 * @description
 */
import BaseObject from './lib/BaseObject'
import UI from './ui/ui'
import Graph from './ui/graph'
import { loadPlugins } from './plugins'
import Sidebar from './ui/sidebar'
import Tab from './ui/tab'
import VueComponent from './ui/VueComponent'
import Monitor from '../views/job/Monitor'
import Capture from '../views/job/Preview'
import Setting from '../views/job/Setting'
import DebugLogs from '../views/job/DebugLogs'
import Milestone from '../views/job/Milestone'
import TaskProgress from '../views/job/TaskProgress'
import DataVerify from '../views/job/DataVerify/List'
import DVResult from '../views/job/DataVerify/Result'

import log from '../log'
import Panel from './ui/panel'
import TableSelector from '../views/job/TableSelector'
import DatabaseSelector from '../views/job/DatabaseSelector'
import { DEFAULT_SETTING } from './constants'
import { EditorEventType } from './lib/events'
import { Message } from 'element-ui'
import i18n from '@/i18n'

import factory from '../api/factory'
import $ from 'jquery'

const connections = factory('connections')

export default class Editor extends BaseObject {
  /**
   * user interface
   * @type {UI}
   */
  ui = null

  /**
   * left sidebar
   * @type {Sidebar}
   */
  leftSidebar = null

  /**
   * right sidebar
   * @type {Sidebar}
   */
  rightSidebar = null

  /**
   * bottom sidebar
   * @type {Sidebar}
   */
  bottomSidebar = null

  /**
   * right tab panel
   * @type {Tab}
   */
  bottomTabPanel = null

  /**
   * graph ui
   * @type {Graph}
   */
  graph = null

  /**
   *
   * @type {boolean}
   */
  editable = true

  /**
   * loadSchema
   * @type {boolean}
   */
  mapping = {
    'app.Collection': 'connectionId',
    'app.Table': 'connectionId',
    'app.Database': 'connectionId',
    'app.Dummy': 'connectionId',
    'app.GridFSNode': 'connectionId',
    'app.ApiNode': 'connectionId',
    'app.HiveNode': 'connectionId'
  }

  /**
   * editor 作用域
   */
  scope = null

  constructor(opts) {
    super()

    this.container = opts.container
    this.opts = opts

    if (opts.scope) {
      this.scope = opts.scope
    }

    this.doInit()
  }

  /**
   * init editor
   */
  doInit() {
    let self = this

    // login plugins

    loadPlugins(self.opts.customProcessors)

    let ui = (self.ui = new UI(
      Object.assign(
        {
          editor: self
        },
        this.opts
      )
    ))
    ui.render(self.container)

    let leftSidebar = (self.leftSidebar = new Sidebar({
      container: self.ui.el.find('.e-body'),
      prepend: true,
      region: 'left',
      editor: this,
      split: false,
      width: 235,
      bodyStyle: 'display: flex; flex-direction: column;'
    }))
    ui.add(leftSidebar)

    let stencilPanel = new Panel({
      name: 'stencil'
      // bodyStyle: 'height:365px'
    })
    leftSidebar.add(stencilPanel)

    self.rightSidebar = new Sidebar({
      container: self.ui.el.find('.e-body'),
      region: 'right',
      editor: this,
      hidden: true,
      maxWidth: 800,
      minWidth: 500,
      width: 725
    })
    ui.add(self.rightSidebar)

    let rightTabPanel = new Tab({
      name: 'rightTabPanel',
      hiddenTabBar: true
    })
    self.rightSidebar.add(rightTabPanel)

    self.bottomSidebar = new Sidebar({
      container: self.ui.getContentEl(),
      region: 'bottom',
      editor: this,
      hidden: true,
      maxHeight: 800,
      height: 520
    })
    ui.add(self.bottomSidebar)

    let bottomTabPanel = (self.bottomTabPanel = new Tab())
    self.bottomSidebar.add(bottomTabPanel)

    self.graph = new Graph({
      editor: self,
      container: self.ui.getGraphContainer()
    })
    this.initSettings()
  }

  setSelector(type) {
    let leftSidebar = this.getLeftSidebar()
    leftSidebar.getContentEl().find('[data-name=tableSelector] .elements>*').remove()
    if (type === 'cluster-clone') {
      let databaseVueComponent = new VueComponent({
        name: 'databaseVueComponent',
        editor: this,
        component: DatabaseSelector
      })
      leftSidebar
        .getContentEl()
        .find('[data-name=tableSelector] .elements')
        .prepend(databaseVueComponent.getContentEl())
      leftSidebar.getContentEl().find('[data-name=processor]').remove()
    } else {
      let tableVueComponent = new VueComponent({
        name: 'tableVueComponent',
        editor: this,
        component: TableSelector
      })
      leftSidebar.getContentEl().find('[data-name=tableSelector] .elements').prepend(tableVueComponent.getContentEl())
    }
  }

  /**
   * init settings panel
   */
  initSettings() {
    let self = this
    let rightTabPanel = this.getRightTabPanel()
    if (!rightTabPanel) {
      rightTabPanel = new Tab({
        name: 'rightTabPanel',
        hiddenTabBar: true
      })
      this.getRightSidebar().add(rightTabPanel)
    }
    this.rightSidebar.add(rightTabPanel)

    let setting = rightTabPanel.getChildByName('setting')
    if (!setting) {
      setting = new VueComponent({
        title: i18n.t('editor.ui.sidebar.setting'),
        name: 'setting',
        editor: this,
        component: Setting
      })
      this.getRightTabPanel().add(setting)
    }

    setting.on('dataChanged', data => {
      self.graph.setSettingData(data)
    })
  }

  /**
   * init running mode
   * @param dataFlow
   */
  initRunningMode(dataFlow) {
    log('Editor.initRunningMode')
    let self = this

    // hide stencil
    this.getLeftSidebar().hide()

    self.ui.setDisableName(true)

    self.initMonitor(dataFlow)
    self.showLogs(dataFlow, true)
    if (window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs') {
      self.showTaskProgress(dataFlow, true)
    }
  }

  /**
   * init editing mode
   */
  initEditingMode() {
    log('editor.initEditingMode')
    // this.getRightSidebar().removeAll();
    this.seeMonitor = false
    this.getRightTabPanel().removeAll()
    this.getRightSidebar().hide()

    this.initSettings()

    this.getLeftSidebar().show()

    this.ui.setDisableName(false)

    // this.getBottomSidebar().hide();
    // this.getBottomTabPanel().removeAll();
  }
  initMonitor(dataFlow) {
    // this.getRightTabPanel().removeAll();
    this.seeMonitor = true
    let self = this
    if (dataFlow) this.dataFlow = dataFlow
    let rightTabPanel = self.getRightTabPanel()
    if (rightTabPanel) {
      let monitor = rightTabPanel.getChildByName('monitor')
      if (!monitor) {
        monitor = new VueComponent({
          title: i18n.t('editor.ui.sidebar.statistics'),
          name: 'monitor',
          editor: this,
          propsData: {
            dataFlow: dataFlow || this.dataFlow
          },
          component: Monitor
        })
        self.getRightTabPanel().add(monitor)
      }
      rightTabPanel.select(monitor)
      self.getRightSidebar().show()
    }
    let tapTitle = i18n.t('editor.ui.sidebar.statistics')
    $('.e-tab-panel')
      .last()
      .prepend(
        `<div class="monitorTab ${window.getSettingByKey(
          'DFS_TCM_PLATFORM'
        )}"><div class="e-tab-title active">${tapTitle}</div></div>`
      )
  }

  /**
   * show setting panel
   * @param name
   */
  showSetting(editDisable) {
    let self = this
    let rightTabPanel = self.getRightTabPanel()
    if (rightTabPanel) {
      let setting = rightTabPanel.getChildByName('setting')
      let rightBar = self.getRightSidebar()
      if (setting) {
        rightBar[setting.selected && rightBar.isShow() ? 'hide' : 'show']()
      } else {
        self.initSettings()
        setting = rightTabPanel.getChildByName('setting')
        rightBar.show()
      }

      let settingData = self.graph.getSettingData() || {}
      settingData.editDisable = !!editDisable

      if (settingData.editDisable) {
        $('.monitorTab').html('<div class="e-tab-title active">setting</div>')
        let removeTab = document.getElementsByClassName('monitorTab')
        if (removeTab && removeTab.length > 0) {
          removeTab[0].remove()
        }
      }
      setting.setData(settingData)
      rightTabPanel.select(setting)
    }
  }
  setSettingData(settingGlobal) {
    let self = this
    let rightTabPanel = self.getRightTabPanel()
    if (rightTabPanel) {
      let setting = rightTabPanel.getChildByName('setting')
      let settingData = self.graph.getSettingData() || {}
      settingData['emailWaring'] = {
        paused: settingGlobal[1].email || false,
        error: settingGlobal[3].email || false,
        started: settingGlobal[0].email || false
      }
      setting.setData(settingData)
    }
  }

  /**
   * show logs panel
   * @param dataFlow
   */
  showLogs(dataFlow, isShow) {
    let bottomTabPanel = this.getBottomTabPanel()
    let milestone = bottomTabPanel.getChildByName('milestone')

    if (!milestone) {
      let logsPanel = new VueComponent({
        title: i18n.t('editor.ui.sidebar.logs'),
        name: 'logsPanel',
        editor: this,
        closeBtn: !window.getSettingByKey('DFS_TCM_PLATFORM'),
        propsData: {
          dataFlow: dataFlow
        },
        component: DebugLogs
      })
      milestone = new VueComponent({
        title: i18n.t('editor.ui.sidebar.milestone'),
        name: 'milestone',
        editor: this,
        closeBtn: !window.getSettingByKey('DFS_TCM_PLATFORM'),
        propsData: {
          dataFlow: dataFlow
        },
        component: Milestone
      })
      this.getBottomTabPanel().add(milestone)
      this.getBottomTabPanel().add(logsPanel)
    }

    if (this.getBottomSidebar().isShow() && milestone.selected && !isShow) {
      this.getBottomSidebar().hide()
    } else {
      this.getBottomTabPanel().select(milestone)
      this.getBottomSidebar().show()
    }
  }

  /**
   * show Task Progress
   * @param dataFlow
   */
  showTaskProgress(dataFlow, isShow) {
    let progress = this.getBottomTabPanel().getChildByName('progress')
    if (!progress) {
      progress = new VueComponent({
        title: i18n.t('editor.ui.sidebar.progress'),
        name: 'progress',
        editor: this,
        propsData: {
          dataFlow: dataFlow
        },
        component: TaskProgress
      })
      this.getBottomTabPanel().add(progress)
    } else {
      if (progress.vm && typeof progress.vm.setData === 'function') {
        progress.vm.setData(dataFlow)
      }
    }
    this.getBottomTabPanel().select(progress)
    this.getBottomSidebar().show()
  }

  /**
   * show capture panel
   * @param dataFlow
   */
  showCapture(dataFlow) {
    // add capture
    let capture = this.getBottomTabPanel().getChildByName('capture')
    if (!capture) {
      capture = new VueComponent({
        title: i18n.t('editor.ui.sidebar.capture'),
        name: 'capture',
        editor: this,
        propsData: {
          dataFlow: dataFlow
        },
        component: Capture
      })
      this.getBottomTabPanel().add(capture)
    } else {
      if (capture.vm && typeof capture.vm.setData === 'function') {
        capture.vm.setData(dataFlow)
      }
    }
    // if( this.getBottomSidebar().isShow() && capture.selected ) {
    // 	this.getBottomSidebar().hide();
    // } else {
    this.getBottomTabPanel().select(capture)
    this.getBottomSidebar().show()
    // }
  }

  /**
   * show dataVerify panel
   * @param disableDirective
   */
  showDataVerify() {
    // remove setting
    let dvResult = this.getRightTabPanel().getChildByName('dvResult')
    if (dvResult) this.getRightTabPanel().remove(dvResult)

    // add data verify
    let self = this
    let dataVerify = self.getRightSidebar().getChildByName('dataVerify')
    if (!dataVerify) {
      dataVerify = new VueComponent({
        title: i18n.t('editor.ui.sidebar.capture'),
        name: 'dataVerify',
        editor: this,
        propsData: {
          dataFlow: ''
        },
        component: DataVerify
      })
      self.getRightTabPanel().add(dataVerify)
      self.getRightTabPanel().select(dataVerify)
      self.getRightSidebar().on(EditorEventType.RESIZE, function () {
        dataVerify.emit(EditorEventType.RESIZE, ...arguments)
      })
    }
    self.getRightSidebar().show()
  }

  /**
   * show data flow monitor panel
   */
  showMonitor() {
    // remove dataVerify
    let dataVerify = this.getRightTabPanel().getChildByName('dataVerify')
    if (dataVerify) this.getRightTabPanel().remove(dataVerify)

    let monitor = this.getRightTabPanel().getChildByName('monitor')
    this.getRightTabPanel().select(monitor)
  }
  showResult() {
    let dvLoading = this.getRightTabPanel().getChildByName('dvLoading')
    if (dvLoading) this.getRightTabPanel().remove(dvLoading)
    // add result
    let self = this
    let rightTabPanel = self.getRightSidebar().getChildByName('rightTabPanel')
    if (!rightTabPanel) {
      rightTabPanel = new Tab({
        name: 'rightTabPanel'
      })
      self.getRightSidebar().add(rightTabPanel) // 添加空白panel 节点渲染
    }
    let dvResult = self.getRightSidebar().getChildByName('dvResult')
    if (!dvResult) {
      dvResult = new VueComponent({
        title: i18n.t('editor.ui.sidebar.capture'),
        name: 'dvResult',
        editor: this,
        propsData: {
          dataFlow: ''
        },
        component: DVResult
      })
      self.getRightTabPanel().add(dvResult)
      self.getRightTabPanel().select(dvResult)
    }
    self.getRightSidebar().show()
  }

  setData(dataFlow) {
    let dat = JSON.parse(dataFlow.editorData)
    dat.cells.forEach(cell => {
      //处理不是从面板拖过来的场景
      if (cell.form_data && ['database', 'gridfs', 'file'].includes(cell.form_data.type))
        if (
          (cell.form_data && cell.form_data.database_type && !cell.attrs.image) ||
          (cell.form_data && cell.form_data.databaseType && !cell.attrs.image)
        ) {
          let dataType = cell.form_data.databaseType || cell.form_data.database_type
          cell.attrs.image = {
            mysql: { xlinkHref: 'static/editor/o-mysql.svg' },
            oracle: { xlinkHref: 'static/editor/o-ora.svg' },
            mongodb: { xlinkHref: 'static/editor/o-mongo.svg' },
            db2: { xlinkHref: 'static/editor/o-db2.svg' },
            pg: { xlinkHref: 'static/editor/o-pg.svg' },
            sqlserver: { xlinkHref: 'static/editor/o-sqlserver.svg' },
            gbase: { xlinkHref: 'static/editor/o-gbase.svg' },
            sybase: { xlinkHref: 'static/editor/o-sybase.svg' }
          }[dataType]
        }
    })
    this.graph.loadData(dat)
    this.ui.setName(dataFlow.name)
  }

  getData() {
    let graphLib = this.graph.getGraphLib()
    //let distance = this.distanceForSink(graphLib);
    // let graphData = this.graph.getData();
    // graphData.cells.forEach(cd => {
    // 	delete cd.attrs;
    // 	delete cd.ports;
    // 	delete cd.size;
    // });
    return {
      name: this.ui.getName(),
      graphData: this.graph.getData(),
      graphLib: graphLib,
      //distanceForSink: distance,
      settingData: this.graph.getSettingData() || DEFAULT_SETTING,
      graph: this.graph.graph
    }
  }

  /**
   *
   * @param graphLib
   */
  distanceForSink(graphLib) {
    let distanceResult = {}

    let predecessors = function (node, distance) {
      if (Object.prototype.hasOwnProperty.call(distanceResult, node))
        distanceResult[node] = distanceResult[node] >= distance ? distanceResult[node] : distance
      else distanceResult[node] = distance

      graphLib.predecessors(node).forEach(node => predecessors(node, distance + 1))
    }
    graphLib.sinks().forEach(node => predecessors(node, 0))

    log('Editor.distanceForSink', distanceResult)

    return distanceResult
  }

  setEditable(editable, dataFlow) {
    log('Editor.setEditable', editable, dataFlow)
    this.editable = editable
    this.graph.setEditable(editable)
    if (editable) {
      this.initEditingMode()
    } else {
      this.initRunningMode(dataFlow)
    }
  }

  goBackMontior() {
    this.seeMonitor = true
    let monitor = this.getRightTabPanel().getChildByName('monitor')
    this.getRightTabPanel().select(monitor)
  }

  /**
   * Validate graph data for data flow
   * @return {*}
   */
  validate() {
    let name = this.ui.getName()
    if (!name) return i18n.t('editor.cell.validate.empty_name')

    let getData = this.getData()
    if (
      (!getData.settingData || !getData.settingData.cronExpression) &&
      getData.settingData.isSchedule === true &&
      getData.settingData.sync_type === 'initial_sync'
    ) {
      return i18n.t('dataFlow.cronExpression')
    }

    let verified = this.graph.validate()
    if (verified !== true) return verified
    return this.validateGraphData()
  }

  /**
   * Validate graph to meet business logic
   * @return {boolean | string}
   */
  validateGraphData() {
    log('Job.validateGraphData')
    let editorData = this.getData()
    let graph = editorData.graph
    /* let graphData = editorData.graphData;
		let graphLib = graphData.graphLib; */

    // at least 2 data node
    // at least 1 link
    let dataNodeCount = 0,
      linkCount = 0
    graph.getCells().forEach(cell => {
      if (cell.isLink()) {
        linkCount++
      } else if (cell.isElement() && typeof cell.isDataNode === 'function' && cell.isDataNode()) {
        dataNodeCount++
      }
    })
    if (dataNodeCount < 2) return i18n.t('editor.cell.validate.none_data_node')

    if (linkCount < 1) return i18n.t('editor.cell.validate.none_link_node')

    let sources = graph.getSources() || []
    let processorSources = sources.filter(
      cell => cell.isElement() && typeof cell.isProcess === 'function' && cell.isProcess()
    )
    if (processorSources.length > 0) {
      this.graph.selectCell(processorSources)
      return i18n.t('editor.cell.validate.start_with_data_node')
    }

    // validate graph acyclic
    let acyclic = this.graph.isAcyclic()
    if (!acyclic) {
      return i18n.t('editor.cell.validate.acyclic')
    }

    return true
  }

  /**
   * reload schema
   */
  reloadSchema() {
    // 1. 遍历当前有模型的节点(合并相同连接ID)
    let self = this
    log('editor.graph.graph.getCells()', self.graph.graph.getCells())
    let dataCells = self.graph.graph
      .getCells() // .filter(cell => cell.isDataNode && cell.isDataNode())
      .filter(cell => {
        let formData = typeof cell.getFormData === 'function' ? cell.getFormData() : null
        let type = cell.get('type')
        let connectionIdFieldName = self.mapping[type]
        return formData && connectionIdFieldName && formData[connectionIdFieldName]
      })
    let dataCellIds = []
    dataCells.forEach(cell => {
      let formData = typeof cell.getFormData === 'function' ? cell.getFormData() : null
      let type = cell.get('type')
      let connectionIdFieldName = self.mapping[type]
      let connectionId = formData[connectionIdFieldName]
      dataCellIds.push(connectionId)
    })
    dataCellIds = Array.from(new Set(dataCellIds))
    log('Editor.reloadSchema.modelData', dataCells)

    // 2.请求节点schema数据
    // TODO: add id parameter

    log('dataCellIds', dataCellIds)
    let params = {
      filter: JSON.stringify({
        where: {
          id: {
            inq: dataCellIds
          }
        }
      })
    }
    connections
      .get(params)
      .then(result => {
        if (result.data && result.data.length !== 0) {
          /**
           * connectionId -> table name -> schema
           * @type {{object}}
           */
          let connectionSchemaData = {}

          result.data.forEach(connection => {
            if (connection.schema && connection.schema.tables) {
              let tables = {}
              connection.schema.tables.forEach(table => (tables[table.table_name] = table))
              connectionSchemaData[connection.id] = tables
            }
          })

          // 3. 分别更新对应节点schema
          if (dataCells) {
            dataCells.map(cell => {
              let formData = typeof cell.getFormData === 'function' ? cell.getFormData() : null
              if (!formData) return

              let type = cell.get('type')
              let connectionIdFieldName = self.mapping[type]
              let connectionId = formData[connectionIdFieldName]
              let tableName = formData.tableName

              let schema = connectionSchemaData[connectionId] && connectionSchemaData[connectionId][tableName]

              if (!connectionId || !tableName || !schema) return
              cell.setSchema(schema, false)
            })

            // 4. 更新所有节点的schema
            self.graph.graph.getSources().forEach(cell => cell.updateOutputSchema())
          }
        }
        // Message.success({
        //   message: i18n.t('message.reloadSchemaSuccess')
        // })
      })
      .catch(() => {
        Message.error({
          message: i18n.t('message.reloadSchemaError')
        })
      })
  }
  getAllCells() {
    let dataCells = this.graph.graph
      .getCells() // .filter(cell => cell.isDataNode && cell.isDataNode())
      .filter(cell => {
        let formData = typeof cell.getFormData === 'function' ? cell.getFormData() : null
        let type = cell.get('type')
        return formData && type !== 'app.Link'
      })
    return dataCells
  }

  /**
   * Return an array of all the roots of the graph. Time complexity: O(|V|)
   * @returns {*}
   */
  getSources() {
    return this.graph.graph.getSources()
  }

  /**
   * Return an array of all the leafs of the graph. Time complexity: O(|V|)
   * @returns {*}
   */
  getSinks() {
    return this.graph.graph.getSinks()
  }
  destroy() {
    this.emit(EditorEventType.BEFORE_DESTROY, this)
    this.ui.destroy()
  }

  getUI() {
    return this.ui
  }
  getLeftSidebar() {
    return this.leftSidebar
  }
  getRightSidebar() {
    return this.rightSidebar
  }
  getRightTabPanel() {
    let rightSidebar = this.getRightSidebar()
    if (rightSidebar) {
      return rightSidebar.getChildByName('rightTabPanel')
    }
    return null
  }
  getBottomSidebar() {
    return this.bottomSidebar
  }
  getBottomTabPanel() {
    return this.bottomTabPanel
  }
  getLeftSidebarEl() {
    return this.leftSidebar.getContentEl()
  }
  getRightSidebarEl() {
    return this.rightSidebar.getContentEl()
  }
}
