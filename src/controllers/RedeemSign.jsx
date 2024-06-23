import "./DepositSign.scss"
import Header from "./Header.jsx";
import {
    estimateRedeemEthereumFee,
    getBtcTestnetGasprice, getHoleskyEthBalance, getSystemAvailableZkbtc,
    getZkbtcHoleskyBalance,
    redeem
} from "../utils/blockcypher.jsx";
import {useEffect, useState} from "react";
import {message, Spin} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import {convertToCenterEplis, formatNumber} from "../utils/utils.jsx";

function RedeemSign(){
    const navigate = useNavigate();

    let [submit,setSubmit] = useState(0)
    let [redeemAmount,setRedeemAmount] = useState(0)
    let [receiveAddress,setReceiveAddress] = useState('')
    let [minerFee,setMinerFee] = useState(0)
    let [btcBalance,setBtcBalance] = useState(0)
    let [ethGas,setEthGas] = useState(0)
    let [available,setAvailable] = useState(0)
    let [loadGas,setLoadGas] = useState(0)
    let [loadAvailable,setLoadAvailable] = useState(0)
    let [ethBalance,setEthBalance] = useState(0)
    let [loadEth,setLoadEth] = useState(0)
    let [requestUrl,setRequestUrl] = useState(null)
    let [estimateGasUsed,setEstimateGasUsed] = useState(0)

    let location = useLocation()
    let params = location.state || {}

    useEffect(  () => {
        let redeemInfo = params
        setRedeemAmount(redeemInfo.redeem_amount)
        setReceiveAddress(redeemInfo.redeem_address)
        setRequestUrl(redeemInfo.url)
        getBtcTestnetGasprice().then(gasPrice=>{
            setMinerFee(251*gasPrice)
        })

        getZkbtcHoleskyBalance(bal=>{
            setBtcBalance(bal)
        })

        estimateRedeemEthereumFee(redeemInfo.redeem_amount,redeemInfo.redeem_address).then(res=>{
            setEthGas(formatNumber(res.cost,6))
            setEstimateGasUsed(res.estimateGas)
            setLoadGas(1)
        })

        getSystemAvailableZkbtc().then(bal=>{
            setAvailable(bal)
            setLoadAvailable(1)
        })

        getHoleskyEthBalance(bal=>{
            setEthBalance(Number(bal))
            setLoadEth(1)
        })

        let timeId = setTimeout(()=>{
            if(loadAvailable == 0 || loadEth ==0 || loadGas == 0){
                message.open({
                    type:'warning',
                    content:'Time out'
                })

                setTimeout(()=>{
                    clickCancel()
                },800)
            }
        },30000)

        // 在组件渲染后执行的操作
        return () => {
            clearTimeout(timeId)
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
        if(minerFee + Math.round(redeemAmount*(10**8)) > Math.round(btcBalance*(10**8))){
            message.open({
                type:'error',
                content:'Insufficient balance to pay miner fee'
            })
            return
        }
        if(Math.round(redeemAmount*(10**8)) > available){
            message.open({
                type:'error',
                content:'Available utxo insufficient,try again later.'
            })
            return
        }

        if(ethGas > ethBalance){
            message.open({
                type:'error',
                content:'Insufficient tETH to pay gas fee'
            })
            return
        }

        setSubmit(1)
        redeem(redeemAmount,receiveAddress,estimateGasUsed,()=>{
            message.success('Redeem success!')
            setSubmit(0)
            if(params.close_window == 1){
                chrome.tabs.query({url: `${requestUrl}`}, function(tabs) {
                    if(tabs && tabs.length > 0){
                        var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
                        if (currentTab) {
                            chrome.tabs.sendMessage(currentTab.id,{
                                type:'signed',
                                content:'redeem'
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
        },(error)=>{
            setSubmit(0)
            message.open({
                type:'error',
                content:error
            })
        })
    }
    return (
        <Spin size='large' spinning={submit || loadGas == 0 || loadAvailable == 0 || loadEth == 0 }>
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
                            <span className="tips">Bitcoin Reciption Address</span>
                            <div className="val-con">
                                <span className="value">{convertToCenterEplis(receiveAddress,8)}</span>
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
                                <span className="value">{formatNumber(redeemAmount*0.992,8)}</span>
                                <span className="des">tBTC</span>
                            </div>
                        </div>
                    </div>
                    <div className="cost-con">
                        <span className="tips" style={{marginRight:'5px'}}>
                            Gas fee:
                        </span>
                        <p className="values"> {ethGas} tETH</p>
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
