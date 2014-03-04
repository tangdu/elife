/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var dbutil = require('./db');
var ejs = require('ejs');
var logger = require('./logger');
var domain = require('domain');
var app = express();

//日志
var accessLogfile = fs.createWriteStream('access.log', {
  flags: 'a'
});
//Express3 配置
app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.engine('.html', ejs.__express);
    app.set('view engine', 'html');
    app.set('controller', __dirname + '/apps/controller/');

    app.use(express.favicon());
    app.use(express.logger({
        stream: accessLogfile
    }));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret:"tangdu"}));//使用内存Session
    app.use(express.static(path.join(__dirname, 'public')));

    //监听domain的错误事件
    app.use(function (req,res, next) {
        var d = domain.create();
        d.on('error', function (err) {
            logger.ERROR(error);
            res.statusCode = 500;
            res.json({sucess:false, error: '服务器异常'});
            d.dispose();
        });
        d.add(req);
        d.add(res);
        d.run(next);
    });

    //app.use(app.router);
    //初始路由配置
    var controllerPath=app.get("controller");
    var files = fs.readdirSync(controllerPath);
    files.forEach(function(fileName, i) {
        var filePath = controllerPath + fileName;
        if(!fs.lstatSync(filePath).isDirectory()) {
            require(filePath)(app);
        }
    });

    //404及500
    app.use(function(req, res) {
        res.status(400);
        res.render("404");
    });
    app.use(function(error, req, res, next) {
        res.status(500);
        logger.ERROR(error);
        res.render("500", {
            'error': error
        });
    });

    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    //初始化数据连接池
    var db=dbutil.Instance();
    //初始化模型表，并保存在APP对象中
    var User=db.define('t_ef_user');
    var Artide=db.define('t_ef_artide');
    app.set("User",User);
    app.set("Artide",Artide);
});


http.createServer(app).listen(app.get('port'), function() {
    var date = new Date();
    var log = '\n';
    log += '------------------------------------------------------------\n';
    log += 'Express server listening on port \n'+app.get('port');
    log += 'Start time：' + date + '\n';
    log += 'Environment：' + app.settings.env + '\n';
    log += 'DB Connetion port：' + dbutil.config.port+ '\n';
    log += '------------------------------------------------------------\n';
    console.log(log);
});
