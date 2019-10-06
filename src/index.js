import xhook from 'xhook'
import Dexie from 'dexie'
import relationships from 'dexie-relationships'

class FakeJsonAPI {
  constructor() {
    this.db = new Dexie('fake-json-api', { addons: [relationships] })
  }

  configure(schema) {
    this.schema = schema

    const stores = {}
    for(const table in schema) {
      stores[table] = schema[table].schema
    }

    this.db.version(1)
      .stores(stores)
  }

  loaddata(data) {
    for(const store in data) {
      this.db[store].count()
        .then(count => {
          if(!count) return this.db[store].bulkPut(data[store])
        })
    }
  }

  getRecords(table) {
    return this.db[table].with(this.schema[table].populate || {})
  }

  getRecord(table, id) {
    return this.db[table].where({ id: +id }).with(this.schema[table].populate || {}).then(records => records[0])
  }

  createRecord(table, data) {
    return this.db[table].add(data)
      .then(id => this.getRecord(table, id))
  }

  updateRecord(table, id, data) {
    return this.db[table].update(+id, data)
      .then(() => this.getRecord(table, id))
  }

  deleteRecord(table, id) {
    return this.db[table].delete(+id)
  }

  getPathInfo(path) {
    return path.match(/\/\/(.+)?\/(.+)$/)[2].split('/')
  }

  jsonify(data) {
    const jsonified = {}

    Object.getOwnPropertyNames(data).forEach(key => {
      jsonified[key] = typeof(key) === 'object' ? JSON.stringify(data[key]) : data[key]
    })

    return jsonified
  }

  toJSON(data) {
    return JSON.stringify(data instanceof Array ? data.map(this.jsonify) : this.jsonify(data))
  }

  listen() {

    xhook.before((request, callback) => {

      setTimeout(async () => {
        let data = null
        let status = 200

        const [ table, id ] = this.getPathInfo(request.url)

        if(request.method === 'GET') {
          data = id ? await this.getRecord(table, id) : await this.getRecords(table)
          if(!data) return request.respond(404)
        }

        if(request.method === 'POST') {
          data = await this.createRecord(table, JSON.parse(request.body))
          status = 201
        }

        if(request.method === 'PUT') {
          data = await this.updateRecord(table, id, JSON.parse(request.body))
          if(!data) return request.respond(404)
        }

        if(request.method === 'DELETE') {
          data = await this.getRecord(table, id)
          if(data) {
            await this.deleteRecord(table, id)
            return callback({ status: 204 })
          }

          return callback({ status: 404 })
        }

        callback({
          status,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          },
          text: this.toJSON(data)
        })
      }, 500)
    })
  }

}

export default new FakeJsonAPI()
