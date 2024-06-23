import axios from 'axios'
import {ethers} from "ethers";
import {
    ZKBTC_ADDRESS,
    zkBTCAbi,
    zkBTCBridgeAbi,
    ZKBTC_BRIDGE_ADDRESS,
    SYS_BITCOIN_ADDRESS,
    HOLESKY_NODE, PROOF_HOST, UTXO_ADDRESS, UTXOAbi, NODE_USERNAME, NODE_PASSWORD, NODE_RPC
} from "./contracts/abi.jsx";
import {getPrivateKey} from "./create.jsx";
import {address, Psbt, script} from "bitcoinjs-lib";
import ecc from '@bitcoinerlab/secp256k1';
import {BIP32Factory} from "bip32";
import {testnet} from "bitcoinjs-lib/src/networks";
import {Buffer} from 'safe-buffer';
import {getStorageItem, parseBitcoinTx, saveStorageItem} from "./utils.jsx";
import error from "eslint-plugin-react/lib/util/error.js";
import {message} from "antd";
const bip32 = BIP32Factory(ecc)

const BLOCK_CYPHER_TOKEN = '46ef69aa6c2349bc9a38fb5b6ae6080c'

const NODE_CONFIG = {
    auth: {
        username: NODE_USERNAME,
        password: NODE_PASSWORD
    },
    headers: {
        'Content-Type': 'text/plain'
    }
};

export function getBitcoinTestnetBalance(callback){
    getStorageItem('BTC_ADDR').then(btcAddr=>{
        getBalance(btcAddr).then(bal=>{
            callback(bal)
        })
    })
}

export async function getZkbtcHoleskyBalance(callback){
    getStorageItem('ETH_ADDR').then(async ethAddr=>{
        // 3. 使用 ethers.js 提供的 provider 获取地址的余额
        const provider = new ethers.JsonRpcProvider(HOLESKY_NODE);

        // 创建代币合约实例
        const tokenContract = new ethers.Contract(ZKBTC_ADDRESS, zkBTCAbi, provider);
        const balance = await tokenContract.balanceOf(ethAddr);

        // 4. 将余额转换为以太单位（wei 到 ether）
        const etherBalance = ethers.formatEther(balance)*(10**10);
        callback(etherBalance)
    })
}

export async function getHoleskyEthBalance(callback){
    getStorageItem('ETH_ADDR').then(async ethAddr=>{
        // 3. 使用 ethers.js 提供的 provider 获取地址的余额
        const provider = new ethers.JsonRpcProvider(HOLESKY_NODE);
        const balance = await provider.getBalance(ethAddr);

        // 4. 将余额转换为以太单位（wei 到 ether）
        const etherBalance = ethers.formatEther(balance);
        callback(etherBalance)
    })
}

export async function getEstimateWeight(amount){
    return new Promise( async (resolve, reject)=>{
        try{
            const provider = new ethers.JsonRpcProvider(HOLESKY_NODE);
            // 创建代币合约实例
            const bridgeContract = new ethers.Contract(ZKBTC_BRIDGE_ADDRESS, zkBTCBridgeAbi, provider);
            const weight = await bridgeContract.estimateTxWeight(amount);
            resolve(weight)
        }catch (e) {
            reject(e)
        }
    })
}

