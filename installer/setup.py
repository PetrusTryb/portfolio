import checker
import save;
import cli_ui
import os
def download():
    cli_ui.info_2("Downloading the newest version of PortCMS")
    if(not checker.checkGitStatus()):
        cli_ui.error("Please download and install git to continue: https://git-scm.com/downloads")
        os._exit(1)
    isUpdate=False
    try:
        os.mkdir("PortCMS")
    except:
        what=cli_ui.ask_choice("PortCMS is already downloaded. What do You want to do?",choices=["Update","Check database config"])
        isUpdate=what=="Update"
        if(not isUpdate):
            os.chdir("PortCMS")
            dbconf()
            os._exit(0)
    if(isUpdate):
        os.chdir("PortCMS")
        os.system("git pull")
    else:
        os.system("git clone https://github.com/PetrusTryb/portfolio.git PortCMS")
        os.chdir("PortCMS")
    cli_ui.info(cli_ui.check,"Download complete")
def dbconf():
    cli_ui.info_2("Database configuration")
    try:
        with open(".env") as dbconf:
            connstr=dbconf.readline().split("DB_URL=")[1]
            if(checker.checkMongoDBConnection(connstr)):
                cli_ui.info(cli_ui.check,"Database configuration is valid")
            else:
                cli_ui.error("Database configuration is invalid")
    except:
        cli_ui.info_3("You need to configure Your MongoDB database. https://docs.atlas.mongodb.com/getting-started/")
        while(1):
            connstr=cli_ui.ask_string("Please enter Your MongoDB connection string.")
            if(checker.checkMongoDBConnection(connstr)):
                cli_ui.info(cli_ui.check,"Connected to the database")
                save.save("DB_URL="+connstr,".env")
                break
            else:
                cli_ui.error("Connection string is invalid")
if __name__ == "__main__":
    cli_ui.info_1("#############################")
    cli_ui.info_1("Welcome to the PortCMS setup!")
    download()
    dbconf()