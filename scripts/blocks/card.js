class Card{
    constructor(container,data,arrIndex){
        this.id=data.position
        this.data=data.data
        this.index=arrIndex
        console.log(this.data)
        let s = document.createElement("section")
        s.classList.add("section")
        s.innerHTML=`
        <div class="box">
        <article class="media">
        ${this.data.icon?`<div class="media-left">
        <figure class="image is-64x64">
          <img src="${this.data.icon}" alt="Card icon" referrerpolicy="no-referrer">
        </figure>
      </div>`:""}
          <div class="media-content">
            <div class="content">
            <a ${this.data.url?`href="${this.data.url}"`:""} target="_blank"><strong>${this.data.name}</strong></a>
            ${localize(this.data.desc)}
            </div>
            <nav class="level is-mobile">
              <div class="level-left">
              ${this.data.website?`<a class="level-item" aria-label="website" 
              href="${this.data.website}" target="_blank">
              <span class="icon is-small has-text-primary">
                <i class="fas fa-globe" aria-hidden="true"></i>
              </span>
          </a>`:""}
          ${this.data.download?`<a class="level-item" aria-label="download"
          href="${this.data.download}" target="_blank">
                  <span class="icon is-small has-text-success">
                    <i class="fas fa-download" aria-hidden="true"></i>
                  </span>
                </a>`:""}
                ${this.data.source?`<a class="level-item" aria-label="source"
          href="${this.data.source}" target="_blank">
                  <span class="icon is-small has-text-info">
                    <i class="fas fa-code" aria-hidden="true"></i>
                  </span>
                </a>`:""}
                <a class="level-item admin-controls is-hidden" id="edit${this.id}">
                    <span class="icon is-small has-text-warning">
                      <i class="fas fa-edit" aria-hidden="true"></i>
                    </span>
                </a>
                <a class="level-item admin-controls is-hidden" id="remove${this.id}">
                    <span class="icon is-small has-text-danger">
                      <i class="fas fa-trash" aria-hidden="true"></i>
                    </span>
                </a>
              </div>
            </nav>
          </div>
        </article>
      </div>`
        document.getElementById(container).appendChild(s)
        this.#initAdminControls()
    }
    #initAdminControls(){
        let i=this.id
        document.getElementById(`edit${i}`).onclick=()=>{
          Card.edit(data.url,this.id,this.data,this.index)
        }
        document.getElementById(`remove${i}`).onclick=()=>{
          Card.remove(this.id,data.url)
        }
    }
    static edit(url,id,data,index){
      console.log(url,id,data,index)
        let titleMLI
        let contentMLI
        Swal.fire({title: 'Configure block',
        focusConfirm: false,
        html:`
        <div class="field">
            <label class="label">Name <span class="has-text-danger">*</span></label>
            <div class="control">
              <input class="input" type="text" required id="pName">
            </div>
          </div>
          <div class="field">
            <label class="label">Description</label>
            <div id="projectEditMLI"></div>
          </div><br/><br/>
          <div class="field">
            <label class="label">Project URL</label>
            <div class="control">
              <input class="input" type="url" id="pUrl">
            </div>
          </div>
          <div class="field">
            <label class="label">Icon URL</label>
            <div class="control">
              <input class="input" type="url" id="pIcon">
            </div>
          </div>
          <div class="field">
            <label class="label">Website URL</label>
            <div class="control">
              <input class="input" type="url" id="pWebsite">
            </div>
          </div>
          <div class="field">
            <label class="label">Download URL</label>
            <div class="control">
              <input class="input" type="url" id="pDownload">
            </div>
          </div>
          <div class="field">
            <label class="label">Source code URL</label>
            <div class="control">
              <input class="input" type="url" id="pSource">
            </div>
          </div>`,
        showCancelButton: true,
        showLoaderOnConfirm:true,
        grow:"row",
        onRender:()=>{
            contentMLI=new MultiLangInput("projectEditMLI","projectEditMLI")
            document.getElementById("pName").value=data.name?data.name:""
            document.getElementById("pUrl").value=data.url?data.url:""
            document.getElementById("pIcon").value=data.icon?data.icon:""
            document.getElementById("pWebsite").value=data.website?data.website:""
            document.getElementById("pDownload").value=data.download?data.download:""
            document.getElementById("pSource").value=data.source?data.source:""
            for(let l in data.desc){
              contentMLI.editorStorage[l]=data.desc[l]
              contentMLI.addLocale(l)
            }
        },
        preConfirm:()=>{
          let editFormData={
            "name":document.getElementById("pName").value,
            "desc":contentMLI.editorStorage,
            "url":document.getElementById("pUrl").value,
            "icon":document.getElementById("pIcon").value,
            "website":document.getElementById("pWebsite").value,
            "download":document.getElementById("pDownload").value,
            "source":document.getElementById("pSource").value
            }
            let blockData={"type":"card","position":id,"data":editFormData}
            let editOP={}
            editOP["$set"]={}
            editOP["$set"]["blocks."+index]=blockData
            return fetch("/api/sites",{method:"PATCH",body:JSON.stringify({"sid":sid,"url":url,"edit":editOP})}).then(req=>{
                if(req.status==200){
                    req.text().then(strings=>{
                        Swal.fire({
                            title:"Success!",
                            text:`Block update finished`,
                            icon:"success",
                            position:"center",
                            timer:5000,
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
    static remove(id,url){
        Swal.fire({title: 'Remove block',
        icon:"warning",
        focusConfirm: false,
        text:"Are You sure?",
        showCancelButton: true,
        showLoaderOnConfirm:true,
        grow:"row",
        preConfirm:()=>{
            let editOP={"$pull" : {}}
            editOP["$pull"]["blocks"]={}
            editOP["$pull"]["blocks"]={"position":id}
            console.log(editOP)
            return fetch("/api/sites",{method:"PATCH",body:JSON.stringify({"sid":sid,"url":url,"edit":editOP})}).then(req=>{
                if(req.status==200){
                    req.text().then(strings=>{
                        Swal.fire({
                            title:"Success!",
                            text:`Block removed`,
                            icon:"success",
                            position:"center",
                            timer:5000,
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
}