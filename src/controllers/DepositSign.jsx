import "./DepositSign.scss"
import Header from "./Header.jsx";
import {useEffect, useState} from "react";
import {deposit, estimateGasFee} from "../utils/blockcypher.jsx";
import {Spin} from "antd";
import {message} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import {convertToCenterEplis, formatNumber, getStorageItem} from "../utils/utils.jsx";

function DepositSign(){
    const navigate = useNavigate();

    let [depositAmount,setDepositAmount] = useState(0)
    let [receiveAddress,setReceiveAddress] = useState('')
    let [submit,setSubmit] = useState(0)
    let [minerFee,setMinerFee] = useState(0)

    let location = useLocation()
    let params = location.state || {}

    useEffect(() => {
        // 获取特定参数的值
        const depositInfo = params;
        setDepositAmount(depositInfo.deposit_amount)
        setReceiveAddress(depositInfo.receive_address)

        getStorageItem("BTC_ADDR").then(btcAddr=>{
            estimateGasFee(depositInfo.deposit_amount,btcAddr,fee=>{
                setMinerFee(fee)
            })
        })

        // 在组件渲染后执行的操作
        return () => {
            // 在组件卸载前执行的清理操作
            console.log('Component will unmount');
        };
    }, []);

    function clickConfirm(){
        setSubmit(1)
        deposit(depositAmount,receiveAddress,()=>{
            setSubmit(0)
            message.success('Deposit success!')
            setTimeout(()=>{
                if(params.close_window == 1){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        // var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
                        for(var tab in tabs){
                            if (currentTab) {
                                chrome.tabs.sendMessage(tab.id,{
                                    type:'signed'
                                })
                            }
                        }

                    });
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
        <Spin size='large' spinning={submit}>
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
                            <span className="tips">Ethereum Receive Address</span>
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
