var ELEMENTS = {
    fire: "fire-icon",
    earth: "earth-icon",
    lightning: "lightning-icon",
    water: "water-icon"
};

function GetAffinityComparison(playerElement, encounterElement) {
    // -1 if player is weaker, 0 if neutral, 1 if player is stronger
    if (playerElement == ELEMENTS.fire) {
        if (encounterElement == ELEMENTS.water) return -1;
        else if (encounterElement == ELEMENTS.earth) return 1;
        else return 0;
    }

    if (playerElement == ELEMENTS.earth) {
        if (encounterElement == ELEMENTS.fire) return -1;
        else if (encounterElement == ELEMENTS.lightning) return 1;
        else return 0;
    }

    if (playerElement == ELEMENTS.lightning) {
        if (encounterElement == ELEMENTS.earth) return -1;
        else if (encounterElement == ELEMENTS.water) return 1;
        else return 0;
    }

    if (playerElement == ELEMENTS.water) {
        if (encounterElement == ELEMENTS.lightning) return -1;
        else if (encounterElement == ELEMENTS.fire) return 1;
        else return 0;
    }
}

function AttributeNameToElement(attributeName) {
    switch (attributeName.toLowerCase()) {
        case "pwr":
            return ELEMENTS.fire;
        case "dex":
            return ELEMENTS.earth;
        case "cha":
            return ELEMENTS.lightning;
        case "int":
            return ELEMENTS.water;
        default:
            return null;
    }
}

var addListeners = function(){
    $("body").delegate(".weapon-icon", "mouseenter", function() {
        var weaponContainer = this;
        var tooltipInnerContainer = document.getElementsByClassName("tooltip-inner");
        if (tooltipInnerContainer.length > 0) {
            var tooltipText = tooltipInnerContainer[0].textContent;
            var matches = tooltipText.match(/Bonus power: [0-9]+/i);
    
            if (matches) {
                var weapon = {
                    weaponElement: weaponContainer.getElementsByClassName("trait")[0].getElementsByTagName("span")[0].className,
                    weaponBonusPower: parseInt(matches[0].replace("Bonus power: ", "")),
                    weaponAttributes: [],
                    weaponTotalPower: 1,
                };
                var player = {
                    element: document.getElementsByClassName("trait-icon")[0].className.replace(" trait-icon", ""),
                    power: parseInt(document.getElementsByClassName("subtext-stats")[0].children[3].textContent.replace(",", ""))
                };
                var encounters = [];
    
                // Get all weapon attributes
                var weaponAttributesList = weaponContainer.getElementsByClassName("stats")[0].children;
    
                if (weaponAttributesList == null || weaponAttributesList.length < 1) return;
    
                for (var i = 0; i < weaponAttributesList.length; i++) {
                    var attr = {
                        attrName: weaponAttributesList[i].children[1].className,
                        value: parseInt(weaponAttributesList[i].children[1].textContent.match(/[0-9]+/)[0])
                    };
                    weapon.weaponAttributes.push(attr);
                }
    
                // Calculate wepaon total power based on attributes
                for (var i = 0; i < weapon.weaponAttributes.length; i++) {
                    var m = 0.0025; // Default weapon bonus multiplier
    
                    if (AttributeNameToElement(weapon.weaponAttributes[i].attrName) == player.element) m = 0.002675;
                    else if (weapon.weaponAttributes[i].attrName == "pwr") m = 0.002575;
    
                    weapon.weaponTotalPower += (weapon.weaponAttributes[i].value * m);
                }
    
                // Calculate for each enemy encounter
                var encounterContainers = document.getElementsByClassName("encounter-container");
                for (var i = 0; i < encounterContainers.length; i++) {
                    var encounter = {
                        element: encounterContainers[i].getElementsByClassName("encounter-element")[0].getElementsByTagName("span")[0].className,
                        power: parseInt(encounterContainers[i].getElementsByClassName("encounter-power")[0].textContent)
                    }
    
                    // Calculate trait bonus
                    var traitBonus = 0;
                    if (player.element == weapon.weaponElement) traitBonus += 0.075;
                    if (GetAffinityComparison(player.element, encounter.element) == 1) traitBonus += 0.075;
                    if (GetAffinityComparison(player.element, encounter.element) == -1) traitBonus -= 0.075;
    
    
                    // Simulate Rolls 100x
                    var SIMULATION_ROLLS = 100;
                    var wins = 0;
                    for (var r = 0; r < SIMULATION_ROLLS; r++) {
                        // Add random 0-10% roll bonus
                        var rollMultiplier = Math.floor(Math.random() * 11);
                        var rollMultiplierSign = Math.random() < 0.5 ? -1 : 1; // If negative or positive
                        var rollPower = weapon.weaponTotalPower * player.power + weapon.weaponBonusPower;
                        var rollHero = (rollPower + (rollPower * rollMultiplier * rollMultiplierSign / 100)) * (1 + traitBonus);
    
                        // Enemy Roll
                        var rollEnemyMultiplier = Math.floor(Math.random() * 11);
                        var rollEnemyMultiplierSign = Math.random() < 0.5 ? -1 : 1; // If negative or positive
                        var rollEnemy = encounter.power + (encounter.power * rollEnemyMultiplier * rollEnemyMultiplierSign / 100);
    
                        if (rollHero >= rollEnemy) wins++;
                    }
    
                    // Win Rate Colors:
                    var winRateColor = "green";
                    if (wins >= 85) winRateColor = "green";
                    else if (wins < 65) winRateColor = "red";
                    else winRateColor = "orange";
    
                    var victoryProbabilityMessageElement = encounterContainers[i].getElementsByClassName("victory-chance")[0];
                    var winRateElement = victoryProbabilityMessageElement.getElementsByClassName("win-rate");
                    if (winRateElement && winRateElement.length > 0) {
                        winRateElement[0].outerHTML = `<span class="win-rate" style="color: ${winRateColor}">(${wins}%)<span`;
                    } else {
                        victoryProbabilityMessageElement.innerHTML = victoryProbabilityMessageElement.innerHTML + ` <span class="win-rate" style="color: ${winRateColor}">(${wins}%)<span>`
                    }
                }
            }
        }
    })
}

var removeListeners = function(){
    $(".weapon-icon-wrapper").undelegate("hover")
}

// Message Listener for Background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command == "init") {
        addListeners();
    } else {
        removeListeners();
    }
    sendResponse({result: "success"});
});

window.onload = function() {
    console.log("Crypto Blade Simulator Loaded");
    chrome.storage.sync.get("cb_enabled", function(data) {
        if (data.cb_enabled) {
            console.log("CB Enabled");
            addListeners();
        } else {
            console.log("CB Disabled");
            removeListeners();
        }
    });
}