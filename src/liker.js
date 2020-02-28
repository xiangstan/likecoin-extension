var url = window.location.href;
const button = document.createElement("div");
const css = document.createElement("style");
const href = url.split("/");
var likerId = href[href.length-2];

const getFollowing = (start = 0, limit = 1000, following = []) => {
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

const isLiker = (likerId, following) => {
  let flag = false;
  if(likerId.startsWith("@")) {
    const id = likerId.substr(1);
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

async function createLikerButton() {
  let following = await getFollowing();
  //url = encodeURIComponent(url);
  likerId = await isLiker(likerId, following);
  console.log(likerId);
  if(likerId) {
    const src = `https://button.like.co/in/embed/${likerId}/button?referrer=${url}`;
    console.log(src);
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", src);
    iframe.setAttribute("frameborder", 0);
    iframe.setAttribute("scrolling", 0);
    iframe.setAttribute("target", "_top");
    button.appendChild(iframe);
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
  z-index: 100
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
document.body.appendChild(css);
button.className = "likecoin-embed likecoin-button";
document.body.appendChild(button);

createLikerButton();
