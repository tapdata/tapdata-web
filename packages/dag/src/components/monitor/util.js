export function getPieOptions(data, op) {
  let options = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#364252',
      borderColor: '#364252',
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      formatter: params => {
        const { marker, name, value } = params || {}
        let result = `<div class="text-end"><div>${marker}<span class="pl-1">${name}</span></div><div class="din-font">${value.toLocaleString()}</div></div>`
        return result
      }
    },
    textStyle: {
      rich: {
        orgname: {
          width: 80,
          color: '#535F72'
        },
        count: {
          padding: [0, 0, 0, 15],
          color: '#333C4A'
        }
      }
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      orient: 'vertical',
      itemWidth: 6,
      itemHeight: 6,
      formatter: name => {
        const count = 0
        const arr = [`{orgname|${name}}`, `{count|${count}}`]
        return arr.join('')
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '30%'],
        label: { show: false },
        labelLine: { show: false },
        data: [],
        top: 'top'
      }
    ]
  }
  if (op) {
    for (let key in op) {
      if (key === 'series') {
        options[key].forEach((el, index) => {
          Object.assign(el, op[key][index])
        })
      } else {
        Object.assign(options[key], op[key])
      }
    }
  }
  if (data?.length) {
    options.series[0].data = data.map(t => {
      return {
        name: t.name,
        value: t.value,
        itemStyle: {
          color: t.color
        }
      }
    })
    options.legend.formatter = name => {
      const count = options.series[0].data?.find(t => t.name === name)?.value || 0
      const arr = [`{orgname|${name}}`, `{count|${count.toLocaleString()}}`]
      return arr.join('')
    }
  }
  return options
}

export const TIMEFORMATMAP = {
  s: 'HH:mm:ss',
  m: 'HH:mm:ss',
  h: 'MM-DD HH:00',
  d: 'MM-DD'
}

/*
  - 间隔在1小时以内，粒度为5秒
  - 间隔在1个小时-1天，粒度为1分钟
  - 间隔超过1天小于30天，展示粒度按1小时
  - 间隔超过30天，展示粒度按照1天
  * */
export function getTimeGranularity(ms = 5000) {
  const spacing = ms
  let result = ''
  if (spacing <= 60 * 1000) {
    result = 's'
  } else if (spacing <= 60 * 60 * 1000) {
    result = 'm'
  } else if (spacing <= 24 * 60 * 60 * 1000) {
    result = 'h'
  } else {
    result = 'd'
  }
  return result
}
