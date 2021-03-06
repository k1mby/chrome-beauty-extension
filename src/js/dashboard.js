document.addEventListener('DOMContentLoaded', function() {

    let urlsAreSet = false;

    let options = [
        {link: document.getElementById("mua"), toggle: document.getElementById("muaCheck")},
        {link: document.getElementById("cosdna"), toggle: document.getElementById("cosdnaCheck")},
        {link: document.getElementById("sephora"), toggle: document.getElementById("sephoraCheck")},
        {link: document.getElementById("beautypedia"), toggle: document.getElementById("beautypediaCheck")},
        {link: document.getElementById("skincarisma"), toggle: document.getElementById("skincarismaCheck")}
    ]

    // Cross out disabled toggles
    chrome.windows.getCurrent(function(window) {
        let sliders = document.getElementsByClassName("slider");
        if (window.state === "fullscreen") {
            for(let i = 0; i < sliders.length; i++) {
                sliders[i].classList.add("toggle-disabled");
             };
        } else {
            for(let i = 0; i < sliders.length; i++) {
                sliders[i].classList.remove("toggle-disabled");
             };
        }
    });

    // Link event handlers
    for (let i = 0; i < options.length; i++) {
        // Enable/Disable toggle switches
        let toggle = options[i].toggle;
        chrome.windows.getCurrent(function(window) {
            if (window.state === "fullscreen") {
                toggle.disabled = true;
            } else {
                toggle.disabled = false;
            }
        });

        // Open tab/popup
        let link = options[i].link;
        link.addEventListener("click", function() {
            if (urlsAreSet) {
                if (toggle && toggle.checked) {

                    let left = Math.floor(screen.width/2) - 400;
                    let top = Math.floor(screen.height/2) - 250; 

                    chrome.windows.create({
                        url: link.href,
                        type: "popup", 
                        height: 500, 
                        width: 800,
                        state: 'normal',
                        left: left,
                        top: top,
                        focused: false
                      });
                } else {
                    chrome.tabs.create({url: link.href, active: false});
                }
            }
        });
    }
    
    let textInput = document.getElementById("productText");

    // Paste text from storage
    chrome.storage.sync.get({product : ""}, function(data) {
        if (data.product != "") {
            textInput.value = data.product;
            urlsAreSet = setURLs(options, data.product);
        }
    });

    // Set URLs on ENTER
    textInput.addEventListener("keydown", function(e) {
        if (e.key === 'Enter') {  
            let text = textInput.value; 
            chrome.storage.sync.set({product: text});
            
            urlsAreSet = setURLs(options, text);
        }
    });

    // Clear on change
    textInput.addEventListener("input", function() {
        urlsAreSet = removeURLs(options);
    });

    // Switch to ingredients view
    let ingredients = document.getElementById("ingredients");
    ingredients.addEventListener("click", function(){
        let url = chrome.extension.getURL('src/html/ingredients.html');
        window.location.href = url;
    });
    
    // Toggle tooltips
    let help = document.getElementById("help");
    help.addEventListener("click", function(){
        let helpTips = document.getElementsByClassName("help-guide");

        for (let elem of helpTips) {
            if (!elem.style.display || elem.style.display === "none") {
                elem.style.display = "block";
            } else {
                elem.style.display = "none";
            }
        }
    });

});

/**
 * Assigns the hrefs to the links 
 * 
 * @param {Object[]} options 
 * @param {string} text 
 * 
 * @return {boolean} Whether or not the hrefs are set
 */
function setURLs (options, text) {
    for (let i = 0; i < options.length; i++) {
        
        let link = options[i].link;
        
        switch (link.id) {
            case "sephora":
                link.href = "https://www.sephora.com/search?keyword=" + encodeURIComponent(text);
                break;
            case "mua":
                link.href = "https://www.makeupalley.com/product/searching?Brand=0&BrandName=&q=" + encodeURIComponent(text);
                break;
            case "cosdna":
                link.href = "http://www.cosdna.com/eng/product.php?q=" + encodeURIComponent(text);
                break;
            case "beautypedia":
                link.href = "https://www.beautypedia.com/?s=" + encodeURIComponent(text);
                break;
            case "skincarisma":
                link.href = "https://www.skincarisma.com/search?utf8=%E2%9C%93&q=" + encodeURIComponent(text);
                break;
            default:
                return false;
        }

        // Highlight pink for ready
        link.style.color = "#FF1372";
    }
    return true;
}


/**
 * Removes hrefs from the links
 * 
 * @param {Object[]} options 
 * 
 * @return {boolean} Whether or not the links are set
 */
function removeURLs(options) {
    for (let i = 0; i < options.length; i++) {
        let link = options[i].link;
        link.removeAttribute("href");
        link.style.color = "#5E5E5E";
    }
    return false;
}



