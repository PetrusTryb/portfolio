const { ObjectId } = require('mongodb');

require('./server')
exports.handler = function(event, context, callback) {
    let body=JSON.parse(event.body);
    if(body["get"]=="true"){
        connectToDB().then((conn=>{
            db=conn.db("portfolio")
            db.collection("comments").find({"for":body["for"]}).toArray(function(err,result){
                if(err){
                    console.error(err)
                    callback(null, {
                        statusCode: 500,
                        body: "Cannot get comments - database error"
                      });
                      conn.close()
                }
                else{
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(result)
                  });
                  conn.close();
                }
            })
        }))
    }
    else{
    if(body["sid"]==null){
    callback(null, {
        statusCode: 401,
        body: "You cannot post comments or reactions anonymously"
      });
      return
    }
      connectToDB().then((conn=>{
        db=conn.db("portfolio")
        db.collection("auth").findOne({sessions:{$elemMatch:{"sessionId":body["sid"]}}}, function(err, result) {
            if(err){
                console.error("Database error!");
            }
            else if(body["reaction"]=="positive"){
                db.collection("comments").updateOne({"_id":ObjectId(body["cid"])},{
                    "$addToSet":{"upvotes":result._id},
                    "$pull":{"downvotes":result._id}
                },function(e,r){
                    if(e){
                        console.error(e)
                        callback(null, {
                            statusCode: 500,
                            body: "Database error"
                          });
                    }
                    else{
                        callback(null, {
                            statusCode: 200,
                            body: "OK"
                          });
                    }
                    conn.close()
                })
            }
            else if(body["reaction"]=="negative"){
                db.collection("comments").updateOne({"_id":ObjectId(body["cid"])},{
                    "$addToSet":{"downvotes":result._id},
                    "$pull":{"upvotes":result._id}
                },function(e,r){
                    if(e){
                        console.error(e)
                        callback(null, {
                            statusCode: 500,
                            body: "Database error"
                          });
                    }
                    else{
                        callback(null, {
                            statusCode: 200,
                            body: "OK"
                          });
                    }
                    conn.close()
                })
            }
            else if(body["reaction"]=="neutral"){
                db.collection("comments").updateOne({"_id":ObjectId(body["cid"])},{
                    "$pull":{"downvotes":result._id,"upvotes":result._id}
                },function(e,r){
                    if(e){
                        console.error(e)
                        callback(null, {
                            statusCode: 500,
                            body: "Database error"
                          });
                    }
                    else{
                        callback(null, {
                            statusCode: 200,
                            body: "OK"
                          });
                    }
                    conn.close()
                })
            }
            else if(result["rank"]=="admin"||result["rank"]=="user"){
                let commentData={
                    "for":body["for"],
                    "created":String(Date.now()),
                    "username":result["username"],
                    "uid":result["_id"],
                    "email":result["email"],
                    "rank":result["rank"],
                    "content":body["text"],
                    "upvotes":[],
                    "downvotes":[]
                }
                db.collection("comments").insertOne(commentData,function(e,r){
                    if(e){
                        console.error(e)
                        callback(null, {
                            statusCode: 500,
                            body: "Failed to post Your comment"
                          });
                    }
                    else{
                        callback(null, {
                            statusCode: 200,
                            body: "OK"
                          });
                    }
                    conn.close()
                })
            }
            else{
                callback(null, {
                    statusCode: 403,
                    body: "You are banned"
                });
                conn.close();
            }
        })
    }))
}
}