import "./DepositSign.scss"
import Header from "./Header.jsx";
import {getBtcTestnetGasprice, redeem} from "../utils/blockcypher.jsx";
import {useEffect, useState} from "react";
import {message, Spin} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import {formatNumber} from "../utils/utils.jsx";

function RedeemSign(){
    const navigate = useNavigate();

    let [submit,setSubmit] = useState(0)
    let [redeemAmount,setRedeemAmount] = useState(0)
    let [receiveAddress,setReceiveAddress] = useState('')
    let [minerFee,setMinerFee] = useState(0)

    let location = useLocation()
    let params = location.state || {}

    useEffect( async () => {
        let redeemInfo = params
        setRedeemAmount(redeemInfo.redeem_amount)
        setReceiveAddress(redeemInfo.redeem_address)
        let gasPrice = await getBtcTestnetGasprice()
        setMinerFee(251*gasPrice)
        // 在组件渲染后执行的操作
        return () => {
            // 在组件卸载前执行的清理操作
            console.log('Component will unmount');
        };
    }, []);

    function clickCancel(){
        if(params.close_window == 1){
            window.close()
        }else{
            navigate('/Deposit')
        }
    }
    function clickConfirm(){
        setSubmit(1)
        redeem(redeemAmount,receiveAddress,()=>{
            message.success('Redeem success!')
            setSubmit(0)
            setTimeout(()=>{
                if(params.close_window == 1){
                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
                        if (currentTab) {
                            chrome.tabs.sendMessage(currentTab.id,{
                                type:'signed'
                            })
                        }
                    });
                    window.close()
                }else{
                    navigate('/Deposit')
                }
            },500)
        },(error)=>{
            setSubmit(0)
            message.open({
                type:'error',
                content:'excution revert'
            })
        })
    }
    return (
        <Spin size='large' spinning={submit}>
            <div className="deposit-sign-main">
                <Header/>
                <div className="deposit-con">
                    <span className="title">Redeem Confirmation</span>
                    <div className="row-item" style={{marginTop:"20px"}}>
                        <div className="row-con">
                            <span className="tips">Redeem Amount</span>
                            <div className="val-con">
                                <span className="value">{redeemAmount}</span>
                                <span className="des">zkBTC</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="row-item">
                        <div className="row-con">
                            <span className="tips">Bitcoin Receive Address</span>
                            <div className="val-con">
                                <span className="value">{receiveAddress}</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="row-item">
                        <div className="row-con">
                            <span className="tips">Bridge Fee</span>
                            <div className="val-con">
                                <span className="value">{formatNumber(redeemAmount*0.008,8)}</span>
                                <span className="des">zkBTC</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="row-item">
                        <div className="row-con">
                            <span className="tips">Estimated Miner Fee</span>
                            <div className="val-con">
                                <span className="value">{formatNumber(minerFee/(10**8),8)}</span>
                                <span className="des">zkBTC</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="row-item">
                        <div className="row-con">
                            <span className="tips">Reward L2 Token</span>
                            <div className="val-con">
                                <span className="value">{formatNumber(redeemAmount*8,8)}</span>
                            </div>
                        </div>
                        <div className="line"/>
                    </div>
                    <div className="estimate-con">
                        <div className="arrival-con">
                            <span className="tips">Estimated Arrival:</span>
                            <div className="val-con">
                                <span className="value">{formatNumber(redeemAmount*0.992-(251*2/(10**8)),8)}</span>
                                <span className="des">tBTC</span>
                            </div>
                        </div>
                    </div>
                    <div className="btn-con" >
                        <div className="cancel hover-brighten" onClick={clickCancel}>Cancel</div>
                        <div className="confirm hover-brighten" onClick={clickConfirm}>Confirm</div>
                    </div>
                </div>
            </div>
        </Spin>
    )
}

export default RedeemSign
