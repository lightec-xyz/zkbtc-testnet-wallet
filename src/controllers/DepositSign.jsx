import "./DepositSign.scss"
import Header from "./Header.jsx";
import {useEffect, useState} from "react";
import {deposit, estimateGasFee, getBitcoinTestnetBalance} from "../utils/blockcypher.jsx";
import {Spin} from "antd";
import {message} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import {convertToCenterEplis, formatNumber, getStorageItem} from "../utils/utils.jsx";
import {ethers} from "ethers";

function DepositSign(){
    const navigate = useNavigate();

    let [depositAmount,setDepositAmount] = useState(0)
    let [receiveAddress,setReceiveAddress] = useState('')
    let [submit,setSubmit] = useState(0)
    let [minerFee,setMinerFee] = useState(0)
    let [btcBalance,setBtcBalance] = useState(0)
    let [loadBalance,setLoadBanlance] = useState(0)
    let [loadFee,setLoadFee] = useState(0)
    let [requestUrl,setRequestUrl] = useState(null)

    let location = useLocation()
    let params = location.state || {}

    useEffect(() => {
        // 获取特定参数的值
        const depositInfo = params;
        setDepositAmount(depositInfo.deposit_amount)
        setReceiveAddress(depositInfo.receive_address)
        setRequestUrl(depositInfo.url)

        getStorageItem("BTC_ADDR").then(btcAddr=>{
            estimateGasFee(depositInfo.deposit_amount,btcAddr,fee=>{
                setMinerFee(fee)
                setLoadFee(1)
            })
        })
        getBitcoinTestnetBalance(resp=>{
            let bl = resp
            setBtcBalance(bl)
            setLoadBanlance(1)
        })

        // 在组件渲染后执行的操作
        return () => {
            // 在组件卸载前执行的清理操作
            console.log('Component will unmount');
        };
    }, []);

    function clickConfirm(){
        console.log('总花费=>',minerFee + Math.round(depositAmount*(10**8)),Math.round(btcBalance*(10**8)))
        if(minerFee + Math.round(depositAmount*(10**8)) > Math.round(btcBalance*(10**8))){
            message.open({
                type:'error',
                content:'Insufficient balance to pay miner fee'
            })
            return
        }
        if(Math.round(depositAmount*(10**8)) < 1000){
            message.open({
                type:'error',
                content:'Deposit require a minimum of 1000 satoshi'
            })
            return
        }
        if(!ethers.isAddress(receiveAddress)){
            message.open({
                type:'error',
                content:'The ethereum recipient address invalid'
            })
            return
        }
        setSubmit(1)
        deposit(depositAmount,receiveAddress,()=>{
            setSubmit(0)
            message.success('Deposit success!')
            if(params.close_window == 1){
                chrome.tabs.query({url: `${requestUrl}`}, function(tabs) {
                    if(tabs && tabs.length > 0){
                        var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
                        if (currentTab) {
                            chrome.tabs.sendMessage(currentTab.id,{
                                type:'signed',
                                content:'deposit'
                            })
                        }
                    }
                });
            }
            setTimeout(()=>{
                if(params.close_window == 1){
                    window.close()
                }else{
                    navigate('/Deposit')
                }
            },500)
        },e=>{
            console.log('deposit error=>',e)
            setSubmit(0)
            message.open({
                type:'error',
                content:'excution failed'
            })
        })

    }

    function clickCancel(){
        if(params.close_window == 1){
            window.close()
        }else{
            navigate('/Deposit')
        }
    }

    return (
        <Spin size='large' spinning={submit || loadBalance == 0 || loadFee == 0}>
            <div className="deposit-sign-main">
                <Header/>
                <div className="deposit-con">
                    <span className="title">Deposit Confirmation</span>
                    <div className="row-item" style={{marginTop:"20px"}}>
                        <div className="row-con">
                            <span className="tips">Deposit Amount</span>
                            <div className="val-con">
                                <span className="value">{depositAmount}</span>
                                <span className="des">tBTC</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="row-item">
                        <div className="row-con">
                            <span className="tips">Ethereum Recipient Address</span>
                            <div className="val-con">
                                <span className="value">{convertToCenterEplis(receiveAddress)}</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="row-item">
                        <div className="row-con">
                            <span className="tips">Bridge Fee</span>
                            <div className="val-con">
                                <span className="value">{formatNumber(depositAmount*0.008,8)}</span>
                                <span className="des">tBTC</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="row-item">
                        <div className="row-con">
                            <span className="tips">Reward L2 Token</span>
                            <div className="val-con">
                                <span className="value">{formatNumber(depositAmount*32,8)}</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="row-item">
                        <div className="row-con">
                            <span className="tips">Estimated Miner Fee</span>
                            <div className="val-con">
                                <span className="value">{formatNumber(minerFee/(10**8),8)}</span>
                                <span className="des">tBTC</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="estimate-con">
                        <div className="arrival-con">
                            <span className="tips">Estimated Arrival:</span>
                            <div className="val-con">
                                <span className="value">{formatNumber(depositAmount*0.992,8)}</span>
                                <span className="des">zkBTC</span>
                            </div>
                        </div>
                    </div>
                    <div className="btn-con">
                        <div className="cancel hover-brighten" onClick={clickCancel}>Cancel</div>
                        <div className="confirm hover-brighten" onClick={clickConfirm}>
                            Confirm
                        </div>
                    </div>
                </div>
            </div>
        </Spin>
         )
}

export default DepositSign
