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

function clearKeys(){
  keyVal=store.MASTER;
  console.log("clearing keys");
  chrome.storage.local.remove([keyVal],function(){
    var error = chrome.runtime.lastError;
    console.log(error);   
    if (error) {
           console.error(error);
       }
   })

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
document.getElementById("ListKeys").addEventListener("click", listKeys);
document.getElementById("clearKeys").addEventListener("click", clearKeys);

async function addLinkToNewTab(){
  const { hostname } = new URL(document.getElementById("linkurl").value);
  let favicon_url = "http://www.google.com/s2/favicons?domain="+hostname;
  let categ = document.getElementById("linkcategory").value;
  let link = {
    [store.LINK] : document.getElementById("linkurl").value,
    [store.DESCRIPTION]: document.getElementById("linkdescr").value,
    [resource.FAVI_DOMAIN]: favicon_url,
    [store.NAME]: document.getElementById("linkname").value,
    [store.CATEGORY]: categ
  }
  storeObj = await getStoreValue(store.MASTER);
  if (typeof storeObj === 'undefined'){
    storeObj = getNascentMasterObject();
  }
  if (!(storeObj[store.MASTER][store.CATEGORIES].includes(categ))){
    storeObj[store.MASTER][store.CATEGORIES].push(categ);
    storeObj[store.MASTER][store.LINKS][categ] = [];
  }
  storeObj[store.MASTER][store.LINKS][categ].push(link);
  setStoreValue(storeObj);
}

function getNascentMasterObject(){
  return  {
    [store.MASTER]: 
    {
      [store.PROPERTIES]: {}, 
      [store.CATEGORIES]: [],
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

function constructNewTab(){
  console.log("constructNewTab");
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded Listener");
}, false);