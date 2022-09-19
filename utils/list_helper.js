var _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  let sum = 0

  blogs.forEach((blog) => {
    sum += blog.likes
  })

  return sum
}

const favoriteBlog = (blogs) => {
  if (blogs.length) {
    const likesArr = blogs.map(blog => blog.likes)
    const idx = likesArr.indexOf(Math.max(...likesArr))
    const { title, author, likes } = blogs[idx]
    
    const favorite = {
      title,
      author,
      likes
    }

    return favorite
  } else { 
    return
  }
}

const mostBlogs = (blogs) => {
  return _(blogs)
    .groupBy('author')
    .map((blog, key) => ({
      author: key,
      blogCount: blog.length
    }))
    .orderBy('blogCount', 'desc')
    .value()[0]
}
  
const mostLikes = (blogs) => {
  return _(blogs)
    .groupBy('author')
    .map((blog, key) => ({
      author: key,
      likes: _.sumBy(blog, 'likes') 
    }))
    .orderBy('likes', 'desc')
    .value()[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostLikes,
  mostBlogs
}