import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { connectionsApi, taskApi } from '@tap/api'

export default {
  mounted() {
    this.$nextTick(() => {
      this.initTour()
    })
  },

  beforeRouteUpdate(to, from, next) {
    const whiteList = ['connectionCreate']

    if (!whiteList.includes(to.name) && !this.driverObj) {
      this.initDriver()
    }

    next()
  },

  methods: {
    async getCount($in) {
      const { count } = await connectionsApi.count({
        where: JSON.stringify({
          connection_type: {
            $in
          }
        })
      })
      return count
    },

    async checkSourceCount() {
      const count = await this.getCount(['source', 'source_and_target'])
      return !count
    },

    async checkTargetCount() {
      const count = await this.getCount(['target', 'source_and_target'])
      return !count
    },

    /**
     * 获取复制任务数量
     * @returns {Promise<*>}
     */
    async checkTaskCount() {
      const { count } = await taskApi.count({
        where: JSON.stringify({
          syncType: 'migrate',
          is_deleted: false,
          status: {
            $nin: ['deleting', 'delete_failed']
          }
        })
      })
      return !count
    },

    getMenuStep(options) {
      return {
        type: options.type,
        route: options.route,
        element: options.element,
        popover: {
          description: options.description,
          showButtons: [],
          onPopoverRender: (popover, { state }) => {
            const unwatch = this.$watch('$route', to => {
              if (to.name === options.route) {
                this.driverObj.moveNext()
              }
              unwatch()
            })
          }
        }
      }
    },

    getButtonStep(options) {
      return {
        type: options.type,
        route: options.route,
        element: options.element,
        elementClick: (...args) => {
          //创建按钮点击后，隐藏引导
          this.driverObj.destroy()
          this.driverObj = null
        },
        onHighlightStarted: (element, step, options) => {
          element.addEventListener('click', step.elementClick)
        },
        onDeselected: (element, step, options) => {
          element.removeEventListener('click', step.elementClick)
        },
        popover: {
          description: options.description,
          showButtons: [],
          onPopoverRender: (popover, { state }) => {
            const unwatch = this.$watch('$route', to => {
              if (to.name !== options.route) {
                this.driverObj.movePrevious()
              }
              unwatch()
            })
          }
        }
      }
    },

    async getSteps() {
      const _steps = [
        // {
        //   key: 'instance',
        //   handle: () => true
        // },
        {
          key: 'sourceConnection',
          handle: this.checkSourceCount
        },
        {
          key: 'targetConnection',
          handle: this.checkTargetCount
        },
        {
          key: 'task',
          handle: this.checkTaskCount
        }
      ]
      const steps = []
      const stepMap = {
        instance: [
          {
            type: 'menu',
            route: 'Instance',
            element: '#menu-Instance',
            description: '请先启动您的 Agent 计算引擎'
          }
        ],
        sourceConnection: [
          {
            type: 'menu',
            route: 'connections',
            element: '#menu-connections',
            description: '请创建您的源数据库'
          },
          {
            type: 'button',
            route: 'connections',
            element: '#connection-list-create',
            description: '点击此处创建您的源库/目标库'
          }
        ],
        targetConnection: [
          {
            type: 'menu',
            route: 'connections',
            element: '#menu-connections',
            description: '请创建您的目标数据库'
          },
          {
            type: 'button',
            route: 'connections',
            element: '#connection-list-create',
            description: '点击此处创建您的目标数据库'
          }
        ],
        task: [
          {
            type: 'menu',
            route: 'migrateList',
            element: '#menu-migrate',
            description: '请创建您的第一个复制任务'
          },
          {
            type: 'button',
            route: 'migrateList',
            element: '#task-list-create',
            description: '点击此处创建您的第一个复制任务'
          }
        ]
      }

      for (let item of _steps) {
        const enable = await item.handle()

        if (enable) {
          stepMap[item.key].forEach(option => {
            if (option.type === 'menu') steps.push(this.getMenuStep(option))
            if (option.type === 'button') steps.push(this.getButtonStep(option))
          })
        }
      }

      return steps
    },

    async initDriver() {
      const steps = await this.getSteps()
      this.withoutTrour = false

      if (!steps.length) {
        this.withoutTrour = true
        return
      }

      this.driverObj = driver({
        allowClose: false,
        //   onHighlightStarted?: (element?: Element, step: DriveStep, options: { config: Config; state: State }) => void;;
        // onHighlighted?: (element?: Element, step: DriveStep, options: { config: Config; state: State }) => void;;
        // onDeselected?: (element?: Element, step: DriveStep, options: { config: Config; state: State }) => void;;
        /*onHighlightStarted: (element, step, options) => {
          console.log('onHighlightStarted', element, step, options) // eslint-disable-line
          if (step.elementClick) {
            element.addEventListener('click', step.elementClick)
          }
        },
        onHighlighted: (element, step) => {
          console.log('onHighlighted', element) // eslint-disable-line
          // if (step.elementClick) {
          //   element.removeEventListener('click', step.elementClick)
          // }
        },
        onDestroyStarted: element => {
          console.log('onDestroyStarted', element) // eslint-disable-line
        },*/
        steps
      })
      this.driverObj.drive(steps[0].type === 'menu' && this.$route.name === steps[0].route ? 1 : 0)
    },

    initTour() {
      this.initDriver()
    }
  }
}
