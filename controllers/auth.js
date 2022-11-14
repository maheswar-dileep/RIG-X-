const db = require('../model/connection');
const adminDataDB = require('../config/admin_pass');

module.exports = {
    authInit: async (req, res, next) => {
        if (req.session.user) {
            let userData = await db.users.findOne({ _id: req.session.user });
            if (userData.blocked) {
                req.user = null;
            } else {
                req.user = userData;
            };
        } else {
            req.user = null;
        };

        if (req.session?.admin) {
            let adminData = adminDataDB.userid;
            if (adminData.blocked) {
                req.admin = null;
            } else {
                req.admin = adminData;
            };
        } else {
            req.admin = null;
        };

        next();
    },
    verifyUser: function (req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect('/login');
        }
    },
    mustLogout: function (req, res, next) {
        if (req.user) {
            res.redirect('/');
        } else {
            next();
        }
    },
    verifyUserAPI: function (req, res, next) {
        if (req.user) {
            next();
        } else {
            res.send('unauthorized');
        }
    },
    mustLogoutAPI: function (req, res, next) {
        if (req.user) {
            res.send('Forbidden');
        } else {
            next();
        }
    },
    verifyAdmin: function (req, res, next) {
        if (req.admin) {
            next();
        } else {
            res.redirect('/admin/login');
        }
    },
    adminMustLogout: function (req, res, next) {
        if (req.admin) {
            res.redirect('/admin');
        } else {
            next();
        }
    },
    verifyAdminAPI: function (req, res, next) {
        if (req.admin) {
            next();
        } else {
            res.send('unauthorized');
        }
    },
    mustLogoutAdminAPI: function (req, res, next) {
        if (req.admin) {
            res.send('Forbidden');
        } else {
            next();
        }
    },
};