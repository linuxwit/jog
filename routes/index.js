
module.exports = function(app, passport) {
    app.get('/',function(req,res){

      //  res.sendfile('./views/index.html');
       res.render('index')
    })

    app.get('/post/:page',function(req,res){

        console.log (req.params.id);
        res.render('post')
    })
}