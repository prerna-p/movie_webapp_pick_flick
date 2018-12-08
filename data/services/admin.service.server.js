module.exports = app =>{

    app.get('/api/admin/user',findAllUsers);
    app.delete('/api/admin/user/:userId',deleteUser);
    app.post('/api/admin/user',updateUser);
    app.get('/api/admin/user/favMovies', findAllUserFavMovies);
    app.get('/api/admin/allFavoriteMovies', findAllFavouriteMovies);
    app.delete('/api/admin/favoriteMovie/:favMovieId', deleteFavouriteMovie);

    const userDao = require('../dao/user.dao.server');
    const likeDao = require('../dao/like.dao.server');
    const fanDao = require('../dao/fan.dao.server');
    const recommendationDao = require('../dao/recommendation.dao.server');


    function findAllUsers(req,res){
        let user = req.session.currentUser;
        if (user === undefined) {
            res.sendStatus(500);
        }
        else if (user.type !== 'Admin') {
            res.sendStatus(501);
        }
        else {
            userDao.findAllUsers()
                .then(users =>
                    res.json(users))
        }
    }

    function deleteUser(req,res){
        let id = req.params['userId']
        userDao.deleteUser(id)
            .then(() => recommendationDao.deleteRec(id)
                .then(() => fanDao.delFollower(id)
                    .then(() => fanDao.deleteFan(id)
                        .then(() => likeDao.deleteLike(id))
                    )
                )
            )
    }

    function updateUser(req,res){
        let user = req.body;
        if (user._id === undefined) {
            createUser(user)
                .then(() => res.sendStatus(201))
        }else{
            userDao.updateUser(user._id,user)
                .then(result => res.sendStatus(200));
        }
    }


    function createUser(user){
        userDao.createUser(user);
    }


    function findAllUserFavMovies(req,res){
        let user = req.session.currentUser;
        if (user.type !== 'Admin') {
            res.sendStatus(501);
        }
        else {
            userDao.findAllUserFavMovies()
                .then(users =>
                    res.json(users))
        }

    }

    function findAllFavouriteMovies(req,res){
        likeDao.findAllFavouriteMovies()
            .then((result) =>
                res.json(result))

    }

    function deleteFavouriteMovie(req,res){
        likeDao.deleteFavouriteMovie(req.params['favMovieId'])
            .then(result =>
                res.sendStatus(200));
    }

};