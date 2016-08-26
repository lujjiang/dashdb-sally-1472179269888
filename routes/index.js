var request = require('request');
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
exports.insightRequest = function(path){
	return function(req, res){
		query=req.param("q");
		console.log(query);
		request({
	        method: "GET",
	        url: insight_host + '/api/v1/messages' + path,
	        qs: {
	            q: query,
	            size: MAX_TWEETS
	        }
	    }, function(err, response, data) {
	        if (err) {
	            res.send(err).status(400);
	        } else {
	            if (response.statusCode == 200) {
	                try {
	                    res.json({
			                query: req.param("q"),
			                count: data.search.results
			            });
	                } catch(e) {
	                	res.send(e.message).status(500);
	              //   	res.json({
			            //     query: req.param("q"),
			            //     count: data.search.results
			            // });
	              //       done({ 
	              //           error: { 
	              //               description: e.message
	              //           },
	              //           status_code: response.statusCode
	              //       });
	                }
	            } else {
	            	res.send(data).status(500);
	                // done({ 
	                //     error: { 
	                //         description: data 
	                //     },
	                //     status_code: response.statusCode
	                // });
	            }
	        }
	    });
	}
	
}