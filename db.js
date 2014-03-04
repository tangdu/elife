/**
 *MySQL Model
 **/
var mq = require("mysql");
var logger = require('./logger');
var mutils = require('./mutils');
var uuid = require('node-uuid');

var config_ = {
  host: '127.0.0.1',
  port: '3306',
  user: 'elife',
  password: 'elife',
  database: 'elife'
}
exports.config = config_;

var createPool = function() {
  return mq.createPool(config_);
}

//分页对象
  function Page(config) {
    this.start = config.start || 0;
    this.end = config.end || 20;
    this.totalCount = 0;
    this.totalPage = 0;
    this.pageSize = config.pageSize || 20;
    this.data = config.data || null;
  }
exports.Page = Page;

var db = null;
//查询工具类
function DBUtil() {
  this.pool = createPool();
  this.tables = [];
  var me = this;

  this.define = function(tablename, config) {
    var th = {};
    th.name = tablename;
    this.tables.push(th);

    th.getConnection = function(callback) {
      me.pool.getConnection(function(err, connection) {
        if (err) {
          throw err;
        }
        callback(connection);
      });
    };

    //save
    th.insert = function(values, callback) {
      if (values) {
        this.getConnection(function(connection) {
          var query = connection.query("insert into " + th.name + " set ?", values, function(err, result) {
            if (err) {
              throw err;
            }
            if (callback) {
              callback(result);
            }
            connection.release(); //release
          });
          logger.debug(query.sql);
        })
      }
    };

    //get
    th.get = function(ID, callback) {
      if (ID != null && ID != "") {
        //console.log(this);
        this.getConnection(function(connection) {
          var query = connection.query("select * from " + th.name + " where id_=?", ID, function(err, result) {
            if (err) {
              throw err;
            }
            if (callback) {
              callback(result);
            }
            connection.release(); //release
          });
          logger.debug(query.sql);
        });
      }
    };

    //update
    th.update = function(values, callback) {
      if (values) {
        this.getConnection(function(connection) {
          var query = connection.query("update  " + th.name + " set ? where id_=" + connection.escape(values.id_) , values, function(err, result) {
            if (err) {
              throw err;
            }
            if (callback) {
              callback(result);
            }
            connection.release(); //release
          });
          logger.debug(query.sql);
        });
      }
    };

    //delete
    th.remove = function(ID, callback) {
      if (ID != null && ID != "") {
        this.getConnection(function(connection) {
          var query = connection.query("delete  from  " + th.name + "  where id_=?", ID, function(err, result) {
            if (err) {
              throw err;
            }
            if (callback) {
              callback(result);
            }
            connection.release(); //release
          });
          logger.debug(query.sql);
        });
      }
    }

    //exists
    th.exists = function(tablename, callback) {
      if (tablename) {
        this.getConnection(function(connection) {
          var sql = "select table_name from information_schema.tables where table_schema='" + config_.database + "' and table_name='" + tablename + "'";
          var query = connection.query(sql, function(err, result) {
            if (err) {
              throw err;
            }
            if (callback) {
              callback(result);
            }
            connection.release(); //release
          });
        });
      }
    }

    //clear
    this.clear = function(tablename, callback) {
      if (tablename) {
        this.getConnection(function(connection) {
          var sql = "TRUNCATE TABLE " + tablename;
          var query = connection.query(sql, function(err, result) {
            if (err) {
              throw err;
            }
            if (callback) {
              callback(result);
            }
            connection.release(); //release
          });
        });
      }
    }

    //count
    th.count = function(callback) {
      this.getConnection(function(connection) {
        var query = connection.query("select count(*) as count from " + th.name, function(err, result) {
          if (err) {
            throw err;
          }
          callback(result[0].count);
          connection.release(); //release
        });
        logger.debug(query.sql);
      });
    }
    th.countBySql = function(sql, callback) {
      this.getConnection(function(connection) {
        var query = connection.query("select count(*) as count from ( " + sql + " ) T", function(err, result) {
          if (err) {
            throw err;
          }
          callback(result[0].count);
          connection.release(); //release
        });
        logger.debug(query.sql);
      });
    }

    //query
    th.where = function(obj, callback) {
      var sql = "select * from " + th.name + " where 1=1";
      if (obj) {
        for (var pro in obj) {
          if (mutils.isString(obj[pro])) {
            sql += " and " + pro + "=" + me.pool.escape(obj[pro]) + "";
          } else {
            sql += " and " + pro + "=" + me.pool.escape(obj[pro]);
          }
        }
      }

      this.getConnection(function(connection) {
        var query = connection.query(sql, function(err, result) {
          if (err) {
            throw err;
          }
          if (callback) {
            callback(result);
          }
          connection.release(); //release
        });
        logger.debug(query.sql);
      });
    }
    th.queryAll = function(callback) {
      this.getConnection(function(connection) {
        var query = connection.query("select * from " + th.name, function(err, result) {
          if (err) {
            throw err;
          }
          if (callback) {
            callback(result);
          }
          connection.release(); //release
        });
        logger.debug(query.sql);
      });
    }
    th.queryPage = function(page, callback) {
      th.count(function(result) {
        //计数
        page.totalCount = result;
        page.totalPage = Math.ceil(page.totalCount / page.pageSize);
        //分页
        this.getConnection(function(connection) {
          var query = connection.query("select * from " + th.name + " limit " + page.start + "," + page.end + "", function(err, result) {
            if (err) {
              throw err;
            }
            page.data = result;
            callback(page);
          });
          logger.debug(query.sql);
        });
      });
    }
    th.queryPageBySql = function(sql, page, callback) {
      th.countBySql(sql, function(result) {
        //计数
        page.totalCount = result[0].count;
        page.totalPage = Math.ceil(page.totalCount / page.pageSize);
        //分页
        this.getConnection(function(connection) {
          var query = connection.query("select * from  ( " + sql + " ) T limit " + page.start + "," + page.end + "", function(err, result) {
            if (err) {
              throw err;
            }
            page.data = result;
            callback(page);
            connection.release(); //release
          });
          logger.debug(query.sql);
        });
      });
    }
    return th;
  };
};

exports.Instance = function() {
  if (db == null) {
    db = new DBUtil();
  }
  return db;
};

//test
/*var db = this.Instance();
var User = db.define('t_ef_user');
User.get('1', function(result) {
  console.log(result);
});*/