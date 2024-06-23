// 导出模块到全局变量 window
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'zkBTC') {
        sendResponse(`zkBTC余额=>`,request)
        window.postMessage(request)
    }
    if (request.type === 'tBTC') {
        sendResponse(`tBTC余额=>`,request)
        window.postMessage(request)
    }
    if (request.type === 'connected') {
        console.log('content received connected',request)
        window.postMessage(request)
        sendResponse(`连接成功=>`+request)
    }
    if (request.type === 'signed') {
        console.log('signed message',request)
        window.postMessage(request)
        sendResponse(`签名成功=>`+request)
    }
    if (request.type === 'proof_submitted') {
        console.log('proof submitted',request)
        window.postMessage(request)
        sendResponse(`证明提交成功=>`+request)
    }
    if (request.type === 'switch_wallet') {
        console.log('switch wallet',request)
        window.postMessage(request)
        sendResponse(`switch wallet=>`+request)
    }
    if (request.type === 'switch_wallet') {
        console.log('switch wallet',request)
        window.postMessage(request)
        sendResponse(`switch wallet=>`+request)
    }

    if (request.type === 'zkbtc_wallet_installed_done') {
        console.log('zkbtc_wallet_installed_done',request)
        window.postMessage(request)
        sendResponse(`zkbtc_wallet_installed_done=>`+request)
    }
});

window.addEventListener('message', function(event) {
    if (event.source === window && event.data.type == 'deposit') {
        let deposit_info = event.data.deposit_info
        chrome.runtime.sendMessage({type:'deposit',deposit_info:deposit_info})
    }

    if (event.source === window && event.data.type == 'redeem') {
        let redeem_info = event.data.redeem_info
        chrome.runtime.sendMessage({type:'redeem',redeem_info:redeem_info})
    }

    if (event.source === window && event.data.type == 'connect') {
        chrome.runtime.sendMessage({type:'connect',connect_info:event.data.connect_info})
    }

    if (event.source === window && event.data.type == 'submit_proof') {
        chrome.runtime.sendMessage({type:'submit_proof',connect_info:event.data.submit_info})
    }

    if(event.source === window && event.data.type == 'check_zkbtc_wallet_installed'){
        window.postMessage({check_zkbtc_wallet_installed:true})
    }
});

setInterval(()=>{
    // window.postMessage({
    //     type:'zkbtc_wallet_installed_done'
    // })
    chrome.runtime.sendMessage({type:'active'})
},2000)

console.log('inject lightec done')
