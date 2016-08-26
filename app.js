/*jshint node:true*/
// app.js
// Copyright IBM Corp. 2015  All Rights Reserved.
// IBM Insights for Twitter Demo App

var express = require('express');
var routes = require('./routes');
var ibmdb = require('ibm_db');
var request = require('request'); //.defaults({
//    strictSSL: false
// });

// setup middleware
var app = express();
app.use(app.router);
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory


var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3002);

var insight_host = services["twitterinsights"]
    ? services["twitterinsights"][0].credentials.url
    : "https://a5b9de6b-0f07-450b-9881-50a6f717a182:g7Kv6NTchu@cdeservice.mybluemix.net";

var MAX_TWEETS = 20;

// dashDB
var db2 = services["dashDB"]
    ? services["dashDB"][0].credentials
    : {db: "BLUDB",
        hostname: "xxxx",
        port: 50000,
        username: "xxx",
        password: "xxx"};
var hasConnect = services["dashDB"] ? true : false;

var connString = "DRIVER={DB2};DATABASE=" + db2.db + ";UID=" + db2.username + ";PWD=" + db2.password + ";HOSTNAME=" + db2.hostname + ";port=" + db2.port;

// callback - done(err, data)
function insightRequest(path, query, done) {
    request({
        method: "GET",
        url: insight_host + '/api/v1/messages' + path,
        qs: {
            q: query,
            size: MAX_TWEETS
        }
    }, function(err, response, data) {
        if (err) {
            done(err);
        } else {
            if (response.statusCode == 200) {
                try {
                    done(null, JSON.parse(data));
                } catch(e) {
                    done({ 
                        error: { 
                            description: e.message
                        },
                        status_code: response.statusCode
                    });
                }
            } else {
                done({ 
                    error: { 
                        description: data 
                    },
                    status_code: response.statusCode
                });
            }
        }
    });
}

app.get('/api/search', function(req, res) {
    insightRequest("/search", req.param("q"), function(err, data) {
        if (err) {
            res.send(err).status(400);
        } else {
            res.json(data);
        }
    });
});

app.get('/api/count', function(req, res) {
    insightRequest("/count", req.param("q"), function(err, data) {
        if (err) {
            res.send(err).status(400);
        } else {
            res.json({
                query: req.param("q"),
                count: data.search.results
            });
        }
    });
});
app.get('/', routes.listSysTables(ibmdb,connString));

app.listen(port, host);
console.log('App started on port ' + port);