export async function redeem(amount,bitcoinAddress,estimateGasUsed,success,failed){
    try{
        let privateKey = await getPrivateKey()
        const wallet = new ethers.Wallet(privateKey)
        const provider = new ethers.JsonRpcProvider(HOLESKY_NODE);

        // 连接钱包到提供者
        const connectedWallet = wallet.connect(provider);

        // 创建代币合约实例
        const bridgeContract = new ethers.Contract(ZKBTC_BRIDGE_ADDRESS, zkBTCBridgeAbi, connectedWallet);

        // 将 P2WPKH 测试网地址解码为 witness 程序
        const { version, data } = address.fromBech32(bitcoinAddress);

        const lockingScript = script.compile([version,data])
        console.log('witness script => ',lockingScript.toString('hex'))

        // let weight = await getEstimateWeight(amount*(10**8))
        // console.log('weight=>',weight)
        let gasPrice = await getBtcTestnetGasprice()
        console.log('estimateGasUsed',estimateGasUsed)
        await bridgeContract.redeem(Math.round(amount*(10**8)),251*gasPrice,'0x'+lockingScript.toString('hex'),{
            gasLimit:estimateGasUsed*ethers.toBigInt(2)
        })
        // await tx.wait() //等待交易上链
        success()
    }catch (error){
        console.log('redeem error',error)
        if (ethers.isCallException(error)) {
            const errorData = error.error.data;
            const iface = new ethers.Interface(zkBTCBridgeAbi);
            const parsedError = iface.parseError(errorData);
            if (parsedError.name === "InsufficientBalance") {
                const [balance, needed] = parsedError.args;
                message.open({
                    type:'error',
                    content:`Insufficient balance. Available: ${balance}, Required: ${needed}`
                })
            }
        } else if(error.code == 'INSUFFICIENT_FUNDS'){
            failed(`Insufficient tETH to pay gas fee`)
        }
    }
}

export async function submitDepositProof(txid,proofData,estimateGasUsed,callback,failed){
    try{
        let txRaw = await getBTCTransactionRaw(txid.slice(2))
        console.log('get txRaw=>',txRaw)

        let privateKey = await getPrivateKey()
        const wallet = new ethers.Wallet(privateKey)
        const provider = new ethers.JsonRpcProvider(HOLESKY_NODE);

        // 连接钱包到提供者
        const connectedWallet = wallet.connect(provider);

        // 创建代币合约实例
        const bridgeContract = new ethers.Contract(ZKBTC_BRIDGE_ADDRESS, zkBTCBridgeAbi, connectedWallet);
        const txRawNew = await bridgeContract.removeWitness('0x'+txRaw);
        console.log('remove witness=>',txRawNew)

        await bridgeContract.deposit(txRawNew,proofData,{
            gasLimit:estimateGasUsed*ethers.toBigInt(2)
        });
        callback(true)
    }catch (error){
        console.log('submit failed',error.code,error.reason,error)
        if (ethers.isCallException(error)) {
            const errorData = error.error.data;
            const iface = new ethers.Interface(zkBTCBridgeAbi);
            const parsedError = iface.parseError(errorData);
            console.log('parsed error=>',parsedError)
            if (parsedError.name === "UTXOIsExisted") {
                failed(`The same txid existed`)
            }else if(parsedError.name === "InvalidDepositAmount"){
                failed(`The minimum deposit amount is 1000 satoshi`)
            }
        }else if(error.code == 'INSUFFICIENT_FUNDS'){
            failed(`Insufficient tETH to pay gas fee`)
        }
    }
}

export function isBitcoinAddress(bitcoinAddress){
    try {
        // 将 P2WPKH 测试网地址解码为 witness 程序
        const { version, data } = address.fromBech32(bitcoinAddress);

        const lockingScript = script.compile([version,data])
        console.log('witness script => ',lockingScript)
        return true
    }catch (e) {
        console.log('check bitcoin address error',e)
        return false
    }
}

