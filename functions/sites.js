//TODO: 
// swap temp and arr[i]
require('./server')
exports.handler = function(event, context, callback) {
    if(event.httpMethod=="GET"){
        let url=event.queryStringParameters.url
        connectToDB().then((conn=>{
            db=conn.db("portfolio")
            if(url===undefined)
            db.collection("pages").find({}).toArray(function(err, result) {
                if(err)
                callback(null, {
                    statusCode: 500,
                    body: "Database error"
                  });
                else
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(result)
                  });
                conn.close();
            })
            else
            db.collection("pages").find({"url":url}).toArray(function(err, result) {
                if(err)
                callback(null, {
                    statusCode: 500,
                    body: "Database error"
                  });
                else
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(result)
                  });
                  conn.close();
            })
    }
))}
    else if(event.httpMethod=="POST"){
        let body=JSON.parse(event.body);
    if(body["sid"]=="null")
    callback(null, {
        statusCode: 403,
        body: "No session id provided"
      });
      connectToDB().then((conn=>{
        db=conn.db("portfolio")
        db.collection("auth").findOne({sessions:{$elemMatch:{"sessionId":body["sid"]}}}, function(err, result) {
            if(err){
                console.error("Database error!");
                callback(null, {
                    statusCode: 500,
                    body: "Database error"
                });
                conn.close();
            }
            if(result){
                db.collection("pages").insertOne({"url":body["url"],"name":body["name"],"position":body["pos"]},(err,result)=>{
                    if(err){
                        console.error("Database error!");
                        callback(null, {
                            statusCode: 500,
                            body: "Database error"
                        });
                    }
                    else{
                        callback(null, {
                            statusCode: 200,
                            body: "Webpage created!"
                        });
                    }
                    conn.close();
                })
            }
            else{
                callback(null, {
                    statusCode: 403,
                    body: "Invalid session"
                });
                conn.close();
            }
            //conn.close();
        })
    }))
    }
    else if(event.httpMethod=="PATCH"){
        let body=JSON.parse(event.body);
    if(body["sid"]=="null")
    callback(null, {
        statusCode: 403,
        body: "No session id provided"
      });
      connectToDB().then((conn=>{
        db=conn.db("portfolio")
        db.collection("auth").findOne({sessions:{$elemMatch:{"sessionId":body["sid"]}}}, function(err, result) {
            if(err){
                console.error("Database error!");
                callback(null, {
                    statusCode: 500,
                    body: "Database error"
                });
                conn.close();
            }
            if(result){
                db.collection("pages").updateOne({"url":body["url"]},body["edit"],(err,result)=>{
                    if(err){
                        console.error(err);
                        callback(null, {
                            statusCode: 500,
                            body: "Database error"
                        });
                    }
                    else{
                        callback(null, {
                            statusCode: 200,
                            body: "Webpage updated!"
                        });
                    }
                    conn.close();
                })
            }
            else{
                callback(null, {
                    statusCode: 403,
                    body: "Invalid session"
                });
                conn.close();
            }
            //conn.close();
        })
    }))
    }
    else if(event.httpMethod=="DELETE"){
        let body=JSON.parse(event.body);
    if(body["sid"]=="null")
    callback(null, {
        statusCode: 403,
        body: "No session id provided"
      });
      connectToDB().then((conn=>{
        db=conn.db("portfolio")
        db.collection("auth").findOne({sessions:{$elemMatch:{"sessionId":body["sid"]}}}, function(err, result) {
            if(err){
                console.error("Database error!");
                callback(null, {
                    statusCode: 500,
                    body: "Database error"
                });
                conn.close();
            }
            if(result){
                db.collection("pages").deleteOne({"url":body["url"]},(err,result)=>{
                    if(err){
                        console.error("Database error!");
                        callback(null, {
                            statusCode: 500,
                            body: "Database error"
                        });
                    }
                    else{
                        callback(null, {
                            statusCode: 200,
                            body: "Webpage removed!"
                        });
                    }
                    conn.close();
                })
            }
            else{
                callback(null, {
                    statusCode: 403,
                    body: "Invalid session"
                });
                conn.close();
            }
            //conn.close();
        })
    }))
    }
}