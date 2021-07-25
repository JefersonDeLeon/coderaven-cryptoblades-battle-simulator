var enableCBSimulatorCheckbox = document.getElementById("enableSimulator");

// On init update the UI checkbox based on storage
chrome.storage.sync.get('cb_enabled', function(data) {
    enableCBSimulatorCheckbox.checked = data.cb_enabled;
});

// Pass init or remove message to content script
enableCBSimulatorCheckbox.onchange = function(element) {
    let value = this.checked;

    // Update the extension storage value
    chrome.storage.sync.set({"cb_enabled": value}, function() {
        console.log("The value is: " + value);
    })

    // Pass init or remove message to content script
    if (value) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {command: "init", cb_enabled: value}, function(response) {
                console.log(response.result);
            });
        });
    } else {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {command: "remove", cb_enabled: value}, function(response) {
                console.log(response.result);
            });
        });
    }
}