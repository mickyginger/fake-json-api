# Fake JSON API

A small package that intercepts AJAX requests and responds with data stored locally in IndexedDB. It attempts to fake an actual JSON API.

> This is a package that I've put together help make more realistic challenges for [frontendmentor.io](https://beta.frontendmentor.io). I've released it here so that it might help others. Please let me know if you'd like a feature added by opening an issue on the github page.

## Setup

Install the package:

```
npm i fake-json-api
```

or

```
yarn add fake-json-api
```

Import it in your code:

```js
import api from 'fake-json-api'
```

or

```js
const api = require('fake-json-api')
```

Configure the database:

```js
api.configure({
  posts: {
    schema: '++id,title,content'
  }
})
```

Uses [Dexie.js stores syntax][1] to define the schema

Add some data:

```js
api.loaddata({
  posts: [
    { id: 1, title: 'Test post 1', content: 'blah blah blah' },
    { id: 2, title: 'Test post 2', content: 'blah blah blah' }
  ]
})
```

Start it intercepting requests:

```js
api.listen()
```

Make a request:

```js
fetch(/posts)
  .then(res => res.json())
  .then(data => console.log(res.data))
```

Available endpoints would be:

- GET `/posts`
- POST `/posts`
- GET `/posts/:id`
- PUT `/posts/:id`
- DELETE `/posts/:id`

## Relational data

Works with [dexie-relationships][2] for relational data. So for example if you want to add users to posts:

```js
api.configure({
  posts: {
    schema: '++id,title,content,user_id -> users.id',
    populate: { user: 'user_id' }
  },
  user: {
    schema: '++id,username',
    populate: { posts: 'posts' }
  }
})

api.loaddata({
  posts: [
    { id: 1, title: 'Test post 1', content: 'blah blah blah', user_id: 1 },
    { id: 2, title: 'Test post 2', content: 'blah blah blah', user_id: 2 }
  ],
  users: [
    { id: 1, username: 'mickyginger' },
    { id: 2, username: 'mattstuddert' }
  ]
})
```

Users would now be nested in posts, and each user object would have an array of nested posts.

Available endpoints would be:

- GET `/posts`
- POST `/posts`
- GET `/posts/:id`
- PUT `/posts/:id`
- DELETE `/posts/:id`


- GET `/users`
- POST `/users`
- GET `/users/:id`
- PUT `/users/:id`
- DELETE `/users/:id`

## Examples

[Check out the examples](examples) for code snippets and more context.

[1]: https://dexie.org/docs/Version/Version.stores
[2]: https://github.com/ignasbernotas/dexie-relationships
