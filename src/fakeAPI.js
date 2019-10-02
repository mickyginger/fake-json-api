import sinon from 'sinon'
import initialData from './data.json'
import Dexie from 'dexie'

const db = new Dexie('myDb')

const stores = {}
for(const store in initialData) {
  stores[store] = '++id,' + Object.keys(initialData[store][0]).join(',')
}

db.version(1)
  .stores(stores)

for(const store in initialData) {
  db[store].count()
    .then(count => {
      if(!count) return db[store].bulkPut(initialData[store])
    })
    .then(() => db[store].toArray())
}

var xhr = sinon.useFakeXMLHttpRequest()

function getRecords(store) {
  return db[store].toArray()
}

function createRecord(store, data) {
  return db[store].add(data)
    .then(id => db[store].get(id))
}

function getRecord(store, id) {
  return db[store].get(+id)
}

function updateRecord(store, id, data) {
  return db[store].update(+id, data)
    .then(() => db[store].get(+id))
}

function deleteRecord(store, id) {
  return db[store].delete(+id)
}

function getPathInfo(path) {
  return path.split('/').slice(1)
}

xhr.onCreate = (xhr) => {

  setTimeout(async () => {
    let data = null
    let status = 200

    const [ store, id ] = getPathInfo(xhr.url)

    if(xhr.method === 'GET') {
      if(id) data = await getRecord(store, id)
      else data = await getRecords(store)

      if(!data) return xhr.respond(404)
    }

    if(xhr.method === 'POST') {
      data = await createRecord(store, JSON.parse(xhr.requestBody))
      status = 201
    }

    if(xhr.method === 'PUT') {
      data = await updateRecord(store, id, JSON.parse(xhr.requestBody))
      if(!data) return xhr.respond(404)
    }

    if(xhr.method === 'DELETE') {
      data = await getRecord(store, id)
      if(data) {
        await deleteRecord(store, id)
        return xhr.respond(204)
      }

      return xhr.respond(404)
    }

    xhr.respond(status, {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }, JSON.stringify(data))
  }, 0)
}
