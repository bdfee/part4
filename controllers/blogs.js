const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blog = await Blog.find({}).populate('user', 'username name id')
  
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const { title, url, author, likes } = request.body

  if (!title || !url) {
    response.status(404).end()
  } else {

    if (!request.token) 
      response.status(401).json({ error: 'token missing' })
    
    try {
      const decodedToken = jwt.verify(request.token, process.env.SECRET)
      const user = await User.findById(decodedToken.id)

      const blog = new Blog({
        title: title,
        author: author,
        url: url,
        likes: likes,
        user: user._id
      })

      const savedBlog = await blog.save()
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()

      response.status(201).json(savedBlog)
    }
    catch(e) {
      return response.status(401).json({ error: 'token incorrect' })
    }
  }  
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!request.token) 
    response.status(401).json({ error: 'token missing' })

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)
   
    const blog = await Blog.findById(request.params.id)

    if (user._id.toString() === blog.user.toString()) {
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } else {
      return response.status(401).json({ error: 'unauthorized to delete'})
    }
  } 
  catch(e) {
    return response.status(401).json({ error: 'token incorrect' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const blog = {
    title: title,
    author: author,
    url: url,
    likes: likes
  }

  const existingBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})
  response.json(existingBlog)
})

module.exports = blogsRouter