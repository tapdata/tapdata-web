const express = require('express')
const app = express()
const port = 3000

var Mock = require('mockjs')
var service = require('./service')
const hostname = '0.0.0.0'

for (const url in service) {
	let mockData = service[url]
	app.all(url, (req, res) => {
		res.set('Content-Type', 'text/plain;charset=utf-8')
		res.status(200).end(JSON.stringify(Mock.mock(mockData)))
	})
}

app.listen(port, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})
