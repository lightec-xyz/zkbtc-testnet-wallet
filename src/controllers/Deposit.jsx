import "./Deposit.scss"
import avatar from "../assets/w_avatar.png"
import copy from "../assets/copy_addr.png"
import import_wallet from "../assets/import.png"
import btc_icon from "../assets/bxl-bitcoin.png"
import eth_icon from "../assets/eth_icon.png"
import addr_down from "../assets/wallet_switch.png"
import net_down from "../assets/network_switch.png"
import facut_icon from "../assets/shebeiliang_shuilongtou.png"
import right_arrow from "../assets/right_ar.png"
import checked_icon from "../assets/xuanzhong-2.png"
import {useCallback, useEffect, useState} from "react";
import { debounce } from 'lodash';
import {
    estimateGasFee,
    getBitcoinTestnetBalance, getBtcTestnetGasprice,
    getHoleskyEthBalance, getSystemAvailableZkbtc,
    getZkbtcHoleskyBalance,
    isBitcoinAddress
} from "../utils/blockcypher.jsx";
import {message, Skeleton, Spin} from "antd";
import {useNavigate} from "react-router-dom";
import {convertToCenterEplis, formatNumber, getStorageItem} from "../utils/utils.jsx";
import {getAllWallets, switchWalletToIndex} from "../utils/create.jsx";

