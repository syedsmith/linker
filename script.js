const store = {
  MASTER: "masterLinkKey",
  CATEGORIES: "categories",
  PROPERTIES: "properties",
  LINKS: "links",
  LINK: "link",
  NAME: "name",
  DESCRIPTION: "description",
  ORDER: "order"
}

const resource = {
  FAV_DOMAIN: "fav_domain"
}

// Event Listerners
document.getElementById("store_global").addEventListener("click", createStorageObj);
document.getElementById("get_local").addEventListener("click", getFromLocal);
document.getElementById("get_global").addEventListener("click", getFromGlobal);


function createStorageObj(){
  let obj = {
    [store.MASTER]: 
    {
      [store.PROPERTIES]: {}, 
      [store.CATEGORIES]: ["Office", "Personal"],
      [store.LINKS]: [
        [
          {
          [store.link] : "https://mail.google.com/mail/u/0/#inbox",
          [store.DESCRIPTION]: "to access mail",
          [resource.FAV_DOMAIN]: "mail.google.com",
          [store.NAME]: "smith link"
        },
        {
          [store.link] : "https://mail.google.com/mail/u/0/#inbox",
          [store.DESCRIPTION]: "to access mail",
          [resource.FAV_DOMAIN]: "mail.google.com",
          [store.NAME]: "smith link"
        }
        ],
        [
          {
          [store.link] : "https://mail.google.com/mail/u/0/#inbox",
          [store.DESCRIPTION]: "to personal access mail",
          [resource.FAV_DOMAIN]: "mail.google.com",
          [store.NAME]: "smith link"
        },
        {
          [store.link] : "https://mail.google.com/mail/u/0/#inbox",
          [store.DESCRIPTION]: "to personal access mail",
          [resource.FAV_DOMAIN]: "mail.google.com",
          [store.NAME]: "smith link"
        }
        ]
      ]
    }
  }
  storeGlobal(obj);
}

function storeGlobal(obj){
  chrome.storage.sync.set(obj, function() {
    console.log('Value is set to Global key ');
  });
}

function storeToLocal(){
    var key = "smith";
    var value = "first_chrome_extension";
    chrome.storage.local.set({[key]: value}, function() {
        console.log('Value is set to local as ' + value);
      });
}

function storeToGlobal(){
    var key = "smith";
    var value = "first_chrome_extension_app";
    var obj = {}
    
    chrome.storage.sync.set({[key]: value}, function() {
        console.log('Value is set to Global as ' + value);
      });
}

function getFromGlobal(){
    var key = "smith";
    chrome.storage.sync.get(key, function(result) {
        console.log('myLogin= '+JSON.stringify(result));
        return result.key;
      });

      listKeys();

}

function getFromLocal(){
    var key = "smith";
    chrome.storage.local.get(key, function(result) {
        console.log('myLogin= '+JSON.stringify(result));
        return result.key;
      });
}

function listKeys(){
  console.log("Listing keys");
  chrome.storage.sync.get(null, function(items) {
    var allKeys = Object.keys(items);
    console.log(allKeys);
  });
}