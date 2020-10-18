class MultiLangInput{
  #quill=null
    constructor(id,container){
        try{
        this.id=id
        document.getElementById(container).innerHTML=`
        <div class="columns">
                <aside class="menu column is-one-quarter">
                  <p class="menu-label">
                    <i class="fas fa-globe"></i> <string type="gui">Languages</string>
                  </p>
                  <ul class="menu-list" id="${id}LangList">
        
                  </ul>
                  <p class="menu-label">
                    <i class="fas fa-plus"></i> <string type="gui">Add new language</string>
                  </p>
                  <ul class="menu-list">
                    <li>
                      <div class="select">
                        <select id="${id}NewLocaleSelect">
                          <option selected disabled></option>
                          <option value="default">Default</option>
                        </select>
                      </div>
                    </li>
                  </ul>
                </aside>
                <main class="column">
                  <div id="${id}Editor"></div>
                </main>
              </div>
        `
        }
        catch{console.error("Failed to find container: "+container)}
        function compare(a, b) {
            let comparison = 0;
            if (a.name > b.name) {
              comparison = 1;
            } else if (a.name < b.name) {
              comparison = -1;
            }
            return comparison;
          }
        locales.sort(compare)
        locales.forEach((x)=>{
            document.getElementById(`${id}NewLocaleSelect`).innerHTML+=`<option value=${x.code}>${x.name}</option>`
        })
        this.editorStorage=Object()
        document.getElementById(`${id}NewLocaleSelect`).onchange=(e)=>{
            let toAdd=e.target.value
            e.target.value=""
            this.addLocale(toAdd)
        };
        this.#quill = new Quill(`#${id}Editor`, {
            theme: 'snow'
        });
        this.#quill.on('editor-change',(e)=>{
          if (e === 'text-change' && this.activeLocale!==undefined) {
            this.editorStorage[this.activeLocale]=this.#getEditorHTML()
          }
        })
        this.#quill.disable()
    }
    onEditorChange(){}
    onLocaleRemoved(){}
    addLocale(toAdd){
      if(document.querySelector(`.${this.id}langEdit[locale=${toAdd}]`))
          return
      if(toAdd=="default")
          document.getElementById(`${this.id}LangList`).innerHTML+=`<li>
          <a class="${this.id}langEdit" locale="default">Default 
          <span class="delete is-right ${this.id}langRemove" locale="default"></span>
          </a></li>`
      else
          document.getElementById(`${this.id}LangList`).innerHTML+=`<li>
          <a class="${this.id}langEdit" locale="${toAdd}">${locales.find((item)=>{return item.code==toAdd}).name} 
          <span class="delete is-right ${this.id}langRemove" locale="${toAdd}"></span>
          </a></li>`
      this.#connectEvents()
    }
    #remove(locale,listItem){
        delete this.editorStorage[locale]
        listItem.remove()
        if(this.activeLocale==locale){
          this.activeLocale=undefined
          this.#quill.setContents([])
          this.#quill.disable()
        }
        this.onLocaleRemoved(locale)
    }
    #connectEvents(){
        let menuItems=document.getElementsByClassName(`${this.id}langEdit`)
        for (let item of menuItems){
            item.onclick=(e)=>{
                this.#openEditor(e)
            }
        }
        let menuDeleteItems=document.getElementsByClassName(`${this.id}langRemove`)
        for (let item of menuDeleteItems){
            item.onclick=(e)=>{
                e.stopPropagation()
                let toDelete=e.target.getAttribute("locale")
                this.#remove(toDelete,e.target.parentElement)
            }
        }
    }
    #openEditor(e){
        this.onEditorChange(this.activeLocale)
        this.#deactivateOthers()
        this.activeLocale=undefined
        e.target.classList.add("is-active")
        this.#quill.setContents([])
        this.#quill.enable()
        this.activeLocale = e.target.getAttribute("locale")
        if(this.editorStorage.hasOwnProperty(this.activeLocale))
            this.#quill.pasteHTML(0,this.editorStorage[this.activeLocale])
    }
    #deactivateOthers(){
        let menuItems=document.getElementsByClassName(`${this.id}langEdit`)
        for (let item of menuItems){
            item.classList.remove("is-active")
        }
    }
    #getEditorHTML(){
        let tempCont = document.createElement("div");
        (new Quill(tempCont)).setContents(this.#quill.getContents());
        return tempCont.getElementsByClassName("ql-editor")[0].innerHTML;
    }
}