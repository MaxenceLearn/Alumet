const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const validateObjectId = require('../../middlewares/validateObjectId');
const postLayer = require('../../middlewares/postLayer');
const alumetAuth = require('../../middlewares/api/alumetAuth');
const Alumet = require('../../models/alumet');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Upload = require('../../models/upload');
const notification = require('../../middlewares/notification');

router.post('/:alumet/:wall', validateObjectId, alumetAuth, postLayer, notification("A créé un post"), async (req, res) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        owner: req.ownerId,
        ownerType: req.ownerType,
        type: req.body.type,
        typeContent: req.contentType,
        color: req.body.color,
        tcs: req.body.tcs,
        position: req.position,
        wallId: req.params.wall
    });
    post.save()
        .then(async (post) => {
            let editedPost = {
                ...post._doc
            };

            if (post.ownerType !== 'teacher') {
                if (req.cookies.alumetToken === editedPost.owner) {
                    editedPost.owning = true;
                }
                const decodedToken = jwt.verify(post.owner, process.env.TOKEN.toString());
                editedPost.owner = decodedToken.username;
            } else if (req.logged) {
                editedPost.owning = true;
            }

            if (post.type === 'file') {
                const upload = await Upload.findById(post.typeContent);

                if (upload) {
                    editedPost.fileName = upload.displayname;
                    editedPost.fileExt = upload.mimetype;
                }
            }

            res.json(editedPost);
        })
        .catch(error => res.json({
            error
        }));
});


router.get('/:alumet/:wall', validateObjectId, alumetAuth, async (req, res) => {
    try {
        const alumet = await Alumet.findById(req.params.alumet);

        if (!alumet) {
            return res.status(404).json({
                error: 'Unable to proceed your requests'
            });
        }

        if (!req.logged && !req.auth) {
            return res.status(404).json({
                error: 'Vous n\'avez pas les permissions pour effectuer cette action !'
            });
        }

        if (req.logged && !req.auth && alumet.owner !== req.user.id) {
            return res.status(404).json({
                error: 'Vous n\'avez pas les permissions pour effectuer cette action !'
            });
        }

        if (req.auth && !req.logged && alumet._id.toString() !== req.alumet.id) {
            return res.status(404).json({
                error: 'Vous n\'avez pas les permissions pour effectuer cette action !'
            });
        }

        const posts = await Post.find({
            wallId: req.params.wall
        }).sort({
            position: -1
        });

        const sendPosts = await Promise.all(posts.map(async (post) => {
            let editedPost = {
                ...post._doc
            };
            if (post.ownerType !== 'teacher') {
                if (req.cookies.alumetToken === editedPost.owner || req.logged) {
                    editedPost.owning = true;
                }
                const decodedToken = jwt.verify(post.owner, process.env.TOKEN.toString());
                editedPost.owner = decodedToken.username;
            } else if (req.logged && alumet.owner === req.user.id) {
                editedPost.owning = true;
            }
            if (post.type === 'file') {
                const upload = await Upload.findById(post.typeContent);

                if (upload) {
                    editedPost.fileName = upload.displayname;
                    editedPost.fileExt = upload.mimetype;
                }
            }
            if (editedPost.tcs === false) {
                return editedPost;
            } else if (req.auth && !req.logged && editedPost.tcs === true) {
                if (req.cookies.alumetToken === post.owner) {
                    return editedPost;
                } else {
                    return {
                        content: 'Ce post est uniquement visible par le professeur',
                        color: editedPost.color,
                    };
                }
            } else if (req.logged && alumet.owner === req.user.id) {
                return editedPost;
            }
            return editedPost;
        }));
        res.json(sendPosts);
    } catch (error) {
        console.error(error);
    }
});

router.patch('/:alumet/:wall/:post', validateObjectId, alumetAuth, postLayer, notification("A modifié un post"), (req, res) => {
    Post.findOneAndUpdate({
            _id: req.params.post
        }, {
            title: req.body.title,
            content: req.body.content,
            color: req.body.color,
        }, {
            runValidators: true
        })
        .then(() => {
            Post.findOne({
                    _id: req.params.post
                })
                .then(post => {
                    res.json(post);
                })
        })
        .catch(error => res.json({
            error
        }));
});

router.delete('/:alumet/:wall/:post', validateObjectId, alumetAuth, notification("A supprimé un post"), async (req, res) => {
    try {
        const alumet = await Alumet.findById(req.params.alumet);

        if (!alumet) {
            return res.status(404).json({
                error: 'Unable to proceed your requests'
            });
        }

        if (!req.logged && !req.auth) {
            return res.status(404).json({
                error: 'Vous n\'avez pas les permissions pour effectuer cette action !'
            });
        }

        const post = await Post.findById(req.params.post);

        if (req.auth && req.cookies.alumetToken !== post.owner) {
            return res.status(404).json({
                error: 'Vous n\'avez pas les permissions pour effectuer cette action !'
            });
        }

        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        if (req.logged && alumet.owner !== req.user.id && post.owner !== req.user.id) {
            return res.status(404).json({
                error: 'UVous n\'avez pas les permissions pour effectuer cette action !'
            });
        }



        const deletedPost = await Post.findByIdAndDelete(req.params.post);
        res.json(deletedPost);
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;