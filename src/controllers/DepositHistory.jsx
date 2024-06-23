import './DepositHistory.scss'
import back_icon from '../assets/fanhui.png'
import deposit_icon from '../assets/deposit_icon.png'
import redeem_icon from '../assets/redeem_icon.png'
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
import {convertToCenterEplis, getStorageItem, parseBitcoinTx} from "../utils/utils.jsx";
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
    useEffect(()=>{
        async function fetchData(){
            setLoading(1)
            bitcoinAddr = await getStorageItem('BTC_ADDR')
            let txs = await getBitcoinAddressTransactions()
            console.log('get transactions deposit=>',txs)
            setHistorys(txs)

            let parse = []
            let txIds = []
            txs.map((item,index)=>{
                parse[index] = parseBitcoinTx(item,bitcoinAddr)
                if(parse[index].type == 2){
                    txIds.push('0x'+parse[index].txHash)
                }
            })
            setParserlts(parse)

            let statusMap = await getHistoryProofStatus(txIds)
            setProofStatus(statusMap)

            let submitTxids = []
            txIds.map((tx,index)=>{
                submitTxids.push(tx)
            })

            submitTxids.map((subtx,index)=>{
                getUtxoIsSubmitted(subtx).then(flag=>{
                    console.log('subtx => ',subtx,flag)
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

        let timeId = setTimeout(()=>{
            if(loading == 1){
                message.open({
                    type:'warning',
                    content:'Time out'
                })
                clickBack()
            }
        },30000)

        return ()=>{
            clearTimeout(timeId)
            console.log('history unamounted')
        }
    },[])

    function clickBack(){
        navigate('/Deposit')
    }

    function clickSubmit(item){
        navigate('/SubmitProof',{state:item})
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
                    <span className='title'>History List</span>
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
                                        {
                                            item.type == 3 && <div className='top'>
                                                <div className='left'>
                                                    <img src={redeem_icon} className='icon'/>
                                                    <div className='info-cen'>
                                                        <a className='type-lab'>Redeem</a>
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
                                                    item.type == 1 || item.type == 3 ? <span className='value-lab'>+ {item.amount/(10**8)}</span> :
                                                        <span className='value-lab-out'>- {item.amount/(10**8)}</span>
                                                }
                                                <span className='unit-lab'>tBTC</span>
                                            </div>
                                            {
                                                item.type == 2 && proofStatus[item.txHash] == 4 && item.submit_status == -1 && <Spin spinning={1} size="small"/>
                                            }
                                            {
                                                item.type == 2 && proofStatus[item.txHash] == 4 && item.submit_status == false && <div className='submit-btn hover-brighten' onClick={()=>{clickSubmit(item)}}>Submit</div>
                                            }
                                            {
                                                item.type == 2  && item.submit_status == true && <img className='done-btn hover-brighten' src={done}/>
                                            }
                                            {
                                                item.type == 2 && item.confirmed == false && proofStatus[item.txHash] != 4 && <div className='wait-btn'>Unconfirmed</div>
                                            }
                                            {
                                                item.type == 2 && item.confirmed == true && item.submit_status == false && proofStatus[item.txHash] != 4 && <div className='wait-btn'>Generating proof</div>
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
