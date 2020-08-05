require("./server")
const querystring = require("querystring")
const md5 = require('md5');
exports.handler = function(event, context, callback) {
    let body=querystring.parse(event.body);
    let userData={
        "username":body["nick"],
        "email":body["email"],
        "pass":md5(body["pass"]),
        "joinedAt":String(Date.now()),
        "rank":"user"
};
    if(body["nick"]==undefined || body["email"]==undefined || body["pass"]==undefined){
        callback(null, {
            statusCode: 303,
            body: "Bad request",
            headers:{"location":"/register.html?message=badrequest"}
        });
    }
    else{
    connectToDB().then((conn=>{
        db=conn.db("portfolio")
        db.collection("auth").findOne({email:userData["email"]},function(err,res){
            if(res){
                callback(null, {
                    statusCode: 303,
                    body: "User with that e-mail already exists.",
                    headers:{"location":"/register.html?message=exists"}
                    });
                conn.close()
            }
            else{
                db.collection("auth").insertOne(userData, function(err, res) {
                    if (err){
                        console.error(err)
                        callback(null, {
                            statusCode: 303,
                            body: "Internal error",
                            headers:{"location":"/register.html?message=error"}
                            });
                        conn.close()
                    }
                    else{
                    callback(null, {
                    statusCode: 303,
                    body: String(userData._id),
                    headers:{"location":"/login.html?message=registered"}
                    });
                    conn.close();
                    }
                  });
            }
        })
    }))
}
}