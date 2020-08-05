require('./server')
exports.handler = function(event, context, callback) {
    let body=JSON.parse(event.body);
    if(body["sid"]=="null")
    callback(null, {
        statusCode: 401,
        body: "Please sign in to Your admin account"
      });
      connectToDB().then((conn=>{
        db=conn.db("portfolio")
        db.collection("auth").findOne({sessions:{$elemMatch:{"sessionId":body["sid"]}}}, function(err, result) {
            if(err){
                console.error("Database error!");
                callback(null, {
                    statusCode: 500,
                    body: "Operation failed: database error"
                  });
                  conn.close();
            }
            if(result["rank"]=="admin"){
                if(body["what"]=="null"||body["lang"]==null||body["data"]=="null"){
                    callback(null, {
                        statusCode: 400,
                        body: "Operation failed: invalid argument"
                      });
                      conn.close();
                }
                else{
                    if(body["remove"]=="true")
                    db.collection("data").updateOne({"LANG":body["lang"],"WHAT":body["what"]},[{$unset:body["data"]}],function(e,r){
                        callback(null, {
                            statusCode: 200,
                            body: `Content for language <i>${body["lang"]}</i> was removed.`
                          });
                          conn.close();
                    })
                    else
                    db.collection("data").updateOne({"LANG":body["lang"],"WHAT":body["what"]},[{$set:body["data"]}],{upsert:true},function(e,r){
                        callback(null, {
                            statusCode: 200,
                            body: `Content for language <i>${body["lang"]}</i> was saved.`
                          });
                          conn.close();
                    })
                }
            }
            else{
                callback(null, {
                    statusCode: 403,
                    body: "You are not authorized to make that changes"
                });
                conn.close();
            }
        })
    }))
}