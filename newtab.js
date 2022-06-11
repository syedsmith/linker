const store = {
    MASTER: "masterLinkKey",
    CATEGORIES: "categories",
    PROPERTIES: "properties",
    LINKS: "links",
    LINK: "link",
    NAME: "name",
    DESCRIPTION: "description",
    ORDER: "order",
    CATEGORY: "category"
  }
  const resource = {
    FAVI_DOMAIN: "favi_domain"
  }

const cols = ["col-1", "col-2", "col-3", "col-4"]
const colslen = cols.length;

function getNxtColIdx(curIdx){
    nxtIdx = curIdx + 1;
    if (nxtIdx == colslen){ nxtIdx = 0; }
    return nxtIdx;
}

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
    console.log(storeObj);
    colIdx = 0;
    categories = storeObj[store.MASTER][store.CATEGORIES];
    categLinksObj = storeObj[store.MASTER][store.LINKS];

    categories.forEach(function(category){ 
        links = categLinksObj[category];
        if (typeof links === 'undefined'){ return; }

        categoryId = category.replace(" ","-");
        var domDivs = `<div id="${categoryId}-container" class="link-container link-container-bg">
        <div><div class="categ-title">${category}<span class="link-count">(${links.length})</span><span class="edit-categ-link"><a class="edit-category" data-type-categ="${category}" href="#">Edit</a></span></div></div>
        <div class="scroll" id="${categoryId}-scroll">`;

        links.forEach(function(link, index){
            // console.log(link);la
            domDivs +=`<a class="rm-link-decoration" href="${link[store.LINK]}">
            <div class="link-holder link-holder-bg">
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
        domDivs +="</div></div>"
        document.getElementById(cols[colIdx]).appendChild(new DOMParser().parseFromString(domDivs, 'text/html').getRootNode().firstChild);
        colIdx = getNxtColIdx(colIdx)
    });
    addEventListerners();
  }

  async function constructEditLinks(category){
    let storeObj;
    try{ storeObj = await getStoreValue(store.MASTER); }catch(e){ console.log(e); return; }
    categLinksObj = storeObj[store.MASTER][store.LINKS][category];
    var domDivs = `<div class="drag-container" style="min-height:100px;" id="edit-categ-links" data-type-categ="${category}">`;
    categLinksObj.forEach(function(link, index){
      domDivs +=`
            <div class="link-holder link-holder-bg draggable" draggable="true" data-type-link-index="${index}">
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
    console.log("addEventListerners");
    
    // Category Listeners - DELETE
    const linkContainerBtns = document.querySelectorAll('.delete-category');
    for (let i = 0; i < linkContainerBtns.length; i++) {
      // Add the below line to invoke this listener
      // <span class="del-categ"><a class="delete-category" data-type-categ="${category}" href="#">Del categ</a></span>

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
        showBackDrop(); 
        showCanvasSidebar();
      });
    }

    // Category Listeners close offcanvas on focus out
    let closeBtn = document.querySelector(".btn-close");
    closeBtn.addEventListener("click", closeCanvasEvent);


    // Listerner for saving the edited categ changes
    document.getElementById("save_categ_edit").addEventListener("click", function(e){
      saveCategChanges();
    });
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



  function closeCanvasEvent(){
      hideBackDrop();hideCanvasSidebar();
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
  function showCanvasSidebar(){
    let canvas = document.querySelector(".offcanvas");
    canvas.classList.add("show");
    canvas.classList.remove("hide");
  }
  function hideCanvasSidebar(){
    let canvas = document.querySelector(".offcanvas");
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
    let categs = storeObj[store.MASTER][store.CATEGORIES];
    const index = categs.indexOf(categ);
    if (index > -1) {
      storeObj[store.MASTER][store.CATEGORIES].splice(index, 1);
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