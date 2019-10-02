import React from 'react'
import ReactDOM from 'react-dom'

import './fakeAPI'

import axios from 'axios'

class App extends React.Component {

  componentDidMount() {
    axios.get('/posts/2')
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
