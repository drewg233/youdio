app.post('/login',
    passport.authenticate('login', {
        failureRedirect: '/login',
        failureFlash : true  
    }), function(req, res) {
        res.redirect(req.headers.referer);
    }
);

app.post('/login-name', function(req, res) {
    req.session.username = req.body.name;
    res.redirect(getLastUrl(req));
});

app.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash : true  
}));

app.get('/login', function(req, res) {
    req.session.lastUrl = 'login';
    loadGlobalData(req, function (globalData) {
        res.render('login', {
            globalData: globalData,
            title: 'Login',
            message: req.flash('error')
        });
    });
});

app.get('/logout', function(req, res) {
    req.session.username = '';
    req.logout();
    res.redirect('/');
});

app.get('/', function(req, res) {
    loadGlobalData(req, function (globalData) {
        var theroom = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        res.redirect("/" + theroom);
    });
});

app.get('/signup', function(req, res) {
    loadGlobalData(req, function (globalData) {
        res.render('signup', {
            globalData: globalData,
            title: 'My Chat'
        });
    });
});

app.get('/auth/google', passport.authenticate('google', { 
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email']
    }
), function(req, res) {
});

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
    req.session.username = req.user.displayName;
    res.redirect(getLastUrl(req));
});

app.get('/*', function(req, res) {
    if (req.params[0] != 'favicon.ico') {
        req.session.lastUrl = req.params[0];
    }
    loadGlobalData(req, function (globalData) {
        res.render('chat', {
            globalData: globalData,
            title: 'My Chat',
            chat_room: req.params[0]
        });
    });
});

function loadGlobalData(req, cb) {
    var data = {};
    if (req.session.username != undefined && req.session.username != '') {
        data.user = req.session.username;
        if (req.user._json.picture != undefined) {
        data.userimage = req.user._json.picture;
        }
    } else {
        if (req.user && req.user.username) {
            data.user = req.user.username;
        } else {
            data.user = '';
        }
    }
    data.server = req.headers.host;
    return cb(data);
}



function getLastUrl(req) {
    return (req.session.lastUrl != undefined ? '/'+req.session.lastUrl : '/');
}

function getUrlVars(url) {
    var vars = [], hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function ensureAuthenticated(req, res, next) {
    if (req.session.username != undefined && req.session.username != '') { return next(); }
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login?redirect='+req.url);
}
