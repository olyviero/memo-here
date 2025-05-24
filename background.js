chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.dispatchEvent(new CustomEvent("add-memo")),
  });
});
