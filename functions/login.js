require("./server")
exports.handler = function(event, context, callback) {
    const querystring = require("querystring")
    let body=querystring.parse(event.body);
    let sid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    var md5 = require('md5');
    connectToDB().then((conn=>{
        db=conn.db("portfolio")
        db.collection("auth").findOne({"email":body["email"],"pass":md5(body["pass"])}, function(err, result) {
            if(err){
                console.error("Database error!");
                callback(null, {
                  statusCode: 303,
                  body:String(err.code),
                  headers:{"location":"/login.html?message=error"}
                });
                conn.close();
            }
            if(result){
                let session={
                "sessionId":sid,
                "created":String(Date.now()),
                "ip":event.headers['client-ip']
            }
            db.collection("auth").update({"_id":result._id},{"$addToSet":{"sessions":session}}, function(err, res) {
                if (err){
                    console.error(err)
                    callback(null, {
                        statusCode: 303,
                        body:String(err.code),
                        headers:{"location":"/login.html?message=error"}
                        });
                }
                else{
                callback(null, {
                statusCode: 200,
                body: `
                <p>OK</p>
                <script>
                localStorage.setItem("sid",'${sid}');
                location.href="/index.html";
                </script>`
                });
                }
                conn.close();
              });
            }
          else{
            console.error("Invalid password provided for "+body["email"]);
            callback(null, {
              statusCode: 303,
              body: "Wrong email or password",
              headers:{"location":"/login.html?message=denied"}
            });
            conn.close();
          }
        });
    }));
}