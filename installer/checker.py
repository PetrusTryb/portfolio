import pymongo
import subprocess
import hashlib
import datetime
def checkGitStatus():
    try:
        subprocess.run("git --version")
    except:
        return False
    return True
def checkMongoDBConnection(connString:str):
    try:
        conn=pymongo.MongoClient(connString,serverSelectionTimeoutMS=5000)
        conn.server_info()
        if("portfolio" not in conn.list_database_names()):
            portDB=conn["portfolio"]
            authCol=portDB["auth"]
            admin={"username":input("Admin username: "),
            "email":input("Admin e-mail: "),
            "pass":hashlib.md5(input("Admin password: ").encode("utf-8")).hexdigest(),
            "joinedAt":str(int(datetime.datetime.now().timestamp())),
            "rank":"admin"}
            authCol.insert_one(admin)
    except Exception as e:
        print(e)
        return False
    return True