export async function deposit(amount,ethAddress,success,faild){
    try {
        let bitcoinAddress = await getStorageItem('BTC_ADDR')
        let privateKey = await getPrivateKey()

        // OP_RETURN add eth receive address
        let op_return = ethAddress.slice(2)

        var utxos = await getUtxos(bitcoinAddress);
        if(utxos != undefined && utxos.length > 0){
            utxos = utxos.filter(el=>{
                if(el.spendable){
                    return true
                }
                return false
            })
        }

        // get price per Bytes
        let gasPrice = await getBtcTestnetGasprice();

        const psbt = new Psbt({ network: testnet });

        // 根据Deposit amount构建input
        let totalCoastAmount = Math.round(amount*(10**8))+251*gasPrice // Deposit amount + estimate miner fee
        console.log('deposit amount',Math.round(amount*(10**8)),amount)

        let appendAmount = 0
        let outputScript = address.toOutputScript(bitcoinAddress,testnet)

        var nInput = 0
        var nOutput = 3

        for (var i=0;i<utxos.length;i++){
            if(appendAmount < totalCoastAmount){
                let prevOutput = {
                    script:outputScript,
                    value:Math.round(utxos[i].amount*(10**8))
                }
                let inputData = {
                    hash: utxos[i].txid,
                    index: utxos[i].vout,
                    witnessUtxo:prevOutput
                }

                psbt.addInput(inputData);
                nInput += 1;
                let estimateSize = estimateP2WPKHTransactionSize(nInput,nOutput)
                totalCoastAmount = estimateSize*gasPrice + Math.round(amount*(10**8))
                appendAmount += Math.round(utxos[i].amount*(10**8))
            }else{
                break
            }
        }

        if(appendAmount < totalCoastAmount){
            throw new Error('Available balance insufficient')
        }

        // 添加输出
        psbt.addOutput({
            address: SYS_BITCOIN_ADDRESS,
            value: Math.round(amount*(10**8)),  // 交易金额，以 satoshi 为单位
        });

        psbt.addOutput({
            script: Buffer.from(`6a14${op_return}`,'hex'), // OP_RETURN 输出
            value: 0,
        });

        if(appendAmount > totalCoastAmount){
            // 添加输出
            psbt.addOutput({
                address: bitcoinAddress,
                value: appendAmount-totalCoastAmount // 交易金额，以 satoshi 为单位
            });
        }

        let chainCode = await getStorageItem('CHAIN_CODE')
        // 构建交易数据
        const keyPair = bip32.fromPrivateKey(Buffer.from(privateKey.slice(2),'hex'),Buffer.from(chainCode,'hex'),testnet);

        // 签名输入
        psbt.signAllInputs(keyPair)

        // 构建原始 PSBT 数据
        const rawPsbt = psbt.finalizeAllInputs().extractTransaction().toHex();

        console.log('rawPsbt raw=>',rawPsbt)
        await broadcastTransactionRaw(rawPsbt)

        success()
    }catch (e) {
        faild(e)
    }
}

export async function estimateGasFee(amount,bitcoinAddress,callback){
    // get price per Bytes
    let gasPrice = await getBtcTestnetGasprice();

    // get utxos
    var utxos = await getUtxos(bitcoinAddress);
    if(utxos != undefined && utxos.length > 0){
        utxos = utxos.filter(el=>{
            if(el.spendable){
                return true
            }
            return false
        })
    }
    console.log('utxos',utxos)

    var nInput = 0
    var nOutput = 3

    // 根据Deposit amount构建input
    let totalCoastAmount = Math.round(amount*(10**8))+251*gasPrice // Deposit amount + estimate miner fee

    let appendAmount = 0

    for (var i=0;i<utxos.length;i++){
        if(appendAmount < totalCoastAmount){
            nInput += 1;
            let estimateSize = estimateP2WPKHTransactionSize(nInput,nOutput)
            totalCoastAmount = estimateSize*gasPrice + Math.round(amount*(10**8))
            appendAmount += utxos[i].amount*(10**8)
        }else{
            break
        }
    }

    let estimate = estimateP2WPKHTransactionSize(nInput,nOutput)
    let minerFee = estimate*gasPrice
    callback(minerFee)
}

async function broadcastTransactionRaw(txRaw){
    const data = {
        jsonrpc: "1.0",
        id: "curltext",
        method: "sendrawtransaction",
        params: [txRaw] // 以2个区块为目标的确认时间
    };

    return new Promise((resolve, reject) => {
        axios.post(NODE_RPC, data, NODE_CONFIG)
            .then(response => {
                resolve(response.data.result)
            })
            .catch(error => {
                console.log('广播错误=>',error)
                reject('broadcast transaction failed')
            });
    })
}

