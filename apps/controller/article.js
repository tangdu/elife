/**
 * Created by tangdu on 14-3-3.
 * uuid.v1() 时间戳UUID
 * uuid.v4() 随机数UUID
 */
var uuid = require('node-uuid');

module.exports=function(app){
    var Artide=app.get("Artide");

    app.post("/add_article",function(req,res){
        var Artide=app.get("Artide");
        var artideBean=req.body;
        artideBean.id_=uuid.v1();
        artideBean.created=new Date();
        Artide.insert(artideBean,function(result){
            res.redirect("/");
        });
    });

    app.post("/edit_article",function(req,res){
        var artideBean=req.body;
        artideBean.updated=new Date();
        Artide.update(artideBean,function(result){
            res.redirect("/");
        });
    });

};