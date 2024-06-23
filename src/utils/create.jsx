import {generateMnemonic,mnemonicToSeedSync} from 'bip39';
import {BIP32Factory} from 'bip32'
import {testnet} from "bitcoinjs-lib/src/networks";
import ecc from '@bitcoinerlab/secp256k1';

import {ethers} from 'ethers';
import {address, payments,crypto} from "bitcoinjs-lib";
import {Buffer} from 'safe-buffer';
import {getStorageItem, saveStorageItem} from "./utils.jsx";
import {hash256} from "bitcoinjs-lib/src/crypto.js";
import {keccak256} from "js-sha3";
import {message} from "antd";
import {importAddressToNode} from "./blockcypher.jsx";

const bip32 = BIP32Factory(ecc)
export function generateMnemonics(){
    let mnemonics = generateMnemonic()
    return mnemonics
}

export async function createBitcoinWallet(password,mnemonics){
    //generate mnemonics
    let seed = mnemonicToSeedSync(mnemonics)
    let root = bip32.fromSeed(seed,testnet)

    // default path
    const path = "m/0'/0'/0'";
    const child = root.derivePath(path);
    saveStorageItem('CHAIN_CODE',child.chainCode.toString('hex'))

    // p2wpkh address
    const {address} = await payments.p2wpkh({pubkey:child.publicKey,network:testnet})
    saveStorageItem('BTC_ADDR',address)

    return address
}

export function createEthreumWallet(password,mnemonics){
    let wallet = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonics),'m/0\'/0\'/0\'')
    savePrivateKey(wallet.privateKey)
    saveStorageItem('ETH_ADDR',wallet.address)
    return wallet.address
}

export function importPrivateKey(privateKey){
    let key = privateKey
    if(privateKey.startsWith('0x')){
        key = privateKey.slice(2)
    }
    //generate mnemonics
    let seed = mnemonicToSeedSync(generateMnemonic())
    let root = bip32.fromSeed(seed,testnet)
    let chainCode = root.chainCode
    let bip32Factory = bip32.fromPrivateKey(Buffer.from(key,'hex'),chainCode,testnet)
    saveStorageItem('CHAIN_CODE',chainCode.toString('hex'))

    bip32Factory.derivePath("m/0'/0'/0'")

    // p2wpkh address
    const {address} = payments.p2wpkh({pubkey:bip32Factory.publicKey,network:testnet})
    saveStorageItem('BTC_ADDR',address)
    savePrivateKey('0x'+key)

    let etherWallet = new ethers.Wallet('0x'+key)
    saveStorageItem('ETH_ADDR',etherWallet.address)
    return address
}

export async function savePrivateKey(privateKey){
    saveStorageItem('PR_KEY',privateKey)

    let keysStr = await getStorageItem('KEYS_ARR')
    let keysArr = []
    if(keysStr && keysStr.length > 0){
        keysArr = keysStr.split(" ")
    }
    keysArr.push(privateKey)
    saveStorageItem('KEYS_ARR',keysArr)
}

export async function getPrivateKey(){
    return await getStorageItem('PR_KEY')
}

export function signTest(){
    let privateKey = 'f9962336ca15bdd2acd61edfc6857fe733ef36a3c1380acf5f91c17347df93e5'
    let plaintext = 'helloword'
    let wallet = new ethers.Wallet(privateKey)
    console.log('ethereum address=>',wallet.address)

    let seed = mnemonicToSeedSync(generateMnemonic())
    let root = bip32.fromSeed(seed,testnet)
    let chainCode = root.chainCode
    let pair = bip32.fromPrivateKey(Buffer.from(privateKey,'hex'),chainCode,testnet)
    console.log('publick key=>',pair.publicKey.toString('hex'))

    let {address} = payments.p2wpkh({pubkey:pair.publicKey,network:testnet})
    console.log('bitcoin address=>',address)

    let msgHash = keccak256(Buffer.from(plaintext, 'utf8'))
    let signedMessage = pair.sign(msgHash)
    console.log('signed message',signedMessage.toString('hex'))
}

export function getAllWallets(callback){
    getStorageItem('KEYS_ARR').then(keysStr=>{
        let keys = keysStr.split(" ")
        let ethAddresses = []
        let btcAddresses = []
        let pubKeys = []
        for(let i=0;i<keys.length;i++){
            let wallet = new ethers.Wallet(keys[i])
            ethAddresses.push(wallet.address)

            let seed = mnemonicToSeedSync(generateMnemonic())
            let root = bip32.fromSeed(seed,testnet)
            let chainCode = root.chainCode
            let pair = bip32.fromPrivateKey(Buffer.from(keys[i].slice(2),'hex'),chainCode,testnet)
            pubKeys.push(pair.publicKey.toString('hex'))

            let {address} = payments.p2wpkh({pubkey:pair.publicKey,network:testnet})
            btcAddresses.push(address)
        }
        callback([btcAddresses,ethAddresses,pubKeys])
    })
}

export function switchWalletToIndex(index){
    getStorageItem('KEYS_ARR').then(keysStr=>{
        let keys = keysStr.split(" ")
        if(index < keys.length){
            saveStorageItem('PR_KEY',keys[index])
            let wallet = new ethers.Wallet(keys[index])
            saveStorageItem('ETH_ADDR',wallet.address)

            let seed = mnemonicToSeedSync(generateMnemonic())
            let root = bip32.fromSeed(seed,testnet)
            let chainCode = root.chainCode
            let bip32Factory = bip32.fromPrivateKey(Buffer.from(keys[index].slice(2),'hex'),chainCode,testnet)

            bip32Factory.derivePath("m/0'/0'/0'")

            // p2wpkh address
            const {address} = payments.p2wpkh({pubkey:bip32Factory.publicKey,network:testnet})
            saveStorageItem('BTC_ADDR',address)
        }
    })
}

export function checkWalletExistsByMnemonics(mnemonics){
    return new Promise((resolve, reject)=>{
        let wallet = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonics),'m/0\'/0\'/0\'')
        let priviteKey = wallet.privateKey
        getStorageItem('KEYS_ARR').then(keyStr=>{
            if(keyStr == undefined || keyStr.length == 0){
                resolve(false)
            }else{
                let keys = keyStr.split(" ")
                if(keys.indexOf(priviteKey) == -1){
                    resolve(false)
                }else{
                    resolve(true)
                }
            }
        }).catch(e=>{
            reject(e)
        })
    })
}

export function getPublicKeyAndSig(code){
    return new Promise( async (resolve, reject)=>{
        try{
            let prkey = await getPrivateKey()
            let privateKey = prkey.slice(2)

            let root = bip32.fromSeed(Buffer.from(privateKey,'hex'),testnet)
            const path = "m/0'/0'/0'";
            const child = root.derivePath(path);

            let keyPair = bip32.fromPrivateKey(Buffer.from(privateKey,'hex'),child.chainCode)

            let publicKey = keyPair.publicKey.toString('hex')
            let timestamp = Date.now()*(10**6)
            let salt = code

            let sigStr = `${publicKey}${salt}${timestamp}`
            console.log('sign str',sigStr)
            let msgHash = keccak256(sigStr)
            console.log('msgHash',msgHash.toString('hex'))
            let signature = keyPair.sign(Buffer.from(msgHash,'hex'))

            resolve({
                public_key:publicKey,
                code:code,
                timestamp:timestamp,
                signature:signature.toString('hex')
            })
        }catch (e) {
            reject(e)
        }
    })
}