export async function getBitcoinAddressTransactions(){
    let bitcoinAddress = await getStorageItem('BTC_ADDR')
    let txs = await axios.get(`https://blockstream.info/testnet/api/address/${bitcoinAddress}/txs`)
    console.log('request txs',txs)
    return txs.data
    // const data = {
    //     jsonrpc: "1.0",
    //     id: "curltext",
    //     method: "listtransactions",
    //     params: [bitcoinAddress,50] // 以2个区块为目标的确认时间
    // };
    //
    // return new Promise((resolve, reject) => {
    //     axios.post(NODE_RPC+'/wallet/mytest', data, NODE_CONFIG)
    //         .then(response => {
    //             console.log('获取交易列表=>',response)
    //             resolve(response.data.result)
    //         })
    //         .catch(error => {
    //             console.log('获取交易列表错误=>',error)
    //             reject('fetch transaction list failed')
    //         });
    // })
}

export async function getSystmeAccountTransactions(){
    const data = {
        jsonrpc: "1.0",
        id: "curltext",
        method: "listsinceblock",
        params: [SYS_BITCOIN_ADDRESS,9999999] // 以2个区块为目标的确认时间
    };

    return new Promise((resolve, reject) => {
        axios.post(NODE_RPC+'/wallet/mytest', data, NODE_CONFIG)
            .then(response => {
                console.log('获取交易列表=>',response)
                resolve(response.data.result)
            })
            .catch(error => {
                console.log('获取交易列表错误=>',error)
                reject('fetch transaction list failed')
            });
    })
}

export async function getSingleProofData(txid,callback){
    let params = {
        jsonrpc: '2.0',
        method: 'zkbtc_proofInfo',
        params: [[txid]], // 假设我们请求用户ID为1的用户名
        id: 1,
    }
    await axios.post(PROOF_HOST, params).then(response=>{
        console.log('proof=>',response)
        callback('0x'+response.data.result[0].proof)
    }).catch(error=>{
        console.log('请求出错=>',error)
    });
}

// get max available btc balance
export function getSystemAvailableZkbtc(){
    return new Promise( async (resolve, reject)=>{
        try {
            const provider = new ethers.JsonRpcProvider(HOLESKY_NODE);
            // 创建合约实例
            const utxoContract = new ethers.Contract(UTXO_ADDRESS, UTXOAbi, provider);
            let result = await utxoContract.totalAvailableAmount()
            resolve(result.toString())
        }catch (e){
            reject(e)
        }
    })
}

export async function getUtxoIsSubmitted(txid){
    return new Promise( async (resolve, reject)=>{
        try{
            const provider = new ethers.JsonRpcProvider(HOLESKY_NODE);
            // 创建代币合约实例
            const utxoContract = new ethers.Contract(UTXO_ADDRESS, UTXOAbi, provider);
            let result = await utxoContract.utxoOf(txid)
            resolve(result[3])
        }catch (e){
            reject(e)
        }
    })
}


// export function getBtcTestnetGasprice(){
//     const data = {
//         jsonrpc: "1.0",
//         id: "curltext",
//         method: "estimatesmartfee",
//         params: [6] // 以2个区块为目标的确认时间
//     };
//
//     return new Promise((resolve, reject) => {
//         axios.post(NODE_RPC, data, NODE_CONFIG)
//             .then(response => {
//                 let feeRate = response.data.result.feerate*(10**5)
//                 console.log('gas price => ',response,feeRate)
//                 let price = Math.ceil(feeRate*1.2)
//                 console.log('gas price 1.2 => ',price)
//                 resolve(price)
//             })
//             .catch(error => {
//                 reject('fetch gas price failed')
//             });
//     })
// }
export function getBtcTestnetGasprice(){
    return new Promise(  (resolve, reject)=>{
        axios.get(`https://blockstream.info/testnet/api/fee-estimates`).then(response=>{
            console.log('response',response)
            resolve(Math.ceil(parseFloat(response.data['12'])*1.2))
        }).catch(e=>{
            reject(e)
        })
    })
}

