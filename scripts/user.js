let sid=localStorage.getItem("sid")
let userData={}
if(sid){
    fetch("/api/user",{method:"POST",body:JSON.stringify({"sid":sid})}).then(req=>{
        if(req.status==200){
            document.getElementsByClassName("guest")[0].remove();
            req.json().then((data=>{
                userData=data
                if(location.pathname.includes("login.html")||location.pathname.includes("register.html"))
                    location.href="/";
                document.getElementsByClassName("user")[0].classList.remove("is-hidden")
                document.getElementById("username").innerText=data.username
                if(data.rank=="admin"){
                    document.getElementById("username").innerHTML+=" <span class='tag is-warning'>Admin</span>"
                    let controls=document.getElementsByClassName("admin-controls")
                    for (let e in controls){
                        if(controls[e].classList)
                            controls[e].classList.remove("is-hidden")
                    }
                }
            }))
        }
        else{
            document.getElementsByClassName("user")[0].remove();
        }
    })
}
document.getElementById("logoutBtn").onclick=()=>{
    fetch("/api/logout",{method:"POST",body:JSON.stringify({"sid":sid})}).then(req=>{
        localStorage.clear()
        location.reload()
    })
}
function openEditModal(element,group){
    activeLocale=undefined
    document.getElementById("editModalTitle").innerText=element;
    cmsMLI=new MultiLangInput("mli1","editModalMLI")
    fetchDataToEdit(element,group)
    activeEditCategory=group
}
function fetchDataToEdit(element,group){
    fetch("/api/resources",{method:"POST",body:JSON.stringify({"lang":"*","what":group})}).then(req=>{
        if(req.status==200){
            req.json().then(strings=>{
                strings.forEach((e)=>{
                    if(e.hasOwnProperty(element)){
                        cmsMLI.editorStorage[e.LANG]=e[element]
                        cmsMLI.addLocale(e.LANG)
                    }
                })
                document.getElementById("editModal").classList.add("is-active")
                cmsMLI.onEditorChange=save
                cmsMLI.onLocaleRemoved=remove
            })
        }
    })
}
function save(prevLang){
    if(prevLang==undefined)
        return
    let data={}
    data[document.getElementById("editModalTitle").innerText]=cmsMLI.editorStorage[prevLang]
    fetch("/api/edit",{method:"POST",body:JSON.stringify({"sid":sid,"lang":prevLang,"what":activeEditCategory,"data":data})}).then(req=>{
        if(req.status==200){
            req.text().then(strings=>{
                toast({message:strings,type:"is-success"})
            })
        }
        else{
            console.error("Unable to save data")
            req.text().then(strings=>{
                toast({message:strings,type:"is-danger"})
            })
        }
    })
}
function remove(removedLang){
    let data=document.getElementById("editModalTitle").innerText
    fetch("/api/edit",{method:"POST",body:JSON.stringify({"sid":sid,"lang":removedLang,"what":activeEditCategory,"data":data,"remove":"true"})}).then(req=>{
        if(req.status==200){
            req.text().then(strings=>{
                toast({message:strings,type:"is-success"})
            })
        }
        else{
            console.error("Unable to remove data")
            req.text().then(strings=>{
                toast({message:strings,type:"is-danger"})
            })
        }
    })
}
let editButtons=document.getElementsByClassName("editButton")
for(let e in editButtons){
    if(editButtons[e].getAttribute)
        editButtons[e].onclick=()=>{
            openEditModal(editButtons[e].getAttribute("edit"),editButtons[e].getAttribute("group"))
        }
        //editButtons[e].setAttribute( "onClick", `openEditModal("${editButtons[e].getAttribute("edit")}","${editButtons[e].getAttribute("group")}")`)
}
function closeEditModal(saveActiveEditor=false){
    if(saveActiveEditor===true&&cmsMLI.activeLocale!==undefined)
        save(cmsMLI.activeLocale)
    document.getElementById("editModal").classList.remove("is-active");
}
document.getElementById("editModalClose").onclick=closeEditModal
document.getElementById("editModalCancel").onclick=closeEditModal
document.getElementById("editModalSave").onclick=()=>{
    closeEditModal(true)
}