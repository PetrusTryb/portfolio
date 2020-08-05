let locale=window.navigator.language.slice(0, 2)
let pendingDownload=[]
let pendingTranslate={}
let done=0
translateables=document.getElementsByTagName("string")
for (let e in translateables){
    if(!isNaN(Number(e))){
        let type=translateables[e].getAttribute("type")
        let element=translateables[e]
        if(!pendingDownload.includes(type)){
            pendingTranslate[type]=[]
            pendingDownload.push(type)
        }
        pendingTranslate[type].push(element)
    }
}
pendingDownload.forEach((type)=>{
    fetch("/api/resources",{method:"POST",body:JSON.stringify({"lang":locale,"what":type})}).then(req=>{
        if(req.status==200){
            req.json().then(strings=>{
                pendingTranslate[type].forEach((elem)=>{
                    if(strings[elem.innerHTML])
                        elem.innerHTML=strings[elem.innerHTML]
                })
            })
            ++done
            if(done==pendingDownload.length)
                document.getElementsByClassName("pageloader")[0].classList.remove("is-active")
        }
        else{
            fetch("/api/resources",{method:"POST",body:JSON.stringify({"lang":"default","what":type})}).then(req=>{
                if(req.status==200){
                    console.warn("Fallback to default language: "+type)
                    req.json().then(strings=>{
                        pendingTranslate[type].forEach((elem)=>{
                            if(strings[elem.innerHTML])
                                elem.innerHTML=strings[elem.innerHTML]
                        })
                    })
                    ++done
                    if(done==pendingDownload.length)
                        document.getElementsByClassName("pageloader")[0].classList.remove("is-active")
                }
                else{
                    console.error("Cannot get - locale: "+locale+", type: "+type)
                    ++done
                    if(done==pendingDownload.length)
                        document.getElementsByClassName("pageloader")[0].classList.remove("is-active")
                }  
            })
        }
        
    })
})