export function getDescriptor(address){
    return new Promise((resolve, reject)=>{
        const data = {
            jsonrpc: "1.0",
            id: "curltext",
            method: "getdescriptorinfo",
            params: [`addr(${address})`] // 以2个区块为目标的确认时间
        };
        axios.post(NODE_RPC, data, NODE_CONFIG).then(res=>{
            resolve(res.data.result.descriptor)
        }).catch(e=>{
            console.log('import descriptor failed =>',e)
            reject(e)
        })
    })
}

export async function getBTCTransactionRaw(txid){
    const data = {
        jsonrpc: "1.0",
        id: "curltext",
        method: "gettransaction",
        params: [txid] // 以2个区块为目标的确认时间
    };

    return new Promise((resolve, reject) => {
        axios.post(NODE_RPC, data, NODE_CONFIG)
            .then(response => {
                let raw = response.data.result.hex
                resolve(raw)
            })
            .catch(error => {
                reject('fetch transaction raw failed')
            });
    })
}

export async function importAddressToNode(address,rescan,callback){
    var timestamp = 'now'
    if(rescan){
        timestamp = 1708358400
    }

    let descriptor = await getDescriptor(address)

    const data = {
        jsonrpc: "1.0",
        id: "curltext",
        method: "importdescriptors",
        params: [[{desc:descriptor,timestamp:timestamp,label:address}]] // 以2个区块为目标的确认时间
    };

    axios.post(NODE_RPC+'/wallet/mytest', data, NODE_CONFIG).then(res=>{
        console.log('import descriptor success =>',res,rescan)
        callback({success:true})
    }).catch(e=>{
        console.log('import descriptor failed =>',e)
        callback({success:false})
    })
}

export async function getBalance(address){
    const data = {
        jsonrpc: "1.0",
        id: "curltext",
        method: "listunspent",
        params: [1,99999999,[address],false] //获取所有已确认的余额
    };

    return new Promise((resolve, reject) => {
        axios.post(NODE_RPC, data, NODE_CONFIG)
            .then(response => {
                let lists = response.data.result
                var amount = 0
                for(var i = 0;i<lists.length; i++){
                    amount += lists[i].amount
                }
                console.log('获取余额=>',amount,lists)
                resolve(amount.toFixed(8))
            })
            .catch(error => {
                reject('fetch balance failed')
            });
    })
}

function  getUtxos(address){
    const data = {
        jsonrpc: "1.0",
        id: "curltext",
        method: "listunspent",
        params: [1,99999999,[address],false] //获取所有已确认的余额
    };

    return new Promise((resolve, reject) => {
        axios.post(NODE_RPC, data, NODE_CONFIG)
            .then(response => {
                let lists = response.data.result
                resolve(lists)
            })
            .catch(error => {
                reject('fetch utxos failed')
            });
    })
}

export function estimateP2WPKHTransactionSize(nInputs, nOutputs) {
    const nonWitnessInputSize = 41; // 基础输入大小
    const witnessDataSize = 105; // 签名（72字节） + 公钥（33字节）
    const outputSize = 31; // P2WPKH 输出大小
    const baseTransactionSize = 10; // 基础交易开销

    const nonWitnessSize = baseTransactionSize + (nonWitnessInputSize * nInputs) + (outputSize * nOutputs);
    const totalWitnessSize = witnessDataSize * nInputs;
    const totalTransactionWeight = (nonWitnessSize * 4) + totalWitnessSize;

    // let estimateSize = Math.ceil(totalTransactionWeight / 4);
    let estimateSize = nonWitnessSize + totalWitnessSize
    console.log('预估交易vsize',estimateSize)
    return estimateSize
}

