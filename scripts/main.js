let data={}
let globalData={}
window.onhashchange=init
function localize(localeArray){
    if(!localeArray)
        return ""
    if(localeArray[window.navigator.language.slice(0, 2)]){
        return localeArray[window.navigator.language.slice(0, 2)];
    }
    return localeArray["default"];
}
function init(){
    document.getElementsByClassName("pageloader")[0].classList.add("is-active")
    fetch("/api/sites").then((sites)=>{
        sites.json().then((sites)=>{
            sites.sort(function (a, b) {
                let comparison = 0;
                if (a.position > b.position) {
                    comparison = -1;
                } else if (a.position < b.position) {
                    comparison = 1;
                }
                return comparison;
            });
            document.querySelectorAll(".pageLink").forEach((x)=>{x.remove()})
            sites.forEach(element => {
                if(element.url=="*"){
                    globalData=element
                }
                else{
                document.getElementById("mainMenu").outerHTML+=`<a class="navbar-item pageLink" href="/#${element.url}">${localize(element.name)}</a>`
                let hash=location.hash.replace("#","");
                if(element.url==hash || (hash==""&&element.url=="index"))
                    data=element
                }
            });
            loadPage(data,globalData)
        })
    })
}
function reload(){
    init()
}
function loadPage(data,globalData,editMode=false){
    console.log(data,globalData)
    events()
    document.getElementById("mainMenuTitle").innerHTML=localize(globalData.name)
    document.getElementById("heroTitle").innerHTML=localize(globalData.name)
    document.getElementById("heroSubtitle").innerHTML=localize(globalData.subname)
    if(!document.getElementById("siteBlocksContainer")){
        document.getElementsByClassName("pageloader")[0].classList.remove("is-active")
        return
    }
    let blocks=data["blocks"]
    document.getElementById("siteBlocksContainer").innerHTML=""
    if(blocks){
        blocks.sort(function (a, b) {
            let comparison = 0;
            if (a.position > b.position) {
                comparison = 1;
            } else if (a.position < b.position) {
                comparison = -1;
            }
            return comparison;
        });
        pos=0
        let i=0
        blocks.forEach((block)=>{
            if(block.position>pos)
                pos=block.position
            console.log(block)
            switch(block.type){
                case "section":
                    new Section("siteBlocksContainer",block,i++)
                    break
                case "card":
                    new Card("siteBlocksContainer",block,i++)
                    break
                default:
                    console.warn("Unknown block:", block)
                    break
            }
        })
    }
    editModeToggle()
    editModeToggle()
    document.getElementsByClassName("pageloader")[0].classList.remove("is-active")
}
function manageMenu(){
    Swal.fire({
        html:`<div id="menuMng" class="is-size-6" style="margin-left:-1.5em"></div>`,
        grow:"row",
        showConfirmButton:false,
        showCloseButton:true,
        onRender:()=>{
            menuMng=new MenuManager("menuMng","menuMng")
            menuMng.onActionFinished=function(){
                init()
                manageMenu()
            }
        }
    })
}
function editWebsiteTitle(){
    let titleMLI
            Swal.fire({title: 'Change website title',
            focusConfirm: false,
            html:`<div id="titleMLI"></div><br/>`,
            showCancelButton: true,
            showLoaderOnConfirm:true,
            grow:"row",
            onRender:()=>{
                titleMLI=new MultiLangInput("titleMLI","titleMLI")
                titleMLI.editorStorage=globalData.name
                for (let i in titleMLI.editorStorage){
                    titleMLI.addLocale(i)
                }
            },
            preConfirm:()=>{
                let title=titleMLI.editorStorage
                let data={"name":title}
                let editOP={}
                editOP["$set"]=data
                console.log(editOP)
                return fetch("/api/sites",{method:"PATCH",body:JSON.stringify({"sid":localStorage.sid,"url":"*","edit":editOP})}).then(req=>{
                    if(req.status==200){
                        req.text().then(strings=>{
                            Swal.fire({
                                title:"Success!",
                                text:`Website title updated`,
                                icon:"success",
                                position:"center",
                                timer:1000,
                                timerProgressBar:true,
                                showConfirmButton:false
                            })
                            reload()
                            return true
                        })
                    }
                    else{
                        console.error("Unable to update")
                        req.text().then(strings=>{
                            toast({message:strings,type:"is-danger"})
                        })
                        return false
                    }
                })         
            }
        })
}
function editWebsiteSubtitle(){
    let titleMLI
            Swal.fire({title: 'Change website subtitle',
            focusConfirm: false,
            html:`<div id="titleMLI"></div><br/>`,
            showCancelButton: true,
            showLoaderOnConfirm:true,
            grow:"row",
            onRender:()=>{
                titleMLI=new MultiLangInput("titleMLI","titleMLI")
                if(globalData.subname)
                    titleMLI.editorStorage=globalData.subname
                for (let i in titleMLI.editorStorage){
                    titleMLI.addLocale(i)
                }
            },
            preConfirm:()=>{
                let title=titleMLI.editorStorage
                let data={"subname":title}
                let editOP={}
                editOP["$set"]=data
                console.log(editOP)
                return fetch("/api/sites",{method:"PATCH",body:JSON.stringify({"sid":localStorage.sid,"url":"*","edit":editOP})}).then(req=>{
                    if(req.status==200){
                        req.text().then(strings=>{
                            Swal.fire({
                                title:"Success!",
                                text:`Website title updated`,
                                icon:"success",
                                position:"center",
                                timer:1000,
                                timerProgressBar:true,
                                showConfirmButton:false
                            })
                            reload()
                            return true
                        })
                    }
                    else{
                        console.error("Unable to update")
                        req.text().then(strings=>{
                            toast({message:strings,type:"is-danger"})
                        })
                        return false
                    }
                })         
            }
        })
}
function addBlock(){
    Swal.fire({
        title: 'Add new block',
        input: 'select',
        inputOptions: {
          'section':"Section",
          "card":"Card"
        },
        inputPlaceholder: 'Select block type',
        showCancelButton: true,
        showLoaderOnConfirm:true,
        inputValidator: (value) => {
          return new Promise((resolve) => {
            if (value) {
              resolve()
            } else {
              resolve('Please select block type')
            }
          })
        },
        preConfirm:(type)=>{
            if(!data["blocks"])
                pos=0
            let editOP={}
            editOP["$addToSet"]={}
            editOP["$addToSet"]["blocks"]={"type":type,"position":pos+1,"data":{}}
            console.log(editOP)
            return fetch("/api/sites",{method:"PATCH",body:JSON.stringify({"sid":localStorage.sid,"url":data.url,"edit":editOP})}).then(req=>{
                if(req.status==200){
                    req.text().then(strings=>{
                        Swal.fire({
                            title:"Success!",
                            text:`Page updated`,
                            icon:"success",
                            position:"center",
                            timer:1000,
                            timerProgressBar:true,
                            showConfirmButton:false
                        })
                        reload()
                        return true
                    })
                }
                else{
                    console.error("Unable to update page")
                    req.text().then(strings=>{
                        toast({message:strings,type:"is-danger"})
                    })
                    return false
                }
            })         
        }
      })
}
function swap(obj,a,b){
    let newobj=obj
    let temp=newobj[a].position
    newobj[a]=newobj[b].position
    newobj[b]=temp
    return newobj
}
function moveBlock(from,to){
    console.log(data)
    let newOrder={}
    for (let i in data.blocks) {
        if(data.blocks[i].position==from){
            console.log(data.blocks[i],data.blocks[i+1])
            if(to)
                newOrder=swap(data.blocks,i,i+1)
            else
                newOrder=swap(data.blocks,i,i-1)
            break
        }
    }
    console.log(newOrder)
    return
    Swal.fire({
        title: 'Changing block position...',
        onRender:()=>{
            Swal.showLoading()
            let data={"position":to}
            let editOP={}
            editOP["$set"]=data
            console.log(editOP)
            fetch("/api/sites",{method:"PATCH",body:JSON.stringify({"sid":localStorage.sid,"url":a,"edit":editOP})}).then(req=>{
                if(req.status==200){
                    req.text().then(strings=>{
            data={"url":b,"position":from}
            editOP={}
            editOP["$set"]=data
            console.log(editOP)
            return fetch("/api/sites",{method:"PATCH",body:JSON.stringify({"sid":localStorage.sid,"url":b,"edit":editOP})}).then(req=>{
                if(req.status==200){
                    req.text().then(strings=>{
                        self.refreshData()
                        Swal.close()
                        self.onActionFinished()
                    })
                }
                else{
                    console.error("Unable to update page")
                    req.text().then(strings=>{
                        toast({message:strings,type:"is-danger"})
                    })
                    Swal.close()
                }
            })
                    })
                }
                else{
                    console.error("Unable to update page")
                    req.text().then(strings=>{
                        toast({message:strings,type:"is-danger"})
                    })
                    Swal.close()
                }
            })
        }
    })
}

function events(){
    document.getElementById("menuManageButton").onclick=manageMenu
    document.getElementById("editWebsiteTitle").onclick=editWebsiteTitle
    document.getElementById("editWebsiteSubtitle").onclick=editWebsiteSubtitle
    document.getElementById("addBlockBtn").onclick=addBlock
}
init();