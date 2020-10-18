class MenuManager{
      constructor(id,container){
          try{
            this.id=id
          document.getElementById(container).innerHTML=`
            <table class="table is-fullwidth">
                <thead>
                    <tr>
                        <th>URL</th>
                        <th>Title</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="${id}tbody">
                </tbody>
                <tfoot>
                <tr><td colspan="3"><a class="btn" id="${id}new">&nbsp;Create new page</a></td></tr>
                </tfoot>
            </table>
          `
          }
          catch{console.error("Failed to find container: "+container)}
          this.refreshData()
          document.getElementById(`${id}new`).onclick=()=>{this.newPage(this)}
    }
    localize(localeArray){
        if(localeArray[window.navigator.language.slice(0, 2)]){
            return localeArray[window.navigator.language.slice(0, 2)];
        }
        return localeArray["default"];
    }
    newPage(self){
        let titleMLI
        Swal.fire({title: 'New page',
        focusConfirm: false,
        html:`<p>Page URL: </p><input class="input" id="${self.id}url" type="url"><br/><br/>
        <p>Page name: </p><div id="nameMLI"></div><br/>`,
        showCancelButton: true,
        showLoaderOnConfirm:true,
        grow:"row",
        onRender:()=>{
            titleMLI=new MultiLangInput("nameMLI","nameMLI")
        },
        preConfirm:()=>{
            let url=document.getElementById(`${self.id}url`).value
            let title=titleMLI.editorStorage
            let data=JSON.stringify({"sid":localStorage.getItem("sid"),"url":url,"name":title,"pos":self.maxPos+1})
            console.log(data)
            return fetch("/api/sites",{method:"POST",body:data}).then(req=>{
                if(req.status==200){
                    req.text().then(strings=>{
                        Swal.fire({
                            title:"Success!",
                            text:`Page created`,
                            icon:"success",
                            position:"center",
                            timer:0,
                            timerProgressBar:true,
                            showConfirmButton:false
                        })
                        self.refreshData()
                        self.onActionFinished()
                        return true
                    })
                }
                else{
                    console.error("Unable to create page")
                    req.text().then(strings=>{
                        toast({message:strings,type:"is-danger"})
                    })
                    return false
                }
            })         
        }
    })
    }
    renamePage(self,element){
        console.log(element)
        {
            let titleMLI
            Swal.fire({title: 'Rename page',
            focusConfirm: false,
            html:`<p>Page URL: </p><input class="input" id="${self.id}url" type="url" value="${element.url}"><br/><br/>
            <p>Page name: </p><div id="nameMLI"></div><br/>`,
            showCancelButton: true,
            showLoaderOnConfirm:true,
            grow:"row",
            onRender:()=>{
                titleMLI=new MultiLangInput("nameMLI","nameMLI")
                titleMLI.editorStorage=element.name
                for (let i in titleMLI.editorStorage){
                    titleMLI.addLocale(i)
                }
            },
            preConfirm:()=>{
                let url=document.getElementById(`${self.id}url`).value
                let title=titleMLI.editorStorage
                let data={"url":url,"name":title}
                let editOP={}
                editOP["$set"]=data
                console.log(editOP)
                return fetch("/api/sites",{method:"PATCH",body:JSON.stringify({"sid":localStorage.sid,"url":element.url,"edit":editOP})}).then(req=>{
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
                            self.refreshData()
                            self.onActionFinished()
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
    movePage(self,sites,from,to){
        let a,b
        let next=false
        let previous=undefined
        let brk=false
        sites.forEach((i)=>{
            if(!brk){
                if(next){
                    b=i.url
                    brk=true
                }
                if(i.position==from){
                    a=i.url
                    next=to
                    if(!to){
                        b=previous
                        brk=true
                    }
                }
                previous=i.url
            }
        })
        to=to?from+1:from-1
        console.log(a,to)
        console.log(b,from)
        if(!a||!b)
            return;
        Swal.fire({
            title: 'Changing page position...',
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
    deletePage(self,url){
        Swal.fire({
            title: `Do you want to remove "${url}"?`,
            showCancelButton: true,
            confirmButtonText: `Remove`,
            cancelButtonText: `Cancel`,
            confirmButtonColor: `#d33`,
            focusCancel: true,
          }).then((result) => {
            if (result.isConfirmed) {
                let data=JSON.stringify({"sid":localStorage.getItem("sid"),"url":url})
                console.log(data)
                return fetch("/api/sites",{method:"DELETE",body:data}).then(req=>{
                    if(req.status==200){
                        req.text().then(strings=>{
                            Swal.fire({
                                title:"Success!",
                                text:`Page deleted`,
                                icon:"success",
                                position:"center",
                                timer:1000,
                                timerProgressBar:true,
                                showConfirmButton:false
                            })
                            self.refreshData()
                            self.onActionFinished()
                            return true
                        })
                    }
                    else{
                        console.error("Unable to delete page")
                        req.text().then(strings=>{
                            toast({message:strings,type:"is-danger"})
                        })
                        return false
                    }
                })
            }
          })
    }
    refreshData(){
        fetch("/api/sites").then((sites)=>{
            sites.json().then((sites)=>{
                document.getElementById(`${this.id}tbody`).innerHTML="";
                this.maxPos=0
                sites.sort(function (a, b) {
                    let comparison = 0;
                    if (a.position > b.position) {
                        comparison = 1;
                    } else if (a.position < b.position) {
                        comparison = -1;
                    }
                    return comparison;
                });
                for(var f in sites) {
                    if(sites[f].url == "*") {
                        delete sites[f];
                    }
                }
                sites.forEach(element => {
                    console.log(element)
                    if(element.position>this.maxPos)
                        this.maxPos=element.position
                    let x = document.createElement("tr")
                    x.innerHTML=`
                        <td>${element.url}</td>
                        <td>${this.localize(element.name)}</td>
                        <td>
                        <a aria-label="rename" id="${this.id}|rename|${element._id}">
                            <span class="icon is-small has-text-info">
                                <i class="fas fa-edit" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a aria-label="up" id="${this.id}|up|${element._id}">
                            <span class="icon is-small has-text-primary">
                                <i class="fas fa-arrow-up" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a aria-label="down" id="${this.id}|down|${element._id}">
                            <span class="icon is-small has-text-primary">
                                <i class="fas fa-arrow-down" aria-hidden="true"></i>
                            </span>
                        </a>
                        <a aria-label="delete" id="${this.id}|delete|${element._id}">
                            <span class="icon is-small has-text-danger">
                                <i class="fas fa-trash" aria-hidden="true"></i>
                            </span>
                        </a>
                        </td>`;
                    document.getElementById(`${this.id}tbody`).appendChild(x);
                    document.getElementById(`${this.id}|rename|${element._id}`).onclick=()=>{
                        this.renamePage(this,element)
                    }
                    document.getElementById(`${this.id}|up|${element._id}`).onclick=()=>{
                        this.movePage(this,sites,element.position,0)
                    }
                    document.getElementById(`${this.id}|down|${element._id}`).onclick=()=>{
                        this.movePage(this,sites,element.position,1)
                    }
                    document.getElementById(`${this.id}|delete|${element._id}`).onclick=()=>{
                        this.deletePage(this,element.url)
                    }
                });
            })
        })
    }
    onActionFinished(){

    }
}