let sid=localStorage.getItem("sid")
let userData={}
let editMode=false
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
                    document.getElementById("username").innerHTML+=" <span class='tag' id='emToggle'>Admin</span>"
                    document.getElementById("emToggle").onclick=editModeToggle
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
function editModeToggle(){
    if(!document.getElementById("emToggle"))
        return
    if(!editMode){
        document.getElementById("emToggle").classList.add("is-warning");
        let controls=document.querySelectorAll(".admin-controls")
        controls.forEach(element => {
            element.classList.remove("is-hidden");
        });
        editMode=true;
    }
    else{
        document.getElementById("emToggle").classList.remove("is-warning");
        let controls=document.querySelectorAll(".admin-controls")
        controls.forEach(element => {
            element.classList.add("is-hidden");
        });
        editMode=false;
    }
}