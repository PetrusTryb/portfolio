require("./server")
exports.handler = function(event, context, callback) {
    let body=JSON.parse(event.body);
    connectToDB().then(conn=>{
        let db=conn.db("portfolio");
        db.collection("auth").updateMany({},{$pull:{sessions:{sessionId:body["sid"]}}},function(err,result){
        if(err){
            callback(null,{
                statusCode:500,
                body:"Database error"
            });
        }
        else{
            callback(null,{
                statusCode:200,
                body:"Goodbye!"
            });
        }
        conn.close();
    })
    })
}