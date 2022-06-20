const store = {
    MASTER: "masterLinkKey",
    CATEGORIES: "categories",
    PROPERTIES: "properties",
    LINKS: "links",
    LINK: "link",
    NAME: "name",
    DESCRIPTION: "description",
    ORDER: "order",
    CATEGORY: "category",
    DARK_MODE: "dark-mode"
  }
  const resource = {
    FAVI_DOMAIN: "favi_domain"
  }

const cols = ["col-1", "col-2", "col-3", "col-4", "col-5"]
const colslen = cols.length;

// function getNxtColIdx(curIdx){
//     nxtIdx = curIdx + 1;
//     if (nxtIdx == colslen){ nxtIdx = 0; }
//     return nxtIdx;
// }


const getStoreValue = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], function (result) {
        if (result[key] === undefined) {
          reject();
        } else {
          resolve(result);
        }
      });
    });
  };

  async function constructLinks(){
    let storeObj;
    try{
      storeObj = await getStoreValue(store.MASTER);
    }catch(e){
      console.log(e);
      return;
    }
    colIdx = 0;
    categoriesArr = storeObj[store.MASTER][store.CATEGORIES];
    categLinksObj = storeObj[store.MASTER][store.LINKS];
    props = storeObj[store.MASTER][store.PROPERTIES];
    
    // Dark Mode 
    let isDarkModeEnabled = false;
    if (props && props[store.DARK_MODE]){
      isDarkModeEnabled = props[store.DARK_MODE];
    }
    document.getElementById("toggle-dark-mode").checked = isDarkModeEnabled;
    drawDarkMode(isDarkModeEnabled);
    
    var columnBody = document.getElementById("column-body");
    for(let containerNum = 0; containerNum<categoriesArr.length; containerNum++)
    { 
      colCategories = categoriesArr[containerNum];

      colCategories.forEach(function(category){
        links = categLinksObj[category];
        if (typeof links === 'undefined'){ return; }

        categoryId = category.replace(" ","-");
        var domDivs = `<div id="${categoryId}-container" class="link-container link-container-bg">
        <div><div class="categ-title">${category}<span class="link-count">(${links.length})</span><span class="edit-categ-link"><a class="edit-category" data-type-categ="${category}" href="#">Edit</a></span></div></div>
        <div class="scroll" id="${categoryId}-scroll">`;

        links.forEach(function(link, index){
            domDivs +=`<a class="rm-link-decoration" href="${link[store.LINK]}">
            <div class="link-holder">
                <div>
                    <div class="d-flex row-flex">
                        <div><img loading="lazy" src="${link[resource.FAVI_DOMAIN]}" width="20" height="20" style="margin-top: -8px;"></div>
                        <div class="link-title">${link[store.NAME]}</div>
                    </div>
                    <div class="link-descr">
                        <div class="link">${link[store.LINK]}</div>
                        ${link[store.DESCRIPTION]}
                    </div>
                </div>
            </div>
            </a>`;
        });
        domDivs +="</div></div>";
        columnBody.querySelector("#"+cols[containerNum]).appendChild(new DOMParser().parseFromString(domDivs, 'text/html').getRootNode().body.firstChild);
      });
    };
    addEventListerners();
  }

  async function constructEditLinks(category){
    let storeObj;
    try{ storeObj = await getStoreValue(store.MASTER); }catch(e){ console.log(e); return; }
    categLinksObj = storeObj[store.MASTER][store.LINKS][category];
    var domDivs = `<div class="drag-container" style="min-height:100px;" id="edit-categ-links" data-type-categ="${category}">`;
    categLinksObj.forEach(function(link, index){
      domDivs +=`
            <div class="link-holder-drag link-holder-bg draggable" draggable="true" data-type-link-index="${index}">
                <div>
                    <div class="d-flex row-flex">
                        <div><img loading="lazy" src="${link[resource.FAVI_DOMAIN]}" width="20" height="20" style="margin-top: -8px;"></div>
                        <div class="link-title">${link[store.NAME]}</div>
                    </div>
                    <div class="link-descr">
                        <div class="link">${link[store.LINK]}</div>
                        ${link[store.DESCRIPTION]}
                    </div>
                </div>
            </div>`;
    });
    domDivs += "</div>";
    let categLinksBody = document.getElementById("edit-categ-links-body");
    emptyDomChilds(document.getElementById("delete_categ_links"));
    emptyDomChilds(categLinksBody);
    categLinksBody.appendChild(new DOMParser().parseFromString(domDivs, 'text/html').getRootNode().body.firstChild);
    draggableInit();
    document.getElementById("delete-category").setAttribute("data-type-categ", category);
    document.getElementById("edit-categ-title").innerHTML = category;
  }

  function addEventListerners(){
    
    // Category Listeners - DELETE
    const linkContainerBtns = document.querySelectorAll('.delete-category');
    for (let i = 0; i < linkContainerBtns.length; i++) {
      linkContainerBtns[i].addEventListener('click', function (e) {
        if(confirm("Do you wish to delete category '"+(e.target.getAttribute("data-type-categ")) + "' and its links permanently ?\nClick OK to delete")){
          delCategory(e.target.getAttribute("data-type-categ"));
        }
      });
    }

    // Category Listeners open offcanvas for EDIT
    const editCategBtns = document.querySelectorAll(".edit-category");
    for(let i=0; i < editCategBtns.length; i++){
      editCategBtns[i].addEventListener("click", function(e){
        let categ = editCategBtns[i].getAttribute("data-type-categ");
        constructEditLinks(categ);
        showCanvasSidebar(".offcanvas-categ-edit-links");
      });
    }

    // Category Listeners close offcanvas on focus out
    let closeBtns = document.querySelectorAll(".btn-close");
    for(let i=0; i< closeBtns.length; i++){
      closeBtns[i].addEventListener("click", () => {
        hideCanvasSidebar(".offcanvas-categ-edit-links");hideCanvasSidebar(".offcanvas-categ-reorder");
      });
    }
    


    // Listerner for saving the edited categ changes
    document.getElementById("save_categ_edit").addEventListener("click", function(e){
      saveCategChanges();
    });

    // Listerner for category redorder
    document.getElementById("category-reorder").addEventListener("click", function(e){
      buildReorderCategs();
      showCanvasSidebar(".offcanvas-categ-reorder");
    });

    // Listerner for SAVING category redorder
    document.getElementById("save_categ_order").addEventListener("click", function(e){
      saveCategReorder()
    });


    document.getElementById("toggle-dark-mode").addEventListener("change", function(e){
      updateDarkMode(this.checked);
    });
}

