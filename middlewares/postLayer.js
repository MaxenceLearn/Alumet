const Alumet = require('../models/alumet');
const Post = require('../models/post');
const Upload = require('../models/upload');
const Wall = require('../models/wall');

const postLayer = async (req, res, next) => {
    try {
        const alumet = await Alumet.findOne({ _id: req.params.alumet });
        const wall = await Wall.findOne({ _id: req.params.wall });
        if (!alumet || !wall) return res.status(404).json({ error: 'Unable to proceed your requests' });
        if (!req.logged && !req.auth) return res.status(404).json({ error: 'Unauthorized x000' });

        if (req.logged) {
            req.ownerId = req.user.id;
            req.ownerType = 'teacher';
            if (alumet.owner !== req.user.id) return res.status(404).json({ error: 'Unauthorized' });
            if (wall.alumet !== alumet._id.toString()) return res.status(404).json({ error: 'Unauthorized x001' });
        }

        if (req.auth) {
            req.ownerId = req.cookies.alumetToken;
            req.ownerType = 'student';
            if (alumet._id.toString() !== req.alumet.id) return res.status(404).json({ error: 'Unauthorized x002' });
            if (wall.alumet !== req.alumet.id) return res.status(404).json({ error: 'Unauthorized x003' });
            if (wall.post === false) return res.status(404).json({ error: 'Unauthorized x004' });
        }

        if (req.body.title === '' && req.body.content === '' && !req.body.option) {
            return res.status(400).json({ error: 'Unable to proceed your requests' });
        }
        

        if (req.body.option === 'file') {
            req.body.type = 'file';
            req.contentType = req.body.fileID
            const upload = await Upload.findOne({ _id: req.body.fileID });
            if (!upload) return res.status(404).json({ error: 'Unable to proceed your requests x001' });
            if (req.logged) {
                if (upload.owner !== req.user.id) return res.status(404).json({ error: 'Unauthorized x006' });
            }
            if (req.auth) {
                if (upload.owner !== req.cookies.alumetToken) return res.status(404).json({ error: 'Unauthorized x007' });
            }
        } else if(req.body.option === 'link') {
            if(/^(http:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(req.body.link) || /^(https:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(req.body.link)) {
                req.contentType = req.body.link;
                req.body.type = 'link';
            } else {
                return res.status(404).json({ error: 'Lien incorrect' });
            }
            if (req.body.link === '') return res.status(404).json({ error: 'Unauthorized x008' });
        } else {
            req.body.type = 'default';
        }
        let post = await Post.findOne({ wallId: req.params.wall }).sort({ position: -1 })
        req.position = post ? post.position + 1 : 0;
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ error: 'Unable to proceed your requests x002' });
    }
    next();
};

module.exports = postLayer;
