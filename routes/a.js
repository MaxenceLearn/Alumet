const express = require('express');
const router = express.Router();
const path = require('path');
const Alumet = require('../models/alumet');
const validateObjectId = require('../middlewares/validateObjectId');

router.get('/:id', validateObjectId, (req, res) => {
    if (!req.auth || req.alumet.id != req.params.id) return res.redirect(`/portal/${req.params.id}`);
    const filePath = path.join(__dirname, '../views/pages/alumet.html');
    res.sendFile(filePath);
});

router.get('/edit/:id', validateObjectId, (req, res) => {
    if (!req.logged) return res.redirect(`/portal/${req.params.id}`);
    Alumet.findOne({
        _id: req.params.id
    }).then(alumet => {
        if (!alumet) return res.redirect("/404");
        if (alumet.owner.toString() !== req.user.id) return res.redirect(`/portal/${req.params.id}`);
        res.clearCookie('alumetToken');
        const filePath = path.join(__dirname, '../views/pages/editor.html');
        res.sendFile(filePath);
    });
});

module.exports = router;