async function updateDarkMode(isEnable){
  let storeObj;
  try{ storeObj = await getStoreValue(store.MASTER); }catch(e){ console.log(e); return; }
  storeObj[store.MASTER][store.PROPERTIES][store.DARK_MODE] = isEnable
  setStoreValue(storeObj)
  drawDarkMode(isEnable);
}

function drawDarkMode(isEnable){
  let navbar = document.querySelector("nav");
  let body = document.querySelector("body");
  let label = document.querySelector("label");
  if(isEnable){
    body.classList.add("bg-black");
    navbar.classList.add("navbar-dark", "bg-black");
    navbar.classList.remove("navbar-light", "bg-light");
    label.classList.add("text-white");
  }
  else{
    body.classList.remove("bg-black");
    navbar.classList.remove("navbar-dark", "bg-black");
    navbar.classList.add("navbar-light", "bg-light");
    label.classList.remove("text-white");
  }
  

}

async function saveCategReorder(){
  let storeObj;
    try{ storeObj = await getStoreValue(store.MASTER); }catch(e){ console.log(e); return; }
    let newCategOrder = []
    for(let i = 0; i<colslen; i++){
      let colContainer = document.getElementById("categ-reorder-index-"+i);
      let newCategArr = [];
      for(let j=0; j < colContainer.childNodes.length; j++ ){
        if(colContainer.childNodes[j].nodeType != Node.TEXT_NODE){
          newCategArr.push(colContainer.childNodes[j].getAttribute("data-type-categ"));
        }
      }
      newCategOrder.push(newCategArr);
    }
    storeObj[store.MASTER][store.CATEGORIES] = newCategOrder;
    setStoreValue(storeObj);
    refreshNewTab();
}

  async function buildReorderCategs(){
    let storeObj;
    try{ storeObj = await getStoreValue(store.MASTER); }catch(e){ console.log(e); return; }
    let categsColArr = storeObj[store.MASTER][store.CATEGORIES];

    let containerDiv = `<div class="d-flex ">`;
    for(let i = 0; i<colslen; i++){
      containerDiv += `<div id="categ-reorder-index-${i}" class="drag-container w-100 border rounded m-1" style="min-height:100px;">`;
      if(i < categsColArr.length){
        for(let j=0; j<categsColArr[i].length; j++){
          containerDiv +=`<div data-type-categ="${categsColArr[i][j]}" class="link-holder-drag link-holder-bg draggable" draggable="true">${categsColArr[i][j]}</div>`;
        }
      }
      containerDiv +="</div>";
    }
    containerDiv += "</div>";
    reorderBody = document.getElementById("categ_reorder_containers");
    emptyDomChilds(reorderBody);
    reorderBody.appendChild(new DOMParser().parseFromString(containerDiv, 'text/html').getRootNode().body.firstChild);
    draggableInit();
  }


  async function saveCategChanges(){
    let categLinks = document.getElementById("edit-categ-links");
    let categ = categLinks.getAttribute("data-type-categ");
    let indexOrder = [];
    for(let i=0; i < categLinks.childNodes.length; i++ ){
      if(categLinks.childNodes[i].nodeType != Node.TEXT_NODE){
        indexOrder.push(categLinks.childNodes[i].getAttribute("data-type-link-index"));
      }
    }
    let deleteCategLinks = document.getElementById("delete_categ_links");
    let delLinkCount = 0;
    for(let i=0; i < deleteCategLinks.childNodes.length; i++ ){
      if(deleteCategLinks.childNodes[i].nodeType != Node.TEXT_NODE){
        delLinkCount++;
      }
    }
    let storeObj;
    try{ storeObj = await getStoreValue(store.MASTER); }catch(e){ console.log(e); return; }
    categLinksArr = storeObj[store.MASTER][store.LINKS][categ];
    let cpyLinksArr = categLinksArr.slice();
    indexOrder.forEach(function(order, index){
      categLinksArr[index] = cpyLinksArr[order];
    });
    storeObj[store.MASTER][store.LINKS][categ] = categLinksArr.slice(0, categLinksArr.length - delLinkCount);
    setStoreValue(storeObj);
    refreshNewTab();
  }

  function emptyDomChilds(element) {
    while(element.firstElementChild) {
       element.firstElementChild.remove();
    }
  }

  function hideBackDrop(){
    let backdrop = document.getElementById("modal-backdrop");
    backdrop.classList.remove("backdrop-screen", "show");
    backdrop.classList.add("hide");
  }
  function showBackDrop(){
    let backdrop = document.getElementById("modal-backdrop");
    backdrop.classList.add("backdrop-screen", "show");
    backdrop.classList.remove("hide");
  }
  function showCanvasSidebar(className){
    showBackDrop();
    let canvas = document.querySelector(className);
    canvas.classList.add("show");
    canvas.classList.remove("hide");
  }
  function hideCanvasSidebar(className){
    hideBackDrop();
    let canvas = document.querySelector(className);
    canvas.classList.remove("show");
    canvas.classList.add("hide");
  }



  async function delCategory(categ){
    try{
      storeObj = await getStoreValue(store.MASTER);
    }catch(e){
      console.log(e);
      return;
    }
    let categsColArr = storeObj[store.MASTER][store.CATEGORIES];

    for(let i=0; i< categsColArr.length; i++){
      let ColArr = categsColArr[i];
      const index = ColArr.indexOf(categ);
      if (index > -1) {
        ColArr.splice(index, 1);
      }
    }
    delete storeObj[store.MASTER][store.LINKS][categ];
    setStoreValue(storeObj)
    refreshNewTab();
  }


try {
    constructLinks();
} catch(e) {
    console.log(e);
}

  function refreshNewTab(){
    window.open("newtab.html", "_self");
  }

  function setStoreValue(obj){
    chrome.storage.sync.set(obj, function() {});
  }


  document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false; 
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
      hideCanvasSidebar(".offcanvas-categ-edit-links");
      hideCanvasSidebar(".offcanvas-categ-reorder");
    }
};
