import "./Deposit.scss"
import avatar from "../assets/bitcoin-btc-logo.png"
import copy from "../assets/copy_addr.png"
import import_wallet from "../assets/import.png"
import btc_icon from "../assets/bxl-bitcoin.png"
import eth_icon from "../assets/eth_icon.png"
import addr_down from "../assets/wallet_switch.png"
import net_down from "../assets/network_switch.png"
import facut_icon from "../assets/shebeiliang_shuilongtou.png"
import right_arrow from "../assets/right_ar.png"
import checked_icon from "../assets/xuanzhong-2.png"
import eth_avatar from '../assets/ETH-2.png'
import {useCallback, useEffect, useState} from "react";
import { debounce } from 'lodash';
import export_private from "../assets/export_private.png"
import close_pop from "../assets/close_pop.png"
import warning_icon from "../assets/jinggao.png"
import {
    estimateGasFee,
    getBitcoinTestnetBalance, getBtcTestnetGasprice, getDepositAllUncompletes,
    getHoleskyEthBalance, getSystemAvailableZkbtc,
    getZkbtcHoleskyBalance,
    isBitcoinAddress, loadUncompleteRedeemTransactions
} from "../utils/blockcypher.jsx";
import {message, Skeleton, Spin} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import {
    checkUserInputPasswordValid,
    convertToCenterEplis,
    formatNumber,
    getStorageItem,
    openFaucet
} from "../utils/utils.jsx";
import {getAllWallets, getPublicKeyAndSig, switchWalletToIndex} from "../utils/create.jsx";
import {ethers} from "ethers";

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
    let [redeemMinerFee, setRedeemMinerFee] = useState(0)
    let [loading,setLoading] = useState(0)
    let [depositErrorMsg,setDepositErrorMsg] = useState('')
    let [redeemErrorMsg,setRedeemErrorMsg] = useState('')
    let [redeemUncompleteCount,setRedeemUncompleteCount] = useState(0)
    let [redeemUncompleteMap,setRedeemUncompleteMap] = useState({})
    let [depositUncompleteCount,setDepositUncompleteCount] = useState(0)
    let [showExport,setShowExport] = useState(0)
    let [exportBtnState,setExportBtnState] = useState(0)
    let [privateKey,setPrivateKey] = useState('')
    let [showPrivateKey,setShowPrivateKey] = useState(0)
    let [exportPassword,setExportPassword] = useState('')
    let [needRealodDepositHistory,setNeedRealodDepositHistory] = useState(0)

    let location = useLocation()
    let params = location.state || {}

    useEffect(() => {
        // 在组件渲染后执行的操作
        switchType(0)
        findIndex()
        if(params != undefined && params.needUpdate != undefined){
            params.needUpdate = undefined
            params = undefined
            setNeedRealodDepositHistory(1)
        }
        return () => {
            // 在组件卸载前执行的清理操作
            console.log('Deposit will unmount');
        };
    }, []);

    const debouncedOnChange = useCallback(
        debounce((newValue) => {
            if(Math.round(newValue*(10**8)) < 1000){
                setDepositErrorMsg('The minimum deposit amount is 1000 sats (0.00001 btc)')
            }else{
                setDepositErrorMsg('')
                estimateGasFee(newValue,btcAddress,fee=>{
                    setDepositMinerFee(formatNumber(fee,8))
                })
            }
        }, 500),
        [btcAddress]
    );

    useEffect(() => {
        if(type == 1){
            loadUncompleteRedeemTransactions(ethAddress).then(ucmps=>{
                setRedeemUncompleteCount(ucmps.length)
                let map = {}
                ucmps.map((item,index)=>{
                    map[item.hash] = false
                })
                setRedeemUncompleteMap(map)
            })
        }else{
            getStorageItem("BTC_ADDR").then(btcAddr=>{
                getDepositAllUncompletes(btcAddr).then(ucmps=>{
                    setDepositUncompleteCount(ucmps.length)
                })
            })
        }

        let intervalID = setInterval(()=>{
            if(type === 1){
                loadUncompleteRedeemTransactions(ethAddress).then(ucmps=>{
                    setRedeemUncompleteCount(ucmps.length)
                    let map = {}
                    ucmps.map((item,index)=>{
                        map[item.hash] = false
                    })
                    setRedeemUncompleteMap(map)
                })
            }else{
                getStorageItem("BTC_ADDR").then(btcAddr=>{
                    getDepositAllUncompletes(btcAddr).then(ucmps=>{
                        setDepositUncompleteCount(ucmps.length)
                        setNeedRealodDepositHistory(0)
                    })
                })
            }
        },30000)
        // 在组件渲染后执行的操作
        return () => {
            // 在组件卸载前执行的清理操作
            console.log('Redeem form unamount');
            clearInterval(intervalID)
        };
    }, [type,ethAddress,btcAddress]);

    const debounceRedeemFee = useCallback(
        debounce((newValue) => {
            if(Math.round(newValue*(10**8)) < 1000){
                setRedeemErrorMsg('The minimum redeem amount is 1000 sats (0.00001 btc)')
            }else{
                setRedeemErrorMsg('')
                getBtcTestnetGasprice().then(price=>{
                    let gasFee = price*251
                    setRedeemMinerFee(gasFee)
                })
            }
        }, 500),
        [ethAddress]
    )

    const  inputDepositAmount = (e)=>{
        // 获取输入的值
        var value = e.target.value;
        if(value != ''){
            value = Math.round(value*(10**8))/(10**8)
        }

        setDepositAmount(value)
        debouncedOnChange(value)
        if(value > 0 && value < btcBalance && ethReceiveAddress.length > 0){
            setEnable(1)
        }
    }

    const  inputRedeemAmount = (e)=>{
        // 获取输入的值
        var value = e.target.value;
        if(value != ''){
            value = Math.round(value*(10**8))/(10**8)
        }
        setRedeemAmount(value)
        debounceRedeemFee(value)
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
                    if(max < 0){
                        max = 0
                    }
                    setDepositMinerFee(fee)
                    setDepositAmount(formatNumber(max,8))
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

            setRedeemMinerFee(gas)
            let max = zkBTCBalance - gas/(10**8)
            if(max < 0){
                max = 0
            }
            setRedeemAmount(formatNumber(max,8))
            if(max > 0 && max <= zkBTCBalance && btcReceiveAddress.length > 0){
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
                content:'bitcoin recipient address invalid'
            })
            return
        }

        let gasPrice = await getBtcTestnetGasprice()
        let minerFee = gasPrice * 251

        let totalAmount = parseFloat(redeemAmount) + parseFloat(minerFee/(10**8))
        console.log('miner fee & total amount',minerFee,totalAmount)

        if(totalAmount > zkBTCBalance){
            message.open({
                type:'error',
                content:'Insufficient to pay miner fee'
            })
            return
        }

        getSystemAvailableZkbtc().then(available=>{
            console.log('可用余额=>',available,Math.round(redeemAmount*(10**8)),minerFee)
            if(available >= Math.round(redeemAmount*(10**8)) + minerFee){
                let redeemInfo = {
                    redeem_amount:redeemAmount,
                    redeem_address:btcReceiveAddress
                }
                navigate('/RedeemSign',{state:redeemInfo})
            }else{
                message.open({
                    type:'error',
                    content:'Available utxo insufficient,try again later.'
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
        if(!ethers.isAddress(ethReceiveAddress)){
            message.open({
                type:'error',
                content:'The ethereum recipient address invalid'
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
        // chrome.tabs.create({url:'https://testnet.zkbtc.money?state=3'})
        openFaucet()
    }

    function clickSwitchNetwork(){
        if(showSwitch == 0){
            setShowSwitch(1)
        }else{
            setShowSwitch(0)
        }
    }

    function toDepositHistory(){
        if(needRealodDepositHistory == 1){
            message.open({
                type:'error',
                content:' You have a transaction is pending to be synced to the block,please try again later'
            })
            return
        }
        navigate('/DepositHistory')
    }

    function toRedeemHistory(){
        navigate('/RedeemHistory',{state:redeemUncompleteMap})
    }

    function clickWalletSwitch(){
        console.log('切换钱包')
        getAllWallets(res=>{
            setBtcWallets(res[0])
            setEthWallets(res[1])
            setWalletSwitch(1)
        })
    }

    function sendSwitchMessage(btcAddr,ethAddr){
        getPublicKeyAndSig('').then(sig=>{
            chrome.tabs.query({}, function(tabs) {
                let filterTabs = tabs.filter(tb=>{
                    return tb.url.startsWith("https://testnet.zkbtc.money")
                })
                if(filterTabs && filterTabs.length > 0){
                    filterTabs.map(tab=>{
                        chrome.tabs.sendMessage(tab.id,{
                            type:'switch_wallet',
                            connected_info:{btc_addr:btcAddr,eth_addr:ethAddr,signature:sig}
                        },response=>{
                            console.log('switch wallet',response)
                        })
                    })
                }
            });
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
        if(selectIndex === index){
            return
        }
        setSelectIndex(index)
        getAllWallets(res=>{
            setBtcAddress(res[0][index])
            setEthAddress(res[1][index])
            setWalletSwitch(0)
            switchWalletToIndex(index)
            sendSwitchMessage(res[0][index],res[1][index])
            setTimeout(()=>{
                switchType(type)
            },1000)
        })
    }

    function clickExportPrivateKey(){
        setShowExport(1)
    }

    function closeExportPrivateKey(){
        setShowExport(0)
        setShowPrivateKey(0)
        setExportPassword('')
    }

    const inputUnlockPassword = (e)=>{
        var value = e.target.value;
        setExportPassword(value)
        if(value.length >= 6){
            setExportBtnState(1)
        }
    }

    const copyPrivateKey = ()=>{
        const textArea = document.createElement("textarea");
        textArea.value = privateKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        message.success('copied')
    }

    function clickExportConfirmBtn(){
        checkUserInputPasswordValid(exportPassword).then(_=>{
            setShowPrivateKey(1)
            getStorageItem('KEYS_ARR').then(keysStr=> {
                let keys = keysStr.split(" ")
                let prk = keys[selectIndex]
                setPrivateKey(prk)
            })
        }).catch(e=>{
            message.open({
                type:'error',
                content:'Password incorrect'
            })
        })
    }

    return (<div className="ctrl-main">
        {
            type==0 ? (<div className="deposit-con">
                <div className="header">
                    <div className="info-con">
                        <img className="avatar" src={avatar}/>
                        <div className="address-con">
                            <div className="name-con">
                                <span className="name" onClick={clickWalletSwitch}>{'BTC Wallet '+(selectIndex+1)}</span>
                                <img className="switch-icon" src={addr_down} onClick={clickWalletSwitch}/>
                                <img className="export-icon hover-brighten" src={export_private} onClick={clickExportPrivateKey}/>
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
                    <span className="title" style={{marginTop:"12px"}}>Holesky(ETH) testnet Recipient Address</span>
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
                            (depositMinerFee > 0 && depositErrorMsg == '') && <p className='estimate-miner-fee'>
                                <span className="des">Miner fee: </span>
                                <span className="value" style={{marginLeft:'8px'}}>{depositMinerFee/(10**8)}</span>
                                <span className={(parseInt(depositMinerFee)+Math.round(depositAmount*(10**8))) > Math.round(btcBalance*(10**8)) ? 'total-cost-invalid' : 'total-cost-valid'}>(total: {(depositMinerFee+Math.round(depositAmount*(10**8)))/(10**8)} tBTC)</span>
                            </p>
                        }
                        {
                            depositErrorMsg != '' && <p className='error-des'>{depositErrorMsg}</p>
                        }
                        {
                            enable == 0 ? <div className="confirm-btn-disable hover-brighten">Deposit</div> :
                                <div className="confirm-btn hover-brighten" onClick={clickDeposit}>Deposit</div>
                        }
                    </div>
                    <div className="history-con" onClick={()=>{toDepositHistory()}}>
                        <div className="inner-con hover-brighten">
                            <div className="title-con">
                                <span className="title">Deposit History</span>
                                {
                                    depositUncompleteCount > 0 && <div className="uncomplete-con">
                                        <span className="lab">You have <a className="num">{depositUncompleteCount}</a> deposit transactions in progress</span>
                                    </div>
                                }
                            </div>
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
                {
                    showExport == 1 && <div className="show-private-menu">
                        <div className="header-con">
                            <div className="icon"/>
                            <span className="title">Show private key</span>
                            <img className="icon" src={close_pop} onClick={closeExportPrivateKey}/>
                        </div>
                        <img className="ava" src={type==0?btc_icon:eth_icon}/>
                        <span className="addr">{type == 0 ? convertToCenterEplis(btcAddress,8) : convertToCenterEplis(ethAddress,8)}</span>
                        <p className="waring-p">
                            <img className="warning-icon" src={warning_icon}/>
                            Anyone can obtain your account assets through this private key, please keep it properly and do not disclose it to others.
                        </p>
                        {
                            showPrivateKey == 0 && <span className="tips">
                                Please input your unlock password:
                        </span>
                        }
                        {
                            showPrivateKey == 0 && <input className="input-tx" type="password" onChange={inputUnlockPassword}/>
                        }
                        {
                            showPrivateKey == 1 && <p className="private-key-con">
                                {privateKey}
                                <img className="copy-icon" src={copy} onClick={copyPrivateKey}/>
                            </p>
                        }
                        {
                            showPrivateKey == 0 && (exportBtnState == 0 ? <div className="show-btn-disable">Show</div> : <div className="show-btn" onClick={clickExportConfirmBtn}>Show</div>)
                        }
                    </div>
                }
            </div>) : (
                <div className="redeem-con">
                    <div className="header">
                        <div className="info-con">
                            <img className="avatar" src={eth_avatar}/>
                            <div className="address-con">
                                <div className="name-con">
                                    <span className="name" onClick={clickWalletSwitch}>{'ETH Wallet '+(selectIndex+1)} </span>
                                    <img className="switch-icon" src={addr_down} onClick={clickWalletSwitch}/>
                                    <img className="export-icon hover-brighten" src={export_private} onClick={clickExportPrivateKey}/>
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
                    {/*{*/}
                    {/*    redeemUncompleteCount > 0 && <div className="uncomplete-con hover-brighten" onClick={toRedeemHistory}>*/}
                    {/*        <span className="lab">You have <a className="num">{redeemUncompleteCount}</a> redeem transactions in progress</span>*/}
                    {/*        <img className="icon" src={light_right} style={{marginLeft:'12px'}}/>*/}
                    {/*    </div>*/}
                    {/*}*/}
                    <div className="info-con">
                        <span className="title">Redeem amount</span>
                        <div className="amount-con">
                            <input className="input-filed" type='number' value={redeemAmount} onChange={inputRedeemAmount}/>
                            <div className="max-btn hover-brighten" onClick={clickMax}>Max</div>
                        </div>
                        <span className="title" style={{marginTop:"12px"}}>Bitcoin testnet recipient address</span>
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
                        <div className='confirm-con'>
                            {
                                (redeemMinerFee > 0 && redeemErrorMsg == '') && <p className='estimate-miner-fee'>
                                    <span className="des">Miner fee: </span>
                                    <span className="value" style={{marginLeft:'8px'}}>{redeemMinerFee/(10**8)}</span>
                                    <span className={(parseInt(redeemMinerFee)+Math.round(redeemAmount*(10**8))) > Math.round(zkBTCBalance*(10**8)) ? 'total-cost-invalid' : 'total-cost-valid'}>(total: {(redeemMinerFee+Math.round(redeemAmount*(10**8)))/(10**8)} tBTC)</span>
                                </p>
                            }
                            {
                                redeemErrorMsg != '' && <p className='error-des'>{redeemErrorMsg}</p>
                            }
                            {
                                enable == 0 ? <div className="confirm-btn-disable hover-brighten">Redeem</div> :
                                    <div className="confirm-btn hover-brighten" onClick={clickRedeem}>Redeem</div>
                            }
                        </div>

                        <div className="history-con" onClick={toRedeemHistory}>
                            <div className="inner-con hover-brighten">
                                <div className="title-con">
                                    <span className="title">Redeem History</span>
                                    {
                                        redeemUncompleteCount > 0 && <div className="uncomplete-con">
                                            <span className="lab">You have <a className="num">{redeemUncompleteCount}</a> redeem transactions in progress</span>
                                        </div>
                                    }
                                </div>

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
                    {
                        showExport == 1 && <div className="show-private-menu">
                            <div className="header-con">
                                <div className="icon"/>
                                <span className="title">Show private key</span>
                                <img className="icon" src={close_pop} onClick={closeExportPrivateKey}/>
                            </div>
                            <img className="ava" src={type==0?btc_icon:eth_icon}/>
                            <span className="addr">{type == 0 ? convertToCenterEplis(btcAddress,8) : convertToCenterEplis(ethAddress,8)}</span>
                            <p className="waring-p">
                                <img className="warning-icon" src={warning_icon}/>
                                Anyone can obtain your account assets through this private key, please keep it properly and do not disclose it to others.
                            </p>
                            {
                                showPrivateKey == 0 && <span className="tips">
                                Please input your unlock password:
                        </span>
                            }
                            {
                                showPrivateKey == 0 && <input className="input-tx" type="password" onChange={inputUnlockPassword}/>
                            }
                            {
                                showPrivateKey == 1 && <p className="private-key-con">
                                    {privateKey}
                                    <img className="copy-icon" src={copy} onClick={copyPrivateKey}/>
                                </p>
                            }
                            {
                                showPrivateKey == 0 && (exportBtnState == 0 ? <div className="show-btn-disable">Show</div> : <div className="show-btn" onClick={clickExportConfirmBtn}>Show</div>)
                            }
                        </div>
                    }
                </div>
            )
        }

    </div> )
}

export default Deposit
