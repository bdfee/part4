const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const helper = require('../utils/test_helper')

describe('where there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ 
      username: 'root', 
      passwordHash,
      name: 'root name'
    })
  
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper()
    
    const newUser = {
      username: 'testuser',
      name: 'test user',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await helper()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper()

    const newUser = {
      username: 'root',
      name: 'root duplicate test',
      password: 'password'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails with invalid username or password', async () => {
    const usersAtStart = await helper()

    const invalidPw = {
      username: 'aninvalidpw',
      password: '23'
    }
    
    await api
      .post('/api/users')
      .send(invalidPw)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const invalidUsername = {
      username: '12',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(invalidUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper()
    expect(usersAtEnd).toEqual(usersAtStart) 
  })
})

afterAll(() => {
  mongoose.connection.close()
})