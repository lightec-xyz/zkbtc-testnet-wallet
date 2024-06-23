import CryptoJS from 'crypto-js'
import {NODE_RPC, SYS_BITCOIN_ADDRESS} from "./contracts/abi.jsx";
import axios from "axios";
export function saveUnlockState(){
    let time = new Date().getTime()
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.storage.local.set({UNLOCK_TIME:time},()=>{
            console.log('save unlock state')
        })
    } else {
        localStorage.setItem('UNLOCK_TIME',time)
    }
}

export async function isUnlockExpired(){
    return new Promise((resolve, reject)=>{
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
            getUnlockPassword().then(password=>{
                if(password && password.length > 0){
                    chrome.storage.local.get(['UNLOCK_TIME'],(result)=>{
                        let time = result.UNLOCK_TIME || 0
                        let now = new Date().getTime()
                        if((now-time)/1000 > 900){
                            resolve(true)
                        }else{
                            resolve(false)
                        }
                    })
                }else{
                    resolve(true)
                }
            })

        } else {
            let time = localStorage.getItem('UNLOCK_TIME') || 0
            let now = new Date().getTime()
            if((now-time)/1000 > 900){
                resolve(true)
            }else{
                resolve(false)
            }
        }
    })
}

function deleteTempPass(){
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.storage.local.remove(['TEMP_PAS'],()=>{
            console.log('delete local')
        })
    } else {
        localStorage.removeItem('TEMP_PAS')
    }
}

export function saveUnlockPassword(password,success){
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({action:'psd_unlock',psd:password},response=>{
            success()
        })
    } else {
        localStorage.setItem('TEMP_PAS',password)
        success()
    }
}

// 用户输入解锁密码后保存验证数据
export function saveVerifyData(password){
    let verifyData = AESEncrypt('LIGHTECH_WALLET_EXTENSION_VERIFY_SUCCESS',password,6)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.storage.local.set({VERIFY_PAS:verifyData},()=>{
            console.log('save verify data')
        })
    } else {
        localStorage.setItem('VERIFY_PAS',verifyData)
    }
}

export async function checkUserInputPasswordValid(inputPassword){
    return new Promise((resolve, reject)=>{
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
            chrome.storage.local.get(['VERIFY_PAS'],(result)=>{
                if(result != undefined){
                    try {
                        let encodeVal = result.VERIFY_PAS
                        let originalText = AESDecrypt(encodeVal,inputPassword,6)
                        if(originalText == 'LIGHTECH_WALLET_EXTENSION_VERIFY_SUCCESS'){
                            resolve(originalText);
                            chrome.runtime.sendMessage({action:'psd_unlock',psd:inputPassword},response=>{
                                console.log('收到回复消息',response)
                            })
                        }else{
                            reject({
                                message:'password incorrect'
                            })
                        }
                    }catch (e) {
                        reject(e)
                    }
                }else{
                    resolve('cant get VERIFY_PAS')
                }
            })
        } else {
            let encodeVal = localStorage.getItem('VERIFY_PAS')
            let val = CryptoJS.AES.decrypt(encodeVal,inputPassword)
            if(val == 'LIGHTECH_WALLET_EXTENSION_VERIFY_SUCCESS'){
                resolve(val);
            }else{
                reject('invalid password')
            }
        }
    })
}

export function getUnlockPassword(){
    return new Promise((resolve, reject)=>{
        // if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        //     chrome.storage.local.get(['TEMP_PAS'],(result)=>{
        //         if(result.TEMP_PAS == undefined){
        //             resolve('123456')
        //         }
        //         resolve(result.TEMP_PAS);
        //     })
        // } else {
        //     let val = localStorage.getItem('TEMP_PAS')
        //     resolve(val)
        // }
        chrome.runtime.sendMessage({action:'fetch_password'},response=>{
            resolve(response)
        })
    })
}

export async function saveStorageItem(key,value){
    let tempPas = await getUnlockPassword()

    let savedStr = value
    if(Array.isArray(value)){
        savedStr = value.join(' ')
    }

    let saved = AESEncrypt(savedStr,tempPas,3)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.storage.local.set({[key]:saved},()=>{
        })
    } else {
        localStorage.setItem(key,saved)
    }
}

