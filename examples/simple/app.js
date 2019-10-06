/* global fakeApi */

// configure the database
fakeApi.configure({
  posts: {
    schema: '++id,title,content,user_id -> users.id',
    populate: { user: 'user_id' }
  },
  users: {
    schema: '++id,username'
  }
})

// add some data
fakeApi.loaddata({
  posts: [
    {
      id: 1,
      title: 'My First Post',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      user_id: 1
    },
    {
      id: 2,
      title: 'My Second Post',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      user_id: 1
    }
  ],
  users: [
    { id: 1, username: 'mickyginger' }
  ]
})

// start intercepting requests
fakeApi.listen()

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
