const blogsRouter = require('express').Router()
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

    const user = await User.findOne()

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
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
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