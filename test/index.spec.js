/* global describe, it, expect, beforeEach, afterEach */
import 'fake-indexeddb/auto'
import api from '../src/index'
import schema from './schema.json'
import data from './data.json'

describe('vanilla JS test', () => {

  beforeEach((done) => {
    api.configure(schema)
    api.loaddata(data)
    api.listen()
    done()
  })

  afterEach((done) => {
    api.destroy()
      .then(done)
  })

  it('should return a 200 response', (done) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/posts')
    xhr.send()

    xhr.addEventListener('loadend', () => {
      expect(xhr.status).toBe(200)
      done()
    })
  })

  it('should return a valid JSON response', (done) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/posts')
    xhr.send()

    xhr.addEventListener('loadend', () => {
      expect(xhr.getAllResponseHeaders()).toContain('application/json')
      expect(JSON.parse(xhr.responseText) instanceof Array).toBe(true)
      done()
    })
  })
})
