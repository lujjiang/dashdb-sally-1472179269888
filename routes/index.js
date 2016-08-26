var request = require('request');
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var insight_host = services["twitterinsights"]
    ? services["twitterinsights"][0].credentials.url
    : "https://a5b9de6b-0f07-450b-9881-50a6f717a182:g7Kv6NTchu@cdeservice.mybluemix.net";
var MAX_TWEETS = 20;
exports.listSysTables = function(ibmdb,connString) {
    return function(req, res) {

	   	   
       ibmdb.open(connString, function(err, conn) {
			if (err ) {
			 res.send("error occurred " + err.message);
			}
			else {
				conn.query("SELECT FIRST_NAME, LAST_NAME, EMAIL, WORK_PHONE from GOSALESHR.employee FETCH FIRST 10 ROWS ONLY", function(err, tables, moreResultSets) {
							
							
				if ( !err ) { 
					res.render('tablelist', {
						"tablelist" : tables,
						"tableName" : "10 rows from the GOSALESHR.EMPLOYEE table"
						
					 });

					
				} else {
				   res.send("error occurred " + err.message);
				}

				/*
					Close the connection to the database
					param 1: The callback function to execute on completion of close function.
				*/
				conn.close(function(){
					console.log("Connection Closed");
					});
				});
			}
		} );
	   
	}
}
exports.count = function(req, res){
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
	
}
exports.search = function(req, res){
	insightRequest("/search", req.param("q"), function(err, data) {
	    if (err) {
	        res.send(err).status(400);
	    } else {
	        res.json(data);
	    }
    });
}
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