export function checkWalletCreated(){
    return new Promise((resolve, reject)=>{
        chrome.storage.local.get(['BTC_ADDR'],(result)=>{
            if (result.BTC_ADDR == undefined) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

export async function getStorageItem(key){
    let tempPas = await getUnlockPassword()
    return new Promise((resolve, reject)=>{
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
            chrome.storage.local.get([key],(result)=>{
                if (result[key] == undefined) {
                    resolve(undefined)
                } else {
                    let encodeVal = result[key]
                    let originalText = AESDecrypt(encodeVal,tempPas,3)
                    resolve(originalText);
                }
            })
        } else {
            let encodeVal = localStorage.getItem(key)
            if(encodeVal != undefined){
                let originalText = AESEncrypt(encodeVal,tempPas,3)
                resolve(originalText)
            }else{
                resolve(undefined)
            }
        }
    })
}

export function AESEncrypt(plainText,password,times){
    // AES加密1024次
    let encrypted = plainText;
    for (let i = 0; i < times; i++) {
        encrypted = CryptoJS.AES.encrypt(encrypted, password).toString();
    }
    return encrypted
}

export function AESDecrypt(encrypt,password,times){
    let decrypted = encrypt;
    for (let i = 0; i < times; i++) {
        const bytes = CryptoJS.AES.decrypt(decrypted, password);
        decrypted = bytes.toString(CryptoJS.enc.Utf8);
    }
    return decrypted
}

export function formatNumber(num,fixed){
    return Math.round(num*(10**fixed))/(10**fixed)
}

export function convertToCenterEplis(text,length = 8){
    if(text.length > length*2){
        let start = text.substring(0,length)
        let end = text.slice(-length)
        return start+'...'+end
    }
    return text
}

export const parseBitcoinTx = (item,bitcoinAddr)=>{
    let parseResults = {type:0,amount:0,txHash:'',confirmed:false}
    let inputs = item.vin || []
    let outputs = item.vout || []
    parseResults.txHash = item.txid
    parseResults.confirmed = item.status.confirmed

    let sendAmount = 0
    let receiveAmount = 0
    let depositAmount = 0
    let receiveAccount = null
    let findSystem = false
    inputs.forEach((ipt)=>{
        console.log('input address=>',ipt.prevout.scriptpubkey_address)
        if(ipt.prevout.scriptpubkey_address == bitcoinAddr){
            sendAmount += ipt.value
        }
        if(ipt.prevout.scriptpubkey_address == SYS_BITCOIN_ADDRESS){
            findSystem = true
        }
    })

    outputs.forEach((opt)=>{
        if(opt.scriptpubkey_address == bitcoinAddr){
            receiveAmount += opt.value
        }
        if(opt.scriptpubkey_address == SYS_BITCOIN_ADDRESS){
            depositAmount += opt.value
        }
        if(opt.scriptpubkey_type  == "op_return"){
            receiveAccount = '0x'+opt.scriptpubkey.slice(4)
            console.log('find address',opt)
        }
    })

    if(sendAmount > 0){
        parseResults.type = 0
        parseResults.amount = sendAmount
    }
    if(receiveAmount > 0){
        parseResults.type = 1
        parseResults.amount = receiveAmount
        if(findSystem){
            parseResults.type = 3
            parseResults.amount = receiveAmount
        }
    }
    if(depositAmount > 0 && receiveAccount != null){
        parseResults.type = 2
        parseResults.receive_address = receiveAccount
        parseResults.amount = depositAmount
    }
    parseResults.submit_status = -1
    console.log('parse =>',parseResults)
    return parseResults
}

export async function openFaucet(){
    let openurl = 'https://testnet.zkbtc.money/?state=3'

    let foundTab = null;
    const tabs = await chrome.tabs.query({});
    // 遍历所有标签页，检查是否已经打开了目标URL
    for (let tab of tabs) {
        if (tab.url && tab.url === openurl) {
            foundTab = tab;
            break;
        }
    }

    if(foundTab){
        // 如果标签页已打开，切换到该标签页
        await chrome.tabs.update(foundTab.id, { active: true });
        chrome.windows.update(foundTab.windowId, { focused: true });
    }else{
        chrome.tabs.create({url:openurl})
    }
}