function Deposit(){
    const navigate = useNavigate();

    let [showSwitch,setShowSwitch] = useState(0)
    let [selectIndex,setSelectIndex] = useState(0)
    let [type,setType] = useState(0) // type 0.deposit 1.redeem
    let [btcBalance,setBtcBalance] = useState(0)
    let [ethBalance,setEthBalance] = useState(0)
    let [zkBTCBalance,setZkBTCBalance] = useState(0)
    let [btcAddress,setBtcAddress] = useState('')
    let [ethAddress,setEthAddress] = useState('')
    let [depositAmount,setDepositAmount] = useState(0)
    let [ethReceiveAddress,setEthReceiveAddress] = useState('')
    let [redeemAmount,setRedeemAmount] = useState(0)
    let [btcReceiveAddress,setBtcReceiveAddress] = useState('')
    let [enable,setEnable] = useState(0)
    let [walletSwitch,setWalletSwitch] = useState(0)
    let [btcWallets,setBtcWallets] = useState([])
    let [ethWallets,setEthWallets] = useState([])
    let [unconfirmedBalance,setUnconfirmedBalance] = useState(0)
    let [loadBTCFinished,setLoadBTCFinished] = useState(0)
    let [loadETHFinished,setLoadETHFinished] = useState(0)
    let [depositMinerFee,setDepositMinerFee] = useState(0)
    let [loading,setLoading] = useState(0)
    useEffect(() => {
        // 在组件渲染后执行的操作
        switchType(0)
        findIndex()
        return () => {
            // 在组件卸载前执行的清理操作
            console.log('Deposit will unmount');
        };
    }, []);

    const debouncedOnChange = useCallback(
        debounce((newValue) => {
            estimateGasFee(newValue,btcAddress,fee=>{
                setDepositMinerFee(formatNumber(fee,8))
            })
        }, 500),
        [btcAddress]
    );

    const  inputDepositAmount = (e)=>{
        // 获取输入的值
        var value = e.target.value;
        setDepositAmount(value)
        debouncedOnChange(value)
        if(value > 0 && value < btcBalance && ethReceiveAddress.length > 0){
            setEnable(1)
        }
    }

    const  inputRedeemAmount = (e)=>{
        // 获取输入的值
        var value = e.target.value;
        setRedeemAmount(value)
        if(value > 0 && value <= zkBTCBalance && btcReceiveAddress.length > 0){
            setEnable(1)
        }
    }

    const inputEthReceiveAddress = (e)=>{
        var value = e.target.value;
        setEthReceiveAddress(value)
        if(depositAmount > 0 && depositAmount <= btcBalance && value.length > 0){
            setEnable(1)
        }
    }

    const inputBtcReceiveAddress = (e)=>{
        var value = e.target.value;
        setBtcReceiveAddress(value)
        if(redeemAmount > 0 && redeemAmount <= zkBTCBalance && value.length > 0){
            setEnable(1)
        }
    }

    async function clickMax(){
        if(type == 0){
            if(btcBalance > 0){
                setLoading(1)
                estimateGasFee(btcBalance,btcAddress,fee=>{
                    setLoading(0)
                    let max = btcBalance - fee/(10**8)
                    setDepositMinerFee(fee)
                    setDepositAmount(max)
                    if(max > 0 && max <= btcBalance && ethReceiveAddress.length > 0){
                        setEnable(1)
                    }

                    if(max < 0){
                        message.open({
                            type:'error',
                            content:'Insufficient balance to pay miner fee'
                        })
                    }
                })
            }
        }else{
            let gasPrice = await getBtcTestnetGasprice()
            let gas = gasPrice * 251
            if(zkBTCBalance < gas/(10**8)){
                message.open({
                    type:'error',
                    content:'Insufficient balance to pay miner fee'
                })
                return
            }

            let max = zkBTCBalance - gas/(10**8)

            setRedeemAmount(max.toFixed(8))
            if(redeemAmount > 0 && redeemAmount <= zkBTCBalance && btcReceiveAddress.length > 0){
                setEnable(1)
            }
        }
    }

    function switchType(tp){
        setShowSwitch(0)
        setType(tp)
        if(tp == 0){
            getStorageItem("BTC_ADDR").then(btcAddr=>{
                setBtcAddress(btcAddr)
                getBitcoinTestnetBalance(resp=>{
                    let bl = resp
                    setBtcBalance(bl)

                    // let unconfirmed = resp.data.unconfirmed_balance/(10**8)
                    // setUnconfirmedBalance(unconfirmed.toFixed(8))
                    setLoadBTCFinished(1)
                })
            })
        }else{
            getStorageItem('ETH_ADDR').then(ethAddr=>{
                setEthAddress(ethAddr)
                getZkbtcHoleskyBalance(bal=>{
                    setZkBTCBalance(bal)
                    setLoadETHFinished(1)
                })
                getHoleskyEthBalance(bal=>{
                    setEthBalance(Number(bal))
                })
            })
        }
    }

    function clickCopy(){
        var copyAddress = btcAddress
        if(type == 1){
            copyAddress = ethAddress
        }
        const textArea = document.createElement("textarea");
        textArea.value = copyAddress;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        message.success('copied')
    }

    function clickImport(){
        navigate('/ImportWallet')
    }

    async function clickRedeem(){
        if(!isBitcoinAddress(btcReceiveAddress)){
            message.open({
                type:'error',
                content:'bitcoin receive address invalid'
            })
            return
        }

        let gasPrice = getBtcTestnetGasprice()
        let minerFee = gasPrice * 251

        let totalAmount = redeemAmount + minerFee/(10**8)

        if(totalAmount > zkBTCBalance){
            message.open({
                type:'error',
                content:'Insufficient to pay miner fee'
            })
            return
        }

        getSystemAvailableZkbtc().then(available=>{
            console.log('可用余额=>',available,redeemAmount)
            if(available > redeemAmount){
                let redeemInfo = {
                    redeem_amount:redeemAmount,
                    redeem_address:btcReceiveAddress
                }
                navigate('/RedeemSign',{state:redeemInfo})
            }else{
                message.open({
                    type:'error',
                    content:'Available utxos insufficient'
                })
            }
        })


    }

    function clickDeposit(){
        if(depositAmount*10**8 + depositMinerFee > btcBalance*(10**8)){
            message.open({
                type:'error',
                content:'Insufficient balance to pay miner fee'
            })
            return
        }
        let depositInfo = {
            deposit_amount:depositAmount,
            receive_address:ethReceiveAddress
        }
        navigate('/DepositSign/',{state:depositInfo})
    }

    function clickFaucet(){
        if(type == 0){
            chrome.tabs.create({url:'https://coinfaucet.eu/en/btc-testnet/'})
        }else {
            chrome.tabs.create({url:'https://faucet.triangleplatform.com/ethereum/holesky'})
        }
    }

    function clickSwitchNetwork(){
        if(showSwitch == 0){
            setShowSwitch(1)
        }else{
            setShowSwitch(0)
        }
    }

    function toDepositHistory(){
        navigate('/DepositHistory')
    }

    function toRedeemHistory(){
        chrome.tabs.create({url:`https://holesky.etherscan.io/address/${ethAddress}`})
    }

    function clickWalletSwitch(){
        console.log('切换钱包')
        getAllWallets(res=>{
            setBtcWallets(res[0])
            setEthWallets(res[1])
            setWalletSwitch(1)
        })
    }

    function findIndex(){
        getStorageItem("BTC_ADDR").then(btcAddr=>{
            getAllWallets(res=>{
                let btcWals = res[0]
                let index = 0
                for(var i=0;i<btcWals.length;i++){
                    if(btcWals[i] == btcAddr){
                        index = i
                    }
                }
                setSelectIndex(index)
            })
        })
    }

    function switchToWallet(index){
        setSelectIndex(index)
        getAllWallets(res=>{
            setBtcAddress(res[0][index])
            setEthAddress(res[1][index])
            setWalletSwitch(0)
            switchWalletToIndex(index)
            setTimeout(()=>{
                switchType(type)
            },1000)
        })
    }

    return (<div className="ctrl-main">
        {
            type==0 ? (<div className="deposit-con">
                <div className="header">
                    <div className="info-con">
                        <img className="avatar" src={avatar}/>
                        <div className="address-con">
                            <div className="name-con" onClick={clickWalletSwitch}>
                                <span className="name">{'BTC Wallet '+(selectIndex+1)}</span>
                                <img className="switch-icon" src={addr_down}/>
                            </div>
                            <span className="address">{convertToCenterEplis(btcAddress)}</span>
                        </div>
                    </div>
                    <div className="control-con">
                        <img src={copy} className="icon hover-brighten" onClick={clickCopy}/>
                        <img src={import_wallet} className="icon hover-brighten" style={{marginLeft:"10px"}} onClick={clickImport}/>
                        <div className="switch-net hover-brighten" style={{marginLeft:"10px"}} onClick={clickSwitchNetwork}>
                            <img src={btc_icon} className="net-icon"/>
                            <img src={net_down} className="down-arrow"/>
                        </div>
                    </div>
                </div>
                <div className="balance-con">
                    {
                        loadBTCFinished == 0 ? <Skeleton style={{color:'#FFFFFF',width:'80px'}} active paragraph={{rows:1,width:'80px'}} title={false}>
                            <span className="balance">{btcBalance==0 ? 0 : btcBalance}</span>
                        </Skeleton> : <span className="balance">{btcBalance==0 ? 0 : btcBalance}</span>
                    }
                    <span className="tips">tBTC</span>
                    <img src={facut_icon} className="facut hover-brighten" onClick={clickFaucet}/>
                </div>
                {
                    unconfirmedBalance != 0 ? <div className="unconfirmed-balance-con">
                        <span className="balance">{unconfirmedBalance}</span>
                        <span className="unit">tBTC</span>
                        <span className="tips">(Unconfirmed)</span>
                    </div>  : <div></div>
                }
                <div className="switch-con">
                    <div className="deposit hover-brighten" onClick={()=>{switchType(0)}
                    }>Deposit</div>
                    <div className="redeem hover-brighten" onClick={()=>{switchType(1)}}>Redeem</div>
                </div>
                <div className="info-con">
                    <span className="title">Deposit amount</span>
                    <div className="amount-con">
                        <input className="input-filed" type='number' value={depositAmount} onChange={inputDepositAmount}/>
                        <div className="max-btn hover-brighten" onClick={clickMax}><Spin size='small' spinning={loading} style={{marginRight:'5px'}}></Spin>Max</div>
                    </div>
                    <span className="title" style={{marginTop:"12px"}}>Ethereum receive address</span>
                    <input className="address-input" onChange={inputEthReceiveAddress}/>
                    {
                        depositAmount > 0 && <div className="estimate-con">
                            <span className="tips">Estimated arrival </span>
                            <div className="val-con">
                                <span className="value">{formatNumber(depositAmount * 992 / 1000,8)}</span>
                                <span className="tips" style={{marginLeft:'5px'}}>zkBTC & </span>
                                <span className="value" style={{marginLeft:'5px'}}>{formatNumber(depositAmount * 32,8)}</span>
                                <span className="tips" style={{marginLeft:'5px'}}>L2 token</span>
                            </div>
                        </div>
                    }
                    <div className='confirm-con'>
                        {
                            depositMinerFee > 0 && <p className='estimate-miner-fee'>
                                <span className="des">Miner fee: </span>
                                <span className="value" style={{marginLeft:'8px'}}>{depositMinerFee/(10**8)}</span>
                            </p>
                        }
                        {
                            enable == 0 ? <div className="confirm-btn-disable hover-brighten">Deposit</div> :
                                <div className="confirm-btn hover-brighten" onClick={clickDeposit}>Deposit</div>
                        }
                    </div>
                    <div className="history-con" onClick={()=>{toDepositHistory()}}>
                        <div className="inner-con hover-brighten">
                            <span className="title">History list</span>
                            <img className="icon" src={right_arrow}/>
                        </div>
                    </div>
                </div>
                {
                    showSwitch==1 && <div className="menu">
                        <div className="item" onClick={()=>{switchType(0)}}>
                            <img src={btc_icon} className="icon"/>
                            <span className="text">Bitcoin Testnet</span>
                            {
                                type==0 && <img src={checked_icon} className="status-icon"/>
                            }
                        </div>
                        <div className="line"/>
                        <div className="item" onClick={()=>{switchType(1)}}>
                            <img src={eth_icon} className="icon"/>
                            <span className="text">ETH Testnet</span>
                            {
                                type==1 && <img src={checked_icon} className="status-icon"/>
                            }
                        </div>

                    </div>
                }
                {
                    walletSwitch==1 && <div className="wallet-menu">
                        {
                            type == 0 ? btcWallets.map((item,index)=>(
                                <div className="item" key={index} onClick={()=>{switchToWallet(index)}}>
                                    <div className='wallet-name-con'>
                                        <div className='title-con'>
                                            <img src={btc_icon} className='icon'/>
                                            <span className='title'>BTC Wallet {index+1}</span>
                                        </div>

                                        {
                                            item == btcAddress && <img src={checked_icon} className="status-icon"/>
                                        }
                                    </div>
                                    <span className="text">{convertToCenterEplis(item)}</span>
                                    {
                                        index < btcWallets.length-1 && <div className='line'/>
                                    }
                                </div>
                            )) : ethWallets.map((item,index)=>(
                                <div className="item" key={index} onClick={()=>{switchToWallet(index)}}>
                                    <div className='wallet-name-con'>
                                        <div className='title-con'>
                                            <img src={eth_icon} className='icon'/>
                                            <span className='title'>ETH Wallet {index+1}</span>
                                        </div>
                                        {
                                            item==ethAddress && <img src={checked_icon} className="status-icon"/>
                                        }
                                    </div>
                                    <span className="text">{item}</span>
                                    {
                                        index < ethWallets.length-1 && <div className='line'/>
                                    }
                                </div>
                            ))
                        }
                    </div>
                }
            </div>) : (
                <div className="redeem-con">
                    <div className="header">
                        <div className="info-con">
                            <img className="avatar" src={avatar}/>
                            <div className="address-con">
                                <div className="name-con" onClick={clickWalletSwitch}>
                                    <span className="name">{'ETH Wallet '+(selectIndex+1)} </span>
                                    <img className="switch-icon" src={addr_down}/>
                                </div>
                                <span className="address">{convertToCenterEplis(ethAddress)}</span>
                            </div>
                        </div>
                        <div className="control-con">
                            <img src={copy} className="icon hover-brighten" onClick={clickCopy}/>
                            <img src={import_wallet} className="icon hover-brighten" style={{marginLeft:"10px"}} onClick={clickImport}/>
                            <div className="switch-net hover-brighten" style={{marginLeft:"10px"}} onClick={clickSwitchNetwork}>
                                <img src={eth_icon} className="net-icon"/>
                                <img src={net_down} className="down-arrow"/>
                            </div>
                        </div>
                    </div>
                    <div className="balance-container">
                        <div className="zkBTC-con">
                            <span className="unit">zkBTC</span>
                            {
                                loadETHFinished == 0 ? <Skeleton color="#c0c0c0" active paragraph={{rows:1,width:'80px'}} title={false}>
                                    <span className="num">{zkBTCBalance == 0 ? 0 : zkBTCBalance.toFixed(8)}</span>
                                </Skeleton> : <span className="num">{zkBTCBalance == 0 ? 0 : zkBTCBalance.toFixed(8)}</span>
                            }
                        </div>
                        <div className="zkBTC-con">
                            <span className="unit">tETH</span>
                            <div className="num-con">
                                {
                                    loadETHFinished == 0 ? <Skeleton color="#c0c0c0" active paragraph={{rows:1,width:'80px'}} title={false}>
                                        <span className="num">{ethBalance == 0 ? 0 : ethBalance.toFixed(6)}</span>
                                    </Skeleton> : <span className="num">{ethBalance == 0 ? 0 : ethBalance.toFixed(6)}</span>
                                }
                                <img src={facut_icon} className="icon hover-brighten" onClick={clickFaucet}/>
                            </div>
                        </div>
                    </div>
                    <div className="switch-con">
                        <div className="deposit hover-brighten" onClick={()=>{switchType(0)}}>Deposit</div>
                        <div className="redeem hover-brighten" onClick={()=>{switchType(1)}}>Redeem</div>
                    </div>
                    <div className="info-con">
                        <span className="title">Redeem amount</span>
                        <div className="amount-con">
                            <input className="input-filed" type='number' value={redeemAmount} onChange={inputRedeemAmount}/>
                            <div className="max-btn hover-brighten" onClick={clickMax}>Max</div>
                        </div>
                        <span className="title" style={{marginTop:"12px"}}>Bitcoin receive address</span>
                        <input className="address-input" onChange={inputBtcReceiveAddress}/>
                        {
                            redeemAmount > 0 && <div className="estimate-con">
                                <span className="tips">Estimated arrival </span>
                                <div className="val-con">
                                    <span className="value">{formatNumber(redeemAmount*0.992,8)}</span>
                                    <span className="tips" style={{marginLeft:'5px'}}>tBTC & </span>
                                    <span className="value" style={{marginLeft:'5px'}}>{formatNumber(redeemAmount * 8,8)}</span>
                                    <span className="tips" style={{marginLeft:'5px'}}>L2 token</span>
                                </div>
                            </div>
                        }
                        {/*<div className="fee-detail hover-brighten">*/}
                        {/*    <span className="tips">Fee details</span>*/}
                        {/*    <img src={info_icon} className="icon" style={{marginLeft:'5px'}}/>*/}
                        {/*</div>*/}
                        {
                            enable == 0 ? <div className="confirm-btn-disable hover-brighten" >Redeem</div> :
                            <div className="confirm-btn hover-brighten" onClick={clickRedeem}>Redeem</div>
                        }

                        <div className="history-con" onClick={toRedeemHistory}>
                            <div className="inner-con hover-brighten">
                                <span className="title">ETH-Holesky browser</span>
                                <img className="icon" src={right_arrow}/>
                            </div>
                        </div>
                    </div>
                    {
                        showSwitch==1 && <div className="menu">
                            <div className="item" onClick={()=>{switchType(0)}}>
                                <img src={btc_icon} className="icon"/>
                                <span className="text">Bitcoin Testnet</span>
                                {
                                    type==0 && <img src={checked_icon} className="status-icon"/>
                                }
                            </div>
                            <div className="line"/>
                            <div className="item" onClick={()=>{switchType(1)}}>
                                <img src={eth_icon} className="icon"/>
                                <span className="text">ETH Testnet</span>
                                {
                                    type==1 && <img src={checked_icon} className="status-icon"/>
                                }
                            </div>
                        </div>
                    }
                    {
                        walletSwitch==1 && <div className="wallet-menu">
                            {
                                type == 0 ? btcWallets.map((item,index)=>(
                                    <div className="item" key={index} onClick={()=>{switchToWallet(index)}}>
                                        <div className='wallet-name-con'>
                                            <div className='title-con'>
                                                <img src={btc_icon} className='icon'/>
                                                <span className='title'>BTC Wallet {index+1}</span>
                                            </div>

                                            {
                                                item == btcAddress && <img src={checked_icon} className="status-icon"/>
                                            }
                                        </div>
                                        <span className="text">{convertToCenterEplis(item)}</span>
                                        {
                                            index < btcWallets.length-1 && <div className='line'/>
                                        }
                                    </div>
                                )) : ethWallets.map((item,index)=>(
                                    <div className="item" key={index} onClick={()=>{switchToWallet(index)}}>
                                        <div className='wallet-name-con'>
                                            <div className='title-con'>
                                                <img src={eth_icon} className='icon'/>
                                                <span className='title'>ETH Wallet {index+1}</span>
                                            </div>
                                            {
                                                item==ethAddress && <img src={checked_icon} className="status-icon"/>
                                            }
                                        </div>
                                        <span className="text">{convertToCenterEplis(item)}</span>
                                        {
                                            index < ethWallets.length-1 && <div className='line'/>
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    }
                </div>
            )
        }

    </div> )
}

export default Deposit