export async function getHistoryProofStatus(txids){
    return new Promise( async (resolve, reject)=>{
        let params = {
            jsonrpc: '2.0',
            method: 'zkbtc_proofInfo',
            params: [txids], // 假设我们请求用户ID为1的用户名
            id: 1,
        }
        await axios.post(PROOF_HOST, params).then(response=>{
            console.log('response',response)
            let list = response.data.result
            let statusMap = {}
            if(list != null){
                for(var i=0;i<list.length;i++){
                    statusMap[list[i].txId] = list[i].status
                }
            }
            resolve(statusMap)
        }).catch(error=>{
            console.log('请求出错=>',error)
            reject(error)
        });
    })
}

export function estimateRedeemEthereumFee(amount,btcAddr){
    return new Promise( async (resolve, reject)=>{
        try{
            let privateKey = await getPrivateKey()
            const wallet = new ethers.Wallet(privateKey)
            const provider = new ethers.JsonRpcProvider(HOLESKY_NODE);

            // 连接钱包到提供者
            const connectedWallet = wallet.connect(provider);

            // 创建代币合约实例
            const bridgeContract = new ethers.Contract(ZKBTC_BRIDGE_ADDRESS, zkBTCBridgeAbi, connectedWallet);

            // 将 P2WPKH 测试网地址解码为 witness 程序
            const { version, data } = address.fromBech32(btcAddr);

            const lockingScript = script.compile([version,data])
            const gasPrice = await provider.send('eth_gasPrice', []);

            let gasEstimate = await bridgeContract.redeem.estimateGas(Math.round(amount*(10**8)),3000,lockingScript);
            console.log('获取eth gas',gasEstimate,gasPrice)
            let cost = ethers.toBigInt(gasPrice)*gasEstimate
            console.log('总gas',cost)
            resolve(resolve({
                cost:ethers.formatEther(cost),
                estimateGas:gasEstimate,
                gasPrice:ethers.toBigInt(gasPrice)
            }))
        }catch (e){
            reject(e)
        }
    })
}

export function estimateSubmmitProofGas(transactionId,proofData){
    return new Promise( async (resolve, reject)=>{
        try{
            let txRaw = await getBTCTransactionRaw(transactionId.slice(2))
            console.log('get txRaw=>',txRaw)

            let privateKey = await getPrivateKey()
            const wallet = new ethers.Wallet(privateKey)
            const provider = new ethers.JsonRpcProvider(HOLESKY_NODE);

            // 连接钱包到提供者
            const connectedWallet = wallet.connect(provider);

            // 创建代币合约实例
            const bridgeContract = new ethers.Contract(ZKBTC_BRIDGE_ADDRESS, zkBTCBridgeAbi, connectedWallet);
            const gasPrice = await provider.send('eth_gasPrice', []);

            const txRawNew = await bridgeContract.removeWitness('0x'+txRaw);
            console.log('remove witness=>',txRawNew)

            let gasEstimate = await bridgeContract.deposit.estimateGas(txRawNew,proofData);
            console.log('获取eth gas',gasEstimate,gasPrice)
            let cost = ethers.toBigInt(gasPrice)*gasEstimate*ethers.toBigInt(2)
            console.log('总gas',cost)
            resolve({
                cost:ethers.formatEther(cost),
                estimateGas:gasEstimate,
                gasPrice:ethers.toBigInt(gasPrice)
            })
        }catch (e){
            reject(e)
        }
    })
}

export async function getRedeemHistory(ethAddress){
    return new Promise( async (resolve, reject)=>{
        if(ethAddress == undefined || !ethers.isAddress(ethAddress)){
            resolve([])
        }else{
            let params = {
                jsonrpc: '2.0',
                method: 'zkbtc_txesByAddr',
                params: [ethAddress,'redeem'], // 假设我们请求用户ID为1的用户名
                id: 1,
            }
            await axios.post(PROOF_HOST, params).then(response=>{
                console.log('getRedeemHistory',response)
                let list = response.data.result
                resolve(list.reverse())
            }).catch(error=>{
                console.log('请求出错=>',error)
                reject(error)
            });
        }
    })
}

