import api from 'fake-json-api'
import schema from '../schema.json'
import data from '../data.json'

api.configure(schema)
api.loaddata(data)
api.listen()

import React from 'react'
import ReactDOM from 'react-dom'

import axios from 'axios'

class App extends React.Component {

  componentDidMount() {
    axios.get('/posts')
      .then(res => this.setState({ posts: res.data }))
  }

  render() {
    return (
      <div>
        <h1>Posts</h1>

        <ul>
          {this.state && this.state.posts.map(post =>
            <li key={post.id}>
              <h2>{post.title}</h2>
              <h3><em>{post.user.username}</em></h3>
              <p>{post.content}</p>
            </li>
          )}
        </ul>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
