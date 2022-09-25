const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

const rootUser = {
  username: 'root',
  name: 'root',
  password: 'secret'
}

const testUser = {
  username: 'test user',
  name: 'test',
  password: 'secret'
}

const login = {
  username: 'test user',
  password: 'secret'
}

const blogPost = {
  title: 'test from jest',
  author: 'test',
  url: 'www.www.www'
}

let token = ''

beforeEach( async () => {
  // delete all user and blogs, create fresh user and retrieve token for api test
  await User.deleteMany({})
  
  await api
    .post('/api/users')
    .send(rootUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/users')
    .send(testUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api
    .post('/api/login')
    .send(login)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  // set token per test
  token = response.body.token

  await Blog.deleteMany({})

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blogPost)
    .expect(201)
    .expect('Content-Type', /application\/json/)
})


describe('basic API tests', () => {
  test('server status 200, response is JSON', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('correct number of blogs is returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(1)
  })

  test('blog id is defined', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
  
  test('a blog can be updated by id', async () => {
    const initialResponse = await api.get('/api/blogs')
    const initialBlog = initialResponse.body[0]
    initialBlog.likes = initialBlog.likes + 1

    await api
      .put(`${'/api/blogs'}/${initialBlog.id}`)
      .send(initialBlog)

    const response = await api.get('/api/blogs')
    expect(response.body[0].likes).toBe(initialBlog.likes)
  })
}) 

describe('token required api routes', () => {
  test('a new post can be created, and is attributed to the correct user', async () => {
    const newBlog = {
      title: 'add new blog',
      author: 'create new post',
      url: 'www.create.com',
      likes: 3
    }
    
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(2)

    const entry = response.body.map(res => [res.title, res.user.id])
    const user = await User.findOne({ username: 'test user' })

    expect(entry[response.body.length - 1]).toEqual([newBlog.title, user.id])
  })

  test('blog cannot be created without valid token', async () => {
    const newBlog = {
      title: 'add new blog',
      author: 'create new post',
      url: 'www.create.com',
      likes: 3
    }
    const errorResponse = await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer 12345zxcbnmxzbcshjgds')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(errorResponse.body.error).toBe('invalid token')

    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(1)
  })

  test('a blog can be deleted by id', async () => {

    const initialResponse = await api.get('/api/blogs')
    const id = initialResponse.body[0].id

    await api
      .delete(`${'/api/blogs'}/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(0)
  })

  test('a blog cannot be deleted without a valid token', async () => {

    const initialResponse = await api.get('/api/blogs')
    const id = initialResponse.body[0].id

    const errorResponse = await api
      .delete(`${'/api/blogs'}/${id}`)
      .set('Authorization', 'Bearer 346728943728934')
      .expect(401)
    
    expect(errorResponse.body.error).toBe('invalid token')

    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(1)
    
  })
})

describe('validation and required fields', () => {
  
  test('if title or url props are missing, server responds 404 Bad Request', async () => {
    const invalidBlog = {
      author: 'invalid entry',
      title: 'still invalid'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidBlog)
      .expect(404)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(1)
  })

  test('if likes value is omitted from post request, 0 is defaulted and returned', async () => {
    const newBlogNoLikes = {
      title: 'add blog with no likes',
      author: 'create new post',
      url: 'www.create.com'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlogNoLikes)
      .expect(201)

    const response = await api.get('/api/blogs')
    const blog = response.body[response.body.length - 1]
    expect(blog.likes).toBe(0)
  })
})

afterAll(() => {
  mongoose.connection.close()
})