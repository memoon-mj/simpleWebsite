const express = require('express');
const Post = require('../models/post');
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
      {name: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const posts = await Post.paginate(query, {
    sort: {createdAt: -1}, 
    page: page, limit: limit
  });
  res.render('posts/index', {posts: posts, query: req.query});
}));

//게시글 생성
router.get('/new', (req, res, next) => {
  res.render('posts/new', {post: {}});
});

router.post('/', catchErrors(async (req, res, next) => {
  var post = new Post({
    title: req.body.title,
    name: req.body.name,
    content: req.body.content
  });
  await post.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/posts');
}));

//상세보기
router.get('/:id', catchErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const answers = await Answer.find({post: post.id});
  post.numReads++;    
  await post.save();
  res.render('posts/show', {post: post, answers: answers});
}));

//삭제하기
router.delete('/:id', catchErrors(async (req, res, next) => {
  await Post.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/posts');
}));

//답글달기
router.post('/:id/answers',   catchErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    req.flash('danger', 'Not exist post');
    return res.redirect('back');
  }

  var answer = new Answer({
    name: req.body.content,
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