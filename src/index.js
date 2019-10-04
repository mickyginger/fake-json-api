import React from 'react'
import ReactDOM from 'react-dom'

import schema from './schema.json'
import initialData from './data.json'

import api from './fakeAPI'

api.configure(schema)
api.loaddata(initialData)
api.listen()

import axios from 'axios'

class App extends React.Component {

  componentDidMount() {
    axios.get('/users/1')
      .then(res => console.log(res.data))
  }

  render() {
    return (
      <h1>Hello World!</h1>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
