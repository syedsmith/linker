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
  
  // Event Listerners
  document.getElementById("addtonewtab").addEventListener("click", addLinkToNewTab);
  // document.getElementById("ListKeys").addEventListener("click", listKeys);
  
function getColWithMinCateg(arr){
  let col = 0;
  minLen = arr[0].length;
  for(let i =1; i < arr.length; i++){
    if(minLen > arr[i].length){
      col = i;
      minLen = arr[i].length;
    }
  }
  return col;
}

  async function addLinkToNewTab(){
    const { hostname } = new URL(document.getElementById("linkurl").value);
    let favicon_url = "http://www.google.com/s2/favicons?domain="+hostname;
    let categ = document.getElementById("linkcategory").value;
    let storeObj;
    let link = {
      [store.LINK] : document.getElementById("linkurl").value,
      [store.DESCRIPTION]: document.getElementById("linkdescr").value,
      [resource.FAVI_DOMAIN]: favicon_url,
      [store.NAME]: document.getElementById("linkname").value,
      [store.CATEGORY]: categ
    }
    try{
      storeObj = await getStoreValue(store.MASTER);
    }catch(e){
      console.log(e);
    }
    if (typeof storeObj === 'undefined'){
      storeObj = getNascentMasterObject();
    }
    storeCategs = storeObj[store.MASTER][store.CATEGORIES];
    if (!(isCategAvailable(storeCategs, categ))){
      storeCategs[getColWithMinCateg(storeCategs)].push(categ);
      storeObj[store.MASTER][store.LINKS][categ] = [];
    }
    storeObj[store.MASTER][store.LINKS][categ].push(link);
    setStoreValue(storeObj);
    window.close();
  }
  
  function isCategAvailable(storeCategs, categ){
    for(let i=0; i<storeCategs.length; i++){
      for(let j=0; j<storeCategs[i].length; j++){
        if (storeCategs[i][j] == categ){
          return true;
        }
      }
    }
    return false;
  }
  
  function getNascentMasterObject(){
    return  {
      [store.MASTER]: 
      {
        [store.PROPERTIES]: {[store.DARK_MODE] : false}, 
        [store.CATEGORIES]: [[],[],[],[],[]],
        [store.LINKS]: {}
      }
    }
  }
  
  function setStoreValue(obj){
    chrome.storage.sync.set(obj, function() {});
  }
  
  function listKeys(){
    chrome.storage.sync.get(null, function(items) {
      var allKeys = Object.keys(items);
      console.log("Listing keys");
      console.log(allKeys);
  
    });
  }


  async function addCategsDataList(){
    try{
      storeObj = await getStoreValue(store.MASTER);
    }catch(e){ console.log(e); return; }
    let colCategs = storeObj[store.MASTER][store.CATEGORIES];
    let categDom = document.getElementById('linkcategs');
    for(let i =0; i< colCategs.length; i++){
      let categs = colCategs[i];
      categs.forEach(function(categ){
        let option = document.createElement('option');
        option.value = categ;
        categDom.appendChild(option);
      });
    }
    
  }

  addCategsDataList();