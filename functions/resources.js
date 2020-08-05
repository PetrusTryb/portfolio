require('./server')
exports.handler = function(event, context, callback) {
    let body=JSON.parse(event.body);
    if(body["lang"]=="null"||body["what"]=="null")
    callback(null, {
        statusCode: 400,
        body: "Required: lang, what"
      });
      connectToDB().then((conn=>{
        db=conn.db("portfolio")
        if(body["lang"]!="*")
        db.collection("data").findOne({"LANG":body["lang"],"WHAT":body["what"]}, function(err, result) {
            if(err){
                console.error("Database error!");
            }
            if(result){
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(result)
                });
            }
            else{
                console.warn("Locale not found: "+body["lang"]);
                callback(null, {
                    statusCode: 404,
                    body: "Locale not found: "+body["lang"]
                });
            }
            conn.close();
        })
        else
        db.collection("data").find({"WHAT":body["what"]}).toArray().then((result)=>{
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result)
            });
            conn.close();
        }).catch(err=>{
            console.error(err)
            callback(null, {
                statusCode: 500,
                body: "Database error"
            });
            conn.close();
        })
      }))
}