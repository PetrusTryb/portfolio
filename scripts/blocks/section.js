class Section{
    constructor(container,data,arrIndex){
        this.id=data.position
        this.data=data.data
        this.index=arrIndex
        let title=localize(data.data["title"])
        let content=localize(data.data["content"])
        let s = document.createElement("section")
        s.classList.add("section")
        s.innerHTML=`
        <div class="level"><h2 class="subtitle">${title}</h2>
        <div id="adminControls${this.id}"></div>
        </div><div>${content}</div>`
        document.getElementById(container).appendChild(s)
        this.#initAdminControls()
    }
    #initAdminControls(){
        let i=this.id
        let adminHtml=`<div class="dropdown is-hoverable admin-controls is-hidden">
        <div class="dropdown-trigger">
          <button class="button" aria-haspopup="true" aria-controls="dropdown-menu4">
            <span><i class="fas fa-edit" aria-hidden="true"></i> <string type="gui">Edit</string></span>
            <span class="icon is-small">
              <i class="fas fa-angle-down" aria-hidden="true"></i>
            </span>
          </button>
        </div>
        <div class="dropdown-menu" role="menu">
          <div class="dropdown-content">
            <a class="dropdown-item" id="editSection${i}">
              <i class="fas fa-pen" aria-hidden="true"></i> Configure
            </a>
            <!--<a class="dropdown-item" id="upSection${i}">
              <i class="fas fa-arrow-up" aria-hidden="true"></i> Move up
            </a>
            <a class="dropdown-item" id="downSection${i}">
              <i class="fas fa-arrow-down" aria-hidden="true"></i> Move down
            </a>-->
            <a class="dropdown-item" id="removeSection${i}">
              <i class="fas fa-trash" aria-hidden="true"></i> Delete
            </a>
          </div>
        </div>
      </div>
      </div>`
        document.getElementById(`adminControls${i}`).innerHTML=adminHtml
        document.getElementById(`editSection${i}`).onclick=()=>{
          Section.edit(data.url,this.id,this.data,this.index)
        }
        document.getElementById(`removeSection${i}`).onclick=()=>{
          Section.remove(this.id,data.url)
        }
        /*document.getElementById(`upSection${i}`).onclick=()=>{
          moveBlock(this.id,0)
        }
        document.getElementById(`downSection${i}`).onclick=()=>{
          moveBlock(this.id,1)
        }*/
    }
    static edit(url,id,data,index){
      console.log(url,id,data,index)
        let titleMLI
        let contentMLI
        Swal.fire({title: 'Configure block',
        focusConfirm: false,
        html:`<p>Section title: </p><div id="titleMLI"></div><br/><br/>
        <p>Section content: </p><div id="contentMLI"></div><br/>`,
        showCancelButton: true,
        showLoaderOnConfirm:true,
        grow:"row",
        onRender:()=>{
            titleMLI=new MultiLangInput("titleMLI","titleMLI")
            contentMLI=new MultiLangInput("contentMLI","contentMLI")
            for(let l in data.title){
              titleMLI.editorStorage[l]=data.title[l]
              titleMLI.addLocale(l)
            }
            for(let l in data.content){
              contentMLI.editorStorage[l]=data.content[l]
              contentMLI.addLocale(l)
            }
        },
        preConfirm:()=>{
            let blockData={"type":"section","position":id,"data":{"title":titleMLI.editorStorage,"content":contentMLI.editorStorage}}
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