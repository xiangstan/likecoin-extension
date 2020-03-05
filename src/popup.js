const clickButton = (data) => {
  chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.executeScript(tabs[0].id, { file: "liker.js" });
    chrome.tabs.sendMessage(tabs[0].id, !data);
  });
  console.log(data);
};
document.addEventListener('DOMContentLoaded', function () {
  const onOffSwitch = document.getElementById("myonoffswitch");
  chrome.storage.local.get(["disableRunning"], function(result) {
    console.log(result);
    onOffSwitch.checked = !result.disableRunning;
  });
  onOffSwitch.addEventListener("click", function() {
    clickButton(this.checked);
  });
});
