export function getPieOptions(data, op) {
  let options = {
    tooltip: {
      trigger: 'item'
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
