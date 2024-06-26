let passwordCache = undefined
let zkBTCBalance = 0
let tBTCBalance = 0
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'psd_unlock') {
        passwordCache = request.psd
        sendResponse(`解锁成功`)
    }

    if (request.action == 'fetch_password'){
        sendResponse(passwordCache)
    }

    if (request.type === 'deposit') {
        console.log('open window and receive deposit info=>',request.deposit_info)
        chrome.windows.create({
            url:'index.html?type=deposit&params='+request.deposit_info,
            type: "popup",
            focused: true,
            width: 380,
            height: 630,
            top: 80,
            left: 1000,
        })
        sendResponse('background.js received')
    }

    if(request.type === 'redeem'){
        chrome.windows.create({
            url:'index.html?type=redeem&params='+request.redeem_info,
            type: "popup",
            focused: true,
            width: 380,
            height: 640,
            top: 80,
            left: 1000,
        })
        sendResponse('redeem request background.js received')
    }

    if(request.type === 'connect'){
        chrome.windows.create({
            url:'index.html?type=connect&params='+request.connect_info,
            type: "popup",
            focused: true,
            width: 380,
            height: 620,
            top: 80,
            left: 1000,
        })
        sendResponse('redeem request background.js received')
    }

    if(request.type === 'submit_proof'){
        chrome.windows.create({
            url:'index.html?type=submit_proof&params='+request.connect_info,
            type: "popup",
            focused: true,
            width: 380,
            height: 720,
            top: 80,
            left: 1000,
        })
        sendResponse('redeem request background.js received')
    }

    if(request.type === 'zkBTC'){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
            if (currentTab) {
                chrome.tabs.sendMessage(currentTab.id,{
                    type:'zkBTC',
                    balance:request.balance
                })
            }
        });
    }

    if(request.type === 'tBTC'){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
            if (currentTab) {
                chrome.tabs.sendMessage(currentTab.id,{
                    type:'tBTC',
                    balance:request.balance
                })
            }
        });
    }

    if(request.type == 'active'){
        sendResponse('Now active')
    }
});

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        chrome.tabs.query({currentWindow: true}, function(tabs) {
            tabs.forEach(tab=>{
                chrome.tabs.sendMessage(tab.id,{
                    type:'zkbtc_wallet_installed_done',
                    balance:request.balance
                })
            })
        });
        chrome.storage.local.clear(()=>{
            console.log('clear all storage')
        })
    }
});
