var url = window.location.href;
var button = document.createElement("div");
var css = document.createElement("style");
var href = url.split("/");
var steemId = href[href.length-2];
if (typeof fList === "undefined") {
  var fList = [];
}
if (typeof fTimeout === "undefined") {
  var fTimeout = parseInt(Math.floor(Date.now()));
  var setElem = 0;
}
steem.api.setOptions({ url: "https://anyx.io" });
//steem.api.setOptions({ url: "https://techcoderx.com" });

chrome.runtime.onMessage.addListener( function(message) {
  chrome.storage.local.set({disableRunning: message});
});

var checkRunning = () => {
  chrome.storage.local.get(["disableRunning"], function(result) {
    if (result.disableRunning) {
      console.log("Skip likecoin button")
      document.getElementById("likecoin-iframe").classList.add("elem-hide");
    }
    else {
      createLikerButton(url, steemId);
      console.log("Generate likecoin button");
    }
  });
};

var getFollowing = (start = 0, limit = 1000, following = []) => {
  return new Promise((resolve, reject) => {
    steem.api.getFollowing("cn-likers", start, 'blog', limit, async function (err, result) {
      if (result.length > 1) {
        let newResult = [];
        result.forEach(following => {
            if (following.follower != start) {
                newResult.push(following.following);
            }
        });
        following = [...following, ...newResult];
        let followingList = [];
        for (let i in newResult) {
            followingList.push(newResult[i].following);
        }
        getFollowing(result[result.length - 1].following, limit, following)
        .then(resolve)
        .catch(reject);
      } else {
        resolve(following);
      }
    });
  });
}

var getLikerId = (profile) => {
  const location = profile.location;
  //console.log(location)
  if(typeof location !=="undefined" && location !== "") {
    const loc = location.split(":");
    if( loc[0].trim() === "likerid" ) { return loc[1].trim(); }
    else { return false; }
  }
  else { return false; }
}

var isLiker = (steemId, following) => {
  let flag = false;
  let id = "";
  if ( steemId.startsWith("#@") ) {
    steemId = href[3];
  }
  if(steemId.startsWith("@")) { id = steemId.substr(1); }
  if ( id.length > 0 ){
    for(let i = 0; i < following.length; i++) {
      if(id === following[i]) {
        flag = true;
        break;
      }
    }
    if(flag) { return id; }
    else { return false; }
  }
  else{ return false; }
}

async function createLikerButton(url, steemId) {
  let following = fList;
  let rightNow = Math.floor(Date.now());
  if (rightNow >= fTimeout) {
    following = await getFollowing();
    fTimeout = fTimeout + 100000;
    fList = following;
    console.log("Refresh following list");
  }
  else {
    console.log("Use existing following list");
  }
  steemId = isLiker(steemId, following);
  console.log(url);
  console.log(steemId);
  if(steemId) {
    steem.api.getAccounts([steemId], function(err, result) {
      if(err === null) {
        const data = result[0];
        const profile = JSON.parse(data.json_metadata);
        const likerId = getLikerId(profile.profile);
        if(likerId) {
          const src = `https://button.like.co/in/embed/${likerId}/button?referrer=${url}`;
          //console.log(src);
          const iframe = document.createElement("iframe");
          iframe.setAttribute("src", src);
          iframe.setAttribute("frameborder", 0);
          iframe.setAttribute("scrolling", 0);
          iframe.setAttribute("target", "_top");
          button.appendChild(iframe);
          document.getElementById("likecoin-iframe").classList.remove("elem-hide");
        }
      }
      else{
        console.log(err);
      }
    });
  }
  else{
    console.log("Not a registered Liker");
  }
}

css.innerHTML = `
.likecoin-button {
  bottom: 20px;
  position: fixed;
  right: 20px;
  height: 240px;
  width: 500px;
  overflow: hidden;
  z-index: 2000
}
.likecoin-button.elem-hide {
  display: none;
}
.likecoin-button > div {
  padding-top: 49.48454%;
}
.likecoin-button > iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -ms-zoom: 0.75;
  -moz-transform: scale(0.75);
  -moz-transform-origin: 0 0;
  -o-transform: scale(0.75);
  -o-transform-origin: 0 0;
  -webkit-transform: scale(0.75);
  -webkit-transform-origin: 0 0;
}
`;
if (setElem < 1) {
  chrome.storage.local.set({disableRunning: false});
  document.body.appendChild(css);
  button.className = "likecoin-embed likecoin-button";
  button.setAttribute("id", "likecoin-iframe");
  document.body.appendChild(button);
  setElem++;
}

checkRunning();
window.setInterval(function() {
  let tempurl = window.location.href;
  if(tempurl !== url) {
    button.textContent = "";
    url = tempurl;
    href = url.split("/");
    steemId = href[href.length-2];
    checkRunning();
  }
}, 1000);
