require('./server')
exports.handler = function(event, context, callback) {
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
            }
            if(result){
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(result)
                });
            }
            else{
                callback(null, {
                    statusCode: 403,
                    body: "Invalid session"
                });
            }
            conn.close();
        })
    }))
}