export function getBitcoinTransaction(txid){
    return new Promise((resolve, reject)=>{
        // const data = {
        //     jsonrpc: "1.0",
        //     id: "curltext",
        //     method: "gettransaction",
        //     params: [txid.slice(2)] //获取所有已确认的余额
        // };
        // axios.post(NODE_RPC+'/wallet/mytest', data, NODE_CONFIG)
        //     .then(response => {
        //         let tx = response.data.result
        //         resolve(tx)
        //     })
        //     .catch(error => {
        //         reject('gettransaction failed',error)
        //     });
        axios.get(`https://blockstream.info/testnet/api/tx/${txid.slice(2)}/status`).then(response=>{
            console.log('response',response)
            let tx = response.data
            resolve(tx)
        }).catch(error=>{
            console.log('请求出错=>',error)
            reject(error)
        });
    })
}

export async function loadUncompleteRedeemTransactions(ethAddr){
    return new Promise((resolve, reject)=>{
        getRedeemHistory(ethAddr).then(async list=>{
            let uncomplete = []
            if(ethAddr == undefined || ethAddr.length == 0 || !ethers.isAddress(ethAddr)){
                console.log('invalid eth addr',ethAddr)
                reject('invalid eth addr')
            }
            console.log("redeem history",list)
            let jsonStr = await getStorageItem('REDEEM_DONE') || "{}"
            let savedS = JSON.parse(jsonStr)
            for(var i=0;i<list.length;i++){
                if(list[i].destChain.hash == "" || list[i].destChain.hash == undefined){
                    uncomplete.push(list[i])
                }else{
                    if(savedS[list[i].hash] == true){
                        continue
                    }
                    let tx = await getBitcoinTransaction(list[i].destChain.hash)
                    console.log('tx =>',tx)
                    if(tx.confirmed){
                        savedS[list[i].hash] = true
                        continue
                    }else{
                        list[i]['confirmed'] = false
                        savedS[list[i].hash] = false
                        uncomplete.push(list[i])
                    }
                }
            }
            saveStorageItem('REDEEM_DONE',JSON.stringify(savedS))
            console.log('uncompletes count',uncomplete)
            resolve(uncomplete)
        }).catch(e=>{
            reject(e)
        })
    })
}

export async function getDepositAllUncompletes(btcAddr){
    return new Promise( async (resolve, reject)=>{
        if(btcAddr == undefined || btcAddr.length == 0){
            reject('btc invalid')
        }
        let deposits = await getBitcoinAddressTransactions(btcAddr)
        console.log('获取所有deposits',deposits)
        let uncomplete = await getUncompleteDeposit(deposits,btcAddr)
        resolve(uncomplete)
    })
}

export async function getUncompleteDeposit(deposits,btcAddr){
    let uncompleted = []
    let jsonStr = await getStorageItem('DEPOSIT_DONE') || "{}"
    let savedS = JSON.parse(jsonStr)
    for(var i=0;i<deposits.length;i++){
        let parse = parseBitcoinTx(deposits[i],btcAddr)
        if(parse.type != 2){ //非deposit交易过滤
            continue
        }
        if(deposits[i].status.confirmed == false){
            uncompleted.push(deposits[i])
        }else{
            if(savedS[deposits[i].txid] == true){
                continue
            }
            let submitted = await getUtxoIsSubmitted('0x'+deposits[i].txid)
            if(submitted == false){
                savedS[deposits[i].txid] = false
                deposits[i].progress = 1
                uncompleted.push(deposits[i])
            }else{
                savedS[deposits[i].txid] = true
            }
        }
    }
    saveStorageItem('DEPOSIT_DONE',JSON.stringify(savedS))
    return uncompleted
}
