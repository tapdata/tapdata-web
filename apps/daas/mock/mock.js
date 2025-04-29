const express = require('express')
const app = express()
require('express-ws')(app)
const port = 30300

const Mock = require('mockjs')
const service = require('./service')
const hostname = '0.0.0.0'

for (const url in service) {
  let mockData = service[url]
  app.all(url, (req, res) => {
    if (Object.prototype.toString.call(mockData) == '[object Function]') {
      mockData = mockData({ req, res })
    }
    res.status(200).end(JSON.stringify(Mock.mock(mockData)))
  })
}
app.ws('/ws/agent', (ws, req) => {
  ws.on('message', (msg) => {
    console.log('ws:', msg)
    ws.send(
      JSON.stringify({
        type: 'aaa',
        data: {
          a: 111,
        },
      }),
    )
  })
  console.log('socket', req.testing)
})

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
