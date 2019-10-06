import api from 'fake-json-api'
import schema from '../schema.json'
import data from '../data.json'

api.configure(schema)
api.loaddata(data)
api.listen()

const ul = document.querySelector('ul')

fetch('/posts')
  .then(res => res.json())
  .then(data =>
    data.forEach(post => {
      const li = document.createElement('LI')
      li.innerHTML = `
        <h2>${post.title}</h2>
        <h3><em>${post.user.username}</em></h3>
        <p>${post.content}</p>
      `

      ul.appendChild(li)
    })
  )
