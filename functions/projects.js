const { ObjectId } = require('mongodb');

require('./server')
exports.handler = function(event, context, callback) {
    let body=JSON.parse(event.body);
    if(body["get"]=="true"){
        connectToDB().then((conn=>{
            db=conn.db("portfolio")
            db.collection("projects").find().toArray(function(err,result){
                if(err){
                    console.error(err)
                    callback(null, {
                        statusCode: 500,
                        body: "Cannot get projects - database error"
                      });
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
        body: "Please sign in to Your admin account"
      });
      return
    }
      connectToDB().then((conn=>{
        db=conn.db("portfolio")
        db.collection("auth").findOne({sessions:{$elemMatch:{"sessionId":body["sid"]}}}, function(err, result) {
            if(err){
                console.error("Database error!");
            }
            if(result["rank"]=="admin"){
                if(body["data"]=="null"){
                    callback(null, {
                        statusCode: 400,
                        body: "Operation failed: invalid argument"
                      });
                      conn.close();
                }
                else{
                    if(body["id"]=="new"){
                    db.collection("projects").insertOne(body["data"],(e,r)=>{
                        if(e==null){
                            callback(null, {
                                statusCode: 200,
                                body: "Project saved!"
                              });
                        }
                        else{
                            callback(null, {
                                statusCode: 500,
                                body: "Project cannot be saved - database error"
                              });
                        }
                        conn.close();
                    })
                }
                else{
                    if(body["data"]!="remove")
                    db.collection("projects").updateOne({"_id":ObjectId(body["id"])},{$set:body["data"]},function(e,r){
                        if(e==null){
                            callback(null, {
                                statusCode: 200,
                                body: "Project updated!"
                              });
                        }
                        else{
                            console.error(e)
                            callback(null, {
                                statusCode: 500,
                                body: "Project cannot be saved - database error"
                              });
                        }
                        conn.close();
                    })
                    else
                    db.collection("projects").deleteOne({"_id":ObjectId(body["id"])},function(e,r){
                        if(e==null){
                            callback(null, {
                                statusCode: 200,
                                body: "Project deleted!"
                              });
                        }
                        else{
                            console.error(e)
                            callback(null, {
                                statusCode: 500,
                                body: "Project cannot be deleted - database error"
                              });
                        }
                        conn.close();
                    })
                }
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
}