import sinon from 'sinon'
import initialData from './data.json'
import shortid from 'shortid'

for(const path in initialData) {
  const records = initialData[path].map(record => {
    record._id = shortid.generate()
    return record
  })

  if(!localStorage.getItem(path)) localStorage.setItem(path, JSON.stringify(records))
}

const server = sinon.fakeServer.create({
  autoRespond: true
})

function getRecords(path) {
  const data = localStorage.getItem(path)
  return data ? JSON.parse(data) : null
}

function createRecord(path, data) {
  const records = getRecords(path)

  if(!records) return false

  data._id = shortid.generate()
  records.push(data)
  localStorage.setItem(path, JSON.stringify(records))

  return data
}

function getRecord(path, id) {
  const records = getRecords(path)
  return records.find(record => record._id === id)
}

function updateRecord(path, id, data) {
  const records = getRecords(path)
  let record = records.find(record => record._id === id)
  const index = records.indexOf(record)

  record = Object.assign(record, data)

  records.splice(index, 1, record)
  localStorage.setItem(path, JSON.stringify(records))

  return record
}

function deleteRecord(path, id) {
  const records = getRecords(path)
  const index = records.findIndex(record => record._id === id)

  if(index === -1) return false

  records.splice(index, 1)
  localStorage.setItem(path, JSON.stringify(records))
  return true
}

function getPathInfo(path) {
  return path.split('/').slice(1)
}

server.respondWith((xhr) => {
  let data = null
  let status = 200

  const [ root, id ] = getPathInfo(xhr.url)

  if(!(root in initialData)) xhr.respond(404)

  if(xhr.method === 'GET') {
    if(id) data = getRecord(root, id)
    else data = getRecords(root)

    if(!data) return xhr.respond(404)
  }

  if(xhr.method === 'POST') {
    data = createRecord(root, JSON.parse(xhr.requestBody))
    status = 201
  }

  if(xhr.method === 'PUT') {
    data = updateRecord(root, id, JSON.parse(xhr.requestBody))
    if(!data) return xhr.respond(404)
  }

  if(xhr.method === 'DELETE') {
    return deleteRecord(root, id) ? xhr.respond(204) : xhr.respond(404)
  }

  xhr.respond(status, {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }, JSON.stringify(data))
})
