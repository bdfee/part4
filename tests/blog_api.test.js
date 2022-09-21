const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const url = '/api/blogs'


// const initialBlogs = [
//   {
//     title: 'test one title',
//     author: 'test one author',
//     url: 'www.1.com',
//     likes: 1,
//   },
//   {
//     title: 'test two title',
//     author: 'test two author',
//     url: 'www.2.com',
//     likes: 2,
//   }
// ]

beforeEach( async () => {
  await Blog.deleteMany({})

  // const blogObjects = initialBlogs.map(blog => new Blog(blog))
  // const promiseArray = blogObjects.map(blog => blog.save())
  // await Promise.all(promiseArray)
})

// test('server status 200, response is JSON', async () => {
//   await api
//     .get(url)
//     .expect(200)
//     .expect('Content-Type', /application\/json/)
// })

// test('correct number of blogs is returned', async () => {
//   const response = await api.get(url)
//   expect(response.body).toHaveLength(initialBlogs.length)
// })

// test('id is defined', async () => {
//   const response = await api.get(url)
//   expect(response.body[0].id).toBeDefined()
// })

test('a new post can be created', async () => {
  const newBlog = {
    title: 'add new blog',
    author: 'create new post',
    url: 'www.create.com',
    likes: 3
  }
  
  await api
    .post(url)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get(url)

  const title = response.body.map(r => r.title)

  expect(response.body).toHaveLength(1)
  expect(title).toContain(newBlog.title)
})

// test('if likes value is omitted from post request, 0 is defaulted and returned', async () => {
//   const newBlogNoLikes = {
//     title: 'add blog with no likes',
//     author: 'create new post',
//     url: 'www.create.com'
//   }

//   await api
//     .post(url)
//     .send(newBlogNoLikes)
//     .expect(201)

//   const response = await api.get(url)
//   const blog = response.body[response.body.length - 1]
//   expect(blog.likes).toBe(0)
// })

// test('if title or url props are missing, server responds 404 Bad Request', async () => {

//   const invalidBlog = {
//     author: 'invalid entry',
//     title: 'still invalid'
//   }

//   await api
//     .post(url)
//     .send(invalidBlog)
//     .expect(404)

//   const response = await api.get(url)
//   expect(response.body).toHaveLength(initialBlogs.length)
// })

// test('a blog can be deleted by id', async () => {

//   const initialResponse = await api.get(url)
//   const id = initialResponse.body[0].id

//   await api
//     .delete(`${url}/${id}`)
//     .expect(204)

//   const response = await api.get(url)
//   expect(response.body.length).toBe(initialBlogs.length - 1)
// })

// test('a blog can be updated by id', async () => {

//   const initialResponse = await api.get(url)
//   const initialBlog = initialResponse.body[0]
//   initialBlog.likes = initialBlog.likes + 1

//   await api
//     .put(`${url}/${initialBlog.id}`)
//     .send(initialBlog)

//   const response = await api.get(url)
//   expect(response.body[0].likes).toBe(initialBlog.likes)

// })


afterAll(() => {
  mongoose.connection.close()
})