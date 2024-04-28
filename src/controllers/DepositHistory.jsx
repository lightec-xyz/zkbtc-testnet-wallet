import './DepositHistory.scss'
import back_icon from '../assets/fanhui.png'
import deposit_icon from '../assets/chuankuayue.png'
import browser_icon from '../assets/liulanqi1-mianxing.png'
import send_icon from '../assets/feijiqifei.png'
import receive_icon from '../assets/jiangla.png'
import copy_icon from '../assets/copy_addr.png'
import nodata_icon from '../assets/no_data.png'
import done from '../assets/success.png'

import {useEffect, useState} from "react";
import {
    getBitcoinAddressTransactions,
    getHistoryProofStatus,
    getSystmeAccountTransactions,
    getUtxoIsSubmitted
} from "../utils/blockcypher.jsx";
import {useNavigate} from "react-router-dom";
import {convertToCenterEplis, getStorageItem} from "../utils/utils.jsx";
import {SYS_BITCOIN_ADDRESS} from "../utils/contracts/abi.jsx";
import {message, Spin} from "antd";
import submitProof from "./SubmitProof.jsx";

function DepositHistory(){
    let navigate = useNavigate()
    const DEPOSIT_ADDRESS = SYS_BITCOIN_ADDRESS
    let [bitcoinAddr,setBitcoinAddr] = useState('')
    let [historys,setHistorys] = useState([])
    let [parserlts,setParserlts] = useState([])
    let [loading,setLoading] = useState(0)
    let [proofStatus,setProofStatus] = useState({})
    useEffect(    ()=>{
        async function fetchData(){
            setLoading(1)
            bitcoinAddr = await getStorageItem('BTC_ADDR')
            let txs = await getBitcoinAddressTransactions()
            console.log('get transactions deposit=>',txs)
            setHistorys(txs)

            let parse = []
            let txIds = []
            txs.map((item,index)=>{
                parse[index] = parseInfo(item)
                if(parse[index].type == 2){
                    txIds.push('0x'+parse[index].txHash)
                }
            })
            setParserlts(parse)

            let statusMap = await getHistoryProofStatus(txIds)
            setProofStatus(statusMap)

            let submitTxids = []
            txIds.map((tx,index)=>{
                if(statusMap[tx.slice(2)] == 2){
                    submitTxids.push(tx)
                }
            })

            submitTxids.map((subtx,index)=>{
                getUtxoIsSubmitted(subtx,flag=>{
                    var update = false
                    let newList = parse.map(item=>{
                        if(item.txHash == subtx.slice(2)){
                            item["submit_status"] = flag
                            update = true
                        }
                        return item
                    })
                    if(update){
                        setParserlts(newList)
                        console.log('列表数据',newList)
                    }
                })
            })

            setLoading(0)
        }
        fetchData()
        return ()=>{
            console.log('history unamounted')
        }
    },[])

    function clickBack(){
        navigate('/Deposit')
    }

    function clickSubmit(item){
        navigate('/SubmitProof',{state:item})
    }

    const parseInfo = (item)=>{
        let parseResults = {type:0,amount:0,txHash:''}
        let inputs = item.vin || []
        let outputs = item.vout || []
        parseResults.txHash = item.txid

        let sendAmount = 0
        let receiveAmount = 0
        let depositAmount = 0
        let receiveAccount = null
        inputs.forEach((ipt)=>{
            if(ipt.prevout.scriptpubkey_address == bitcoinAddr){
                sendAmount += ipt.value
            }
        })

        outputs.forEach((opt)=>{
            console.log('opt addresses',opt.addresses)
            if(opt.scriptpubkey_address == bitcoinAddr){
                receiveAmount += opt.value
            }
            if(opt.scriptpubkey_address == DEPOSIT_ADDRESS){
                depositAmount += opt.value
                console.log('find deposit',opt)
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
        }
        if(depositAmount > 0 && receiveAccount != null){
            parseResults.type = 2
            parseResults.receive_address = receiveAccount
            parseResults.amount = depositAmount
        }
        parseResults.submit_status = false
        console.log('parse =>',parseResults)
        return parseResults
    }

    function clickCopy(hash){
        var copyAddress = '0x'+hash
        const textArea = document.createElement("textarea");
        textArea.value = copyAddress;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        message.success('copied')
    }

    function openInBrowser(txHash){
        let url = `https://blockstream.info/testnet/tx/${txHash}`
        chrome.tabs.create({
            url:url
        })
    }

    return (
        <Spin size='large' spinning={loading}>
            <div className='deposit-his-main'>
                <div className='header-con'>
                    <img className='back-icon' src={back_icon} onClick={clickBack}/>
                    <span className='title'>Deposit history</span>
                    <div/>
                </div>
                {
                    parserlts.length > 0 && <div className='list-con'>
                        {
                            parserlts.map((item,index)=>(
                                    <div className='history-item' key={index}>
                                        {
                                            item.type == 0 && <div className='top'>
                                                <div className='left'>
                                                    <img src={send_icon} className='icon'/>
                                                    <div className='info-cen'>
                                                        <span className='type-lab'>Send</span>
                                                        <div className='txhash-con'>
                                                            <span className='txhash'>{'0x'+convertToCenterEplis(item.txHash,6)}</span>
                                                            <img className='copy-btn hover-brighten-large' src={copy_icon} onClick={()=>{clickCopy(item.txHash)}}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <img className='browser-icon hover-brighten-large' src={browser_icon} onClick={()=>{openInBrowser(item.txHash)}}/>
                                            </div>
                                        }
                                        {
                                            item.type == 1 && <div className='top'>
                                                <div className='left'>
                                                    <img src={receive_icon} className='icon'/>
                                                    <div className='info-cen'>
                                                        <span className='type-lab'>Receive</span>
                                                        <div className='txhash-con'>
                                                            <span className='txhash'>{'0x'+convertToCenterEplis(item.txHash,6)}</span>
                                                            <img className='copy-btn hover-brighten-large' src={copy_icon} onClick={()=>{clickCopy(item.txHash)}}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <img className='browser-icon hover-brighten-large' src={browser_icon} onClick={()=>{openInBrowser(item.txHash)}}/>
                                            </div>
                                        }
                                        {
                                            item.type == 2 && <div className='top'>
                                                <div className='left'>
                                                    <img src={deposit_icon} className='icon'/>
                                                    <div className='info-cen'>
                                                        <a className='type-lab'>Deposit</a>
                                                        <div className='txhash-con'>
                                                            <span className='txhash'>{'0x'+convertToCenterEplis(item.txHash,6)}</span>
                                                            <img className='copy-btn hover-brighten-large' src={copy_icon} onClick={()=>{clickCopy(item.txHash)}}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <img className='browser-icon hover-brighten-large' src={browser_icon} onClick={()=>{openInBrowser(item.txHash)}}/>
                                            </div>
                                        }
                                        <div className='bottom-con'>
                                            <div className='value-con'>
                                                {
                                                    item.type == 1 ? <span className='value-lab'>+ {item.amount/(10**8)}</span> :
                                                        <span className='value-lab-out'>- {item.amount/(10**8)}</span>
                                                }
                                                <span className='unit-lab'>tBTC</span>
                                            </div>
                                            {
                                                item.type == 2 && proofStatus[item.txHash] == 2 && item.submit_status == false && <div className='submit-btn hover-brighten' onClick={()=>{clickSubmit(item)}}>Submit</div>
                                            }
                                            {
                                                item.type == 2 && proofStatus[item.txHash] == 2 && item.submit_status == true && <img className='done-btn hover-brighten' src={done}/>
                                            }
                                            {
                                                item.type == 2 && proofStatus[item.txHash] != 2 && <div className='wait-btn hover-brighten'>Pending</div>
                                            }
                                        </div>
                                    </div>
                                )
                            )
                        }
                    </div>
                }
                {
                    parserlts.length == 0 && <div className='no-data'>
                        <img src={nodata_icon} className='nodata-icon'/>
                        <span className="nodata-lab">No records</span>
                    </div>
                }
            </div>
        </Spin>
    )
}

export default DepositHistory
