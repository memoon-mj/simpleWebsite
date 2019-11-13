const express = require('express');
const Post = require('../models/post');
//const User = require('../models/user'); 
const Answer = require('../models/answer'); 
const catchErrors = require('../lib/async-error');

const router = express.Router();



/* GET posts listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const posts = await Post.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit
  });
  res.render('posts/index', {posts: posts, query: req.query});
}));

router.get('/new', (req, res, next) => {
  res.render('posts/new', {post: {}});
});

router.get('/:id/edit',catchErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  res.render('posts/edit', {post: post});
}));



router.put('/:id', catchErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    req.flash('danger', 'Not exist post');
    return res.redirect('back');
  }
  post.title = req.body.title;
  post.content = req.body.content;
  post.tags = req.body.tags.split(" ").map(e => e.trim());

  await post.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/posts');
}));

router.delete('/:id', catchErrors(async (req, res, next) => {
  await Post.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/posts');
}));

router.post('/',  catchErrors(async (req, res, next) => {
  const user = req.session.user;
  var post = new Post({
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
  });
  await post.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/posts');
}));

router.post('/:id/answers',catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const post = await Post.findById(req.params.id);

  if (!post) {
    req.flash('danger', 'Not exist post');
    return res.redirect('back');
  }

  var answer = new Answer({
    post: post._id,
    content: req.body.content
  });
  await answer.save();
  post.numAnswers++;
  await post.save();

  req.flash('success', 'Successfully answered');
  res.redirect(`/posts/${req.params.id}`);
}));



module.exports = router;