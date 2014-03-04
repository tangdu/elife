
/*
 * GET users listing.
 */

module.exports=function(app){
    app.get("/login",function(req,res){
        res.render('signin',{message:false});
    });
    app.post("/login",function(req,res){
        var User=app.get("User");
        User.where(req.body,function(result){
            if(result && result.length>0){
                req.session.name = 'tangdu';
                req.session.user=result[0];
                res.send(res.session);
                res.redirect("/");
            }else{
                res.render('signin',{message:'用户名或密码错误'});
            }
        });
    });
    app.get("/logout",function(req,res){
        req.session.userId=null;
        res.redirect("/login");
    });
}