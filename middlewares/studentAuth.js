const Alumet = require('../models/alumet');

const studentAuth = (req, res, next) => {
    Alumet.findOne({
            _id: req.body.target
        })
        .then(alumet => {
            if (!req.cookies.alumetToken) {
                req.auth = false;
                return res.status(401).json({
                    error: 'Unauthorized'
                });
            } else {
                try {
                    const decodedToken = jwt.verify(req.cookies.alumetToken, tokenC);
                    req.auth = true;
                    req.alumet = decodedToken;
                } catch (error) {
                    req.auth = false;
                    return res.status(401).json({
                        error: 'Unauthorized'
                    });
                }
            }
            if (!alumet) return res.json({
                error: 'Alumet not found'
            });
            if (req.auth && req.alumet.id == alumet._id.toString()) {
                return next();
            } else {
                return res.json({
                    error: 'Unauthorized'
                });
            }
        })
        .catch(error => res.json({
            error
        }));
}

module.exports = studentAuth;