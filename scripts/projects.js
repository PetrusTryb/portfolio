function compareId(a, b) {
  let comparison = 0;
  if (a._id > b._id) {
    comparison = -1;
  } else if (a._id < b._id) {
    comparison = 1;
  }
  return comparison;
}
function compareComments(a, b) {
  let comparison = 0;
  let a_rep = a.upvotes.length-a.downvotes.length
  let b_rep = b.upvotes.length-b.downvotes.length
  if (a_rep > b_rep) {
    comparison = -1;
  } else if (a_rep < b_rep) {
    comparison = 1;
  }
  else
    return compareId(a,b);
  return comparison
}
function getAllProjects(){
    fetch("/api/projects",{method:"POST",body:JSON.stringify({"get":"true"})}).then(req=>{
        if(req.status==200){
            req.json().then(projects=>{
            projects.sort(compareId)
                projectsList=projects
                let list=document.getElementById("projectsList")
                list.innerHTML=""
                projects.forEach(project => {
                    list.innerHTML+=`
                    <div class="box">
        <article class="media">
        ${project.icon?`<div class="media-left">
        <figure class="image is-64x64">
          <img src="${project.icon}" alt="Project icon" referrerpolicy="no-referrer">
        </figure>
      </div>`:""}
          <div class="media-content">
            <div class="content">
            <a ${project.url?`href="${project.url}"`:""} target="_blank"><strong>${project.name}</strong></a>
            ${project.desc[locale]?project.desc[locale]:(project.desc["default"]?project.desc["default"]:"<p></p>")}
            </div>
            <nav class="level is-mobile">
              <div class="level-left">
              ${project.website?`<a class="level-item" aria-label="website" 
              href="${project.website}" target="_blank">
              <span class="icon is-small has-text-primary">
                <i class="fas fa-globe" aria-hidden="true"></i>
              </span>
          </a>`:""}
          ${project.download?`<a class="level-item" aria-label="download"
          href="${project.download}" target="_blank">
                  <span class="icon is-small has-text-success">
                    <i class="fas fa-download" aria-hidden="true"></i>
                  </span>
                </a>`:""}
                ${project.source?`<a class="level-item" aria-label="source"
          href="${project.source}" target="_blank">
                  <span class="icon is-small has-text-info">
                    <i class="fas fa-code" aria-hidden="true"></i>
                  </span>
                </a>`:""}
                <a class="level-item comment-button" aria-label="comment" pId="${project._id}">
                  <span class="icon is-small has-text-warning">
                    <i class="fas fa-comment" aria-hidden="true"></i>
                  </span>
                </a>
                <a class="level-item edit-button" aria-label="edit" pId="${project._id}">
                    <span class="icon is-small has-text-danger">
                      <i class="fas fa-edit" aria-hidden="true"></i>
                    </span>
                  </a>
              </div>
            </nav>
          </div>
        </article>
      </div>
                    `
                });
                let commentButtons=document.getElementsByClassName("comment-button")
                for(let eBtn of commentButtons){
                    eBtn.onclick=()=>{commentProject(eBtn.getAttribute("pId"),true)}
                }
                let editButtons=document.getElementsByClassName("edit-button")
                for(let eBtn of editButtons){
                  eBtn.onclick=()=>{editProject(eBtn.getAttribute("pId"))}
                }
            })
            
        }
        else{
            console.error("Unable to fetch projects data")
        }
    })
}
function newProject(){
    document.getElementById("projectEditModal").classList.add("is-active")
    document.getElementById("projectEditModalTitle").innerText="Add new project"
    projectEditorMLI=new MultiLangInput("pEditMLI","projectEditMLI")
    document.getElementById("pId").value="new"
    document.getElementById("projectEditModalRemove").style.display="none"
    document.getElementById("pName").value=""
    document.getElementById("pUrl").value=""
    document.getElementById("pIcon").value=""
    document.getElementById("pWebsite").value=""
    document.getElementById("pDownload").value=""
    document.getElementById("pSource").value=""
}
function editProject(id){
  if(userData.rank!="admin"){
    toast({message:"Cannot edit - not authorized",type:"is-danger"})
    return
  }
  let currentProject=projectsList.find((item)=>{return item._id==id})
  document.getElementById("projectEditModal").classList.add("is-active")
  document.getElementById("projectEditModalTitle").innerText="Edit project"
  projectEditorMLI=new MultiLangInput("pEditMLI","projectEditMLI")
  document.getElementById("pId").value=id
  document.getElementById("pName").value=currentProject.name
  projectEditorMLI.editorStorage=currentProject.desc
  for (i in projectEditorMLI.editorStorage){
    projectEditorMLI.addLocale(i)
  }
  document.getElementById("pUrl").value=currentProject.url
  document.getElementById("pIcon").value=currentProject.icon
  document.getElementById("pWebsite").value=currentProject.website
  document.getElementById("pDownload").value=currentProject.download
  document.getElementById("pSource").value=currentProject.source
  document.getElementById("projectEditModalRemove").style.display="inherit"
}
function removeProject(){
  let toDelete=document.getElementById("pId").value
  if(toDelete=="new")
    return
    fetch("/api/projects",{method:"POST",body:JSON.stringify({"sid":sid,"id":toDelete,"data":"remove"})}).then(req=>{
      if(req.status==200){
          req.text().then(strings=>{
              toast({message:strings,type:"is-success"})
          })
          closeProjectEditModal(true)
      }
      else{
          console.error("Unable to remove data")
          req.text().then(strings=>{
              toast({message:"Cannot remove: "+editFormData.name,type:"is-danger"})
          })
      }
  })
}
document.getElementById("newProjectBtn").onclick=newProject
document.getElementById("projectEditModalRemove").onclick=removeProject
function closeProjectEditModal(refresh=false){
    if(refresh===true)
        getAllProjects()
    document.getElementById("projectEditModal").classList.remove("is-active");
}
document.getElementById("projectEditModalClose").onclick=closeProjectEditModal
document.getElementById("projectEditModalCancel").onclick=closeProjectEditModal
document.getElementById("pEditForm").onsubmit=(e)=>{
    e.preventDefault()
}
document.getElementById("projectEditModalSave").onclick=()=>{
   let problems=document.getElementById("pEditForm").querySelectorAll(":invalid")
    for (var item of problems) {
        item.classList.add("is-danger")
    }
    let valid=document.getElementById("pEditForm").querySelectorAll(":valid")
    for (var item of valid) {
        item.classList.remove("is-danger")
    }
    if(problems.length)
        return
    let editFormData={
        "name":document.getElementById("pName").value,
        "desc":projectEditorMLI.editorStorage,
        "url":document.getElementById("pUrl").value,
        "icon":document.getElementById("pIcon").value,
        "website":document.getElementById("pWebsite").value,
        "download":document.getElementById("pDownload").value,
        "source":document.getElementById("pSource").value
    }
    let id=document.getElementById("pId").value
    fetch("/api/projects",{method:"POST",body:JSON.stringify({"sid":sid,"id":id,"data":editFormData})}).then(req=>{
        if(req.status==200){
            req.text().then(strings=>{
                toast({message:strings,type:"is-success"})
            })
            closeProjectEditModal(true)
        }
        else{
            console.error("Unable to save data")
            req.text().then(strings=>{
                toast({message:"Cannot save: "+editFormData.name,type:"is-danger"})
            })
        }
    })
}
getAllProjects()
function commentProject(id,nk=false){
  if(!userData.rank){
    document.getElementById("yourCommentBox").classList.add("is-hidden")
  }
  else{
    document.getElementById("commentLoginActions").classList.add("is-hidden")
  }
  console.log(id)
  document.getElementById("commentTarget").value=id
  document.getElementById("commentsModal").classList.add("is-active")
  let view=document.getElementById("commentsView")
  console.log(nk)
  if(nk){
    view.innerHTML="<progress class='progress'></progress>"
  }
  document.getElementById("ownAvatar").setAttribute("src","https://api.adorable.io/avatars/128/"+userData.email)
  fetch("/api/comments",{method:"POST",body:JSON.stringify({"get":"true","for":"project"+id})}).then(req=>{
    if(req.status==200){
        req.json().then(comments=>{
        comments.sort(compareComments)
        view.innerHTML=""
        comments.forEach((comment)=>{
          view.innerHTML+=`<article class="media">
          <figure class="media-left">
            <p class="image is-64x64">
              <img src="https://api.adorable.io/avatars/128/${comment.email}">
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <p>
                <strong>${comment.username}</strong>${comment.rank=="admin"?" <span class='tag is-warning'>Admin</span>":""}  ${comment.uid==userData._id?"<a class='has-text-danger delBtn' cId='"+comment._id+"'><i class='fas fa-trash'></i></a>":""}
                <br/>
                ${comment.content}
                <br/>
                <small><a class="like ${comment.upvotes.includes(userData._id)?'has-text-success':'has-text-grey'}" cId=${comment._id}><i class="fas fa-arrow-up"></i> </a> 
                <a class="neutral has-text-grey" cId=${comment._id}><i class="fas fa-minus"></i> </a> 
                <a class="dislike ${comment.downvotes.includes(userData._id)?'has-text-danger':'has-text-grey'}" cId=${comment._id}><i class="fas fa-arrow-down"></i> </a>
                ${comment.upvotes.length-comment.downvotes.length}
                &bull;
                ${new Date(Number(comment.created)).toLocaleString()}</small>
              </p>
            </div>
          </div>
        </article>`
        })
        let likeButtons=document.getElementsByClassName("like")
        for(let eBtn of likeButtons){
            eBtn.onclick=()=>{sendReaction(eBtn.getAttribute("cId"),"positive")}
        }
        let dislikeButtons=document.getElementsByClassName("dislike")
        for(let eBtn of dislikeButtons){
            eBtn.onclick=()=>{sendReaction(eBtn.getAttribute("cId"),"negative")}
        }
        let neutralButtons=document.getElementsByClassName("neutral")
        for(let eBtn of neutralButtons){
            eBtn.onclick=()=>{sendReaction(eBtn.getAttribute("cId"),"neutral")}
        }
        let deleteButtons=document.getElementsByClassName("delBtn")
        for(let eBtn of deleteButtons){
            eBtn.onclick=()=>{sendReaction(eBtn.getAttribute("cId"),"delete")}
        }
        }
    )}
      })
}
function sendReaction(cId,type){
  let projId=document.getElementById("commentTarget").value
  fetch("/api/comments",{method:"POST",body:JSON.stringify({"sid":sid,"cid":cId,"reaction":type})}).then(req=>{
    if(req.status==200){
        req.text().then(status=>{
          commentProject(projId)
        }
    )}
    else{
      req.text().then(status=>{
        toast({message:status,type:"is-danger"})
        commentProject(projId)
      }
  )}
      })
}
function sendComment(){
  let commText=document.getElementById("commentText").value
  let projId=document.getElementById("commentTarget").value
  if(commText.length==0)
    return
  fetch("/api/comments",{method:"POST",body:JSON.stringify({"sid":sid,"for":"project"+projId,"text":commText})}).then(req=>{
    if(req.status==200){
        req.text().then(status=>{
          toast({message:status,type:"is-success"})
          commentProject(projId)
        }
    )}
    else{
      req.text().then(status=>{
        toast({message:status,type:"is-danger"})
        commentProject(projId)
      }
  )}
      })
}
function closeComments(){
  document.getElementById("commentsModal").classList.remove("is-active");
}
document.getElementById("commentModalClose").onclick=closeComments
document.getElementById("commentSendButton").onclick=sendComment