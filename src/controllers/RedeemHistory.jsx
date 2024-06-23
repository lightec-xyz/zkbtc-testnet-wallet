import './RedeemHistory.scss'
import {useEffect, useState} from "react";
import {convertToCenterEplis, getStorageItem} from "../utils/utils";
import {message, Spin} from "antd";
import copy_addr from "../assets/copy_addr.png"
import chrome from "../assets/liulanqi1-mianxing.png"
import bitcoin_icon from "../assets/bitcoin-btc-logo.png"
import eth_icon from "../assets/ETH-2.png"
import exchange from "../assets/exchange.png"
import back_icon from "../assets/fanhui.png";
import {useNavigate} from "react-router-dom";
import {getRedeemHistory} from "../utils/blockcypher.jsx";
import nodata_icon from "../assets/no_data.png";
import done_icon from "../assets/daozhang.png"

export function RedeemHistory(){
    const navigate = useNavigate();

    let [ethAddr,setEthAddr] = useState('')
    let [transactions,setTransactions] = useState([])
    let [loading,setLoading] = useState(0)
    let uncompleteMap = location.state || {}
    useEffect(() => {
        setLoading(1)
        getStorageItem('ETH_ADDR').then(ethAddr=>{
            setEthAddr(ethAddr)
            getRedeemHistory(ethAddr).then(list=>{
                list.map((item,index)=>{
                    if(item.proof.status == 0){
                        item['progress'] = 0
                    }else if(item.proof.status == 1){
                        item['progress'] = 1
                    }else if(item.proof.status == 2 || item.proof.status == 3){
                        item['progress'] = 2
                    }else if(item.proof.status == 4){
                        item['progress'] = 3
                    }else if(item.proof.status == 5){
                        item['progress'] = -1
                    }
                    item["confirmed"] = uncompleteMap[item.hash] || true
                })
                setTransactions(list)
                setLoading(0)
            })
        }).catch(e=>{
            setLoading(0)
        })

    }, []);

    const clickBack = ()=>{
        navigate('/Deposit')
    }

    function widthForDoneProgress(item){
        console.log('request item',item.progress)
        if(item.progress == 0){
            return 45
        }else if(item.progress == 1){
            return 120
        }else if(item.progress == 2){
            return 240
        }else if(item.progress > 2){
            return 300
        }else{
            return 0
        }
    }

    const clickCopy = (hash)=>{
        const textArea = document.createElement("textarea");
        textArea.value = hash;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        message.success('copied')
    }

    const clickOpen = (item)=>{
        window.open(`https://holesky.etherscan.io/tx/${item.hash}`,'_blank')
    }

    const clickOpenBitcoin = (item)=>{
        window.open(`https://blockstream.info/testnet/tx/${item.destChain.hash.slice(2)}`,'_blank')
    }

    return (
        <Spin size='large' spinning={loading}>
            <div className="redeem-his">
                <div className='header-con'>
                    <img className='back-icon' src={back_icon} onClick={clickBack}/>
                    <span className='title'>Redeem history</span>
                    <div/>
                </div>
                {
                    transactions.length > 0 && <div className="list-con">
                        {
                            transactions.map((item,index)=>(
                                <div className="tx-item" key={index}>
                                    <div className="avatar-con">
                                        <div className="avatar-item">
                                            <img className="icon" src={eth_icon}/>
                                            <div className="tx-info">
                                                <div className="tx-col">
                                                    <a className="txid hover-brighten-mini" target='_blank' href={`https://holesky.etherscan.io/tx/${item.hash}`}>{convertToCenterEplis(item.hash,6)}</a>
                                                    <span className="chain">Holesky Testnet</span>
                                                </div>
                                                <div className="amount-con">
                                                    <span className="amount"> - {Math.round(item.amount/0.992)/(10**8)}</span>
                                                    <span className="tip">zkBTC</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ctrl-con">
                                            <img className="copy hover-brighten" src={copy_addr} onClick={()=>{clickCopy(item.hash)}}/>
                                            <img className="chrome hover-brighten" src={chrome} onClick={()=>{clickOpen(item)}}/>
                                        </div>
                                    </div>
                                    <div className="center-con">
                                        {item.progress > 2 ? <img className="icon" src={exchange}/> : <div className="icon"/> }
                                        <div className="progress-col">
                                            <div className="line-con">
                                                <span className="line-d" style={{width:`${widthForDoneProgress(item)+'px'}`}}/>
                                                <span className="line-u" style={{width:`${300-widthForDoneProgress(item)+'px'}`}}/>
                                            </div>
                                            <div className="progress-con">
                                                <div className="progress-item">
                                                    {
                                                        item.progress > 0 ? <div className="circle-d"/> : <div className="circle-u"/>
                                                    }
                                                    {
                                                        item.progress > 0 ? <span className="text" style={{color:'#88F30D'}}>confirmed</span> : <span className="text" style={{color:'#9a9a9a'}}>pending confirmation</span>
                                                    }
                                                </div>
                                                <div className="progress-item">
                                                    {
                                                        item.progress > 1 ? <div className="circle-d"/> : <div className="circle-u"/>
                                                    }
                                                    {
                                                        item.progress > 1 ? <span className="text" style={{color:'#88F30D'}}>proof generated</span> : <span className="text" style={{color:'#9a9a9a'}}>generating proof</span>
                                                    }
                                                </div>
                                                <div className="progress-item">
                                                    {
                                                        item.progress <= 2 ? <div className="circle-u"/> : <div className="circle-d"/>
                                                    }
                                                    {
                                                        item.progress <= 2 ? <span className="text" style={{color:'#9a9a9a'}}>broadcast btc tx</span> : <span className="text" style={{color:'#88F30D'}}>broadcasted</span>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        item.progress > 2 && <div className="bottom-con">
                                            <div className="avatar-item">
                                                <img className="icon" src={bitcoin_icon}/>
                                                <div className="tx-info">
                                                    <div className="tx-col">
                                                        <a className="txid hover-brighten-mini" target='_blank' href={`https://blockstream.info/testnet/tx/${item.destChain.hash.slice(2)}`}>{convertToCenterEplis(item.destChain.hash,6)}</a>
                                                        <span className="chain">Bitcoin Testnet</span>
                                                    </div>
                                                    <div className="amount-con">
                                                        <span className="amount"> + {item.amount/(10**8)}</span>
                                                        <span className="tip">tBTC</span>
                                                        {
                                                            item.confirmed == false && <span className="unconfirm">(Unconfirmed)</span>
                                                        }
                                                        {
                                                            item.confirmed == true && <img src={done_icon} className="done"/>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ctrl-con">
                                                <img className="copy hover-brighten" src={copy_addr} onClick={()=>{clickCopy(item.txid)}}/>
                                                <img className="chrome hover-brighten" src={chrome} onClick={()=>{clickOpenBitcoin(item)}}/>
                                            </div>
                                        </div>
                                    }
                                </div>
                            ))
                        }
                    </div>
                }
                {
                    transactions.length == 0 && <div className='no-data'>
                        <img src={nodata_icon} className='nodata-icon'/>
                        <span className="nodata-lab">No records</span>
                    </div>
                }
            </div>
        </Spin>
    )
}
