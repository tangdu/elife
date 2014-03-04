
/*
 * GET home page.
 */
var filter_rex=/(.png$)|(.jpg$)|(.css$)|(.js$)|(^\/static)/gi;
module.exports=function(app){
    app.all("*",function(req,res,next){
        if(filter_rex.test(req.url) || req.url=="/login"){
            next();
        }else{
            if(req.session.user){ //会话控制
                res.locals.user=req.session.user;
                next();
            }else{
                res.redirect("/login");
            }
        }
    });
	app.get("/",function(req,res){
        res.render('index');
	});

    //查询生活类型文章
    app.get("/life",function(req,res){
        var Artide=app.get("Artide");
        var params={type:'1',status:'02'};
        Artide.where(params,function(result){
            res.render('life',{artides:result});
        });
    });
    app.get("/travel",function(req,res){
        res.render('travel');
    });
    app.get("/work",function(req,res){
        res.render('work');
    });
    app.get("/issue_blog",function(req,res){
        res.render('issue_blog');
    });
}