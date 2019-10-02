import sinon from 'sinon'
import schema from './schema.json'
import initialData from './data.json'
import Dexie from 'dexie'
import relationships from 'dexie-relationships'

const db = new Dexie('fem', { addons: [relationships] })

const stores = {}
for(const table in schema) {
  stores[table] = schema[table].schema
}

db.version(1)
  .stores(stores)

for(const store in initialData) {
  db[store].count()
    .then(count => {
      if(!count) return db[store].bulkPut(initialData[store])
    })
}

var xhr = sinon.useFakeXMLHttpRequest()

function getRecords(table) {
  return db[table].with(schema[table].populate || {})
}

function getRecord(table, id) {
  return db[table].where({ id: +id }).with(schema[table].populate || {}).then(records => records[0])
}

function createRecord(table, data) {
  return db[table].add(data)
    .then(id => getRecord(table, id))
}

function updateRecord(table, id, data) {
  return db[table].update(+id, data)
    .then(() => getRecord(table, id))
}

function deleteRecord(table, id) {
  return db[table].delete(+id)
}

function getPathInfo(path) {
  return path.split('/').slice(1)
}

function jsonify(data) {
  const jsonified = {}

  Object.getOwnPropertyNames(data).forEach(key => {
    jsonified[key] = typeof(key) === 'object' ? JSON.stringify(data[key]) : data[key]
  })

  return jsonified
}

function toJSON(data) {
  return JSON.stringify(data instanceof Array ? data.map(jsonify) : jsonify(data))
}

xhr.onCreate = (xhr) => {

  setTimeout(async () => {
    let data = null
    let status = 200

    const [ table, id ] = getPathInfo(xhr.url)

    if(xhr.method === 'GET') {
      data = id ? await getRecord(table, id) : await getRecords(table)
      if(!data) return xhr.respond(404)
    }

    if(xhr.method === 'POST') {
      data = await createRecord(table, JSON.parse(xhr.requestBody))
      status = 201
    }

    if(xhr.method === 'PUT') {
      data = await updateRecord(table, id, JSON.parse(xhr.requestBody))
      if(!data) return xhr.respond(404)
    }

    if(xhr.method === 'DELETE') {
      data = await getRecord(table, id)
      if(data) {
        await deleteRecord(table, id)
        return xhr.respond(204)
      }

      return xhr.respond(404)
    }

    xhr.respond(status, {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }, toJSON(data))
  }, 500)
}
