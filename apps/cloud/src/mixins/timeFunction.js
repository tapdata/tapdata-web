import dayjs from '../plugins/dayjs'

export default {
  methods: {
    formatTime(date, placeholder = '', format = 'YYYY-MM-DD HH:mm:ss') {
      if (date === null) {
        return dayjs().format(format)
      } else if (date) {
        return dayjs(date).format(format)
      }
      return placeholder
    },
    fromNow(date, flag = false) {
      return dayjs(date).fromNow(flag)
    },
    duration(date, type) {
      return dayjs(date).duration(type)
    },
  },
}
