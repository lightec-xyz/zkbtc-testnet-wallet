import './ConnectRequest.scss'
import logo from '../assets/logo.png'
import {useEffect, useState} from "react";
import {getBitcoinTestnetBalance, getZkbtcHoleskyBalance} from "../utils/blockcypher.jsx";
import {getStorageItem} from "../utils/utils.jsx";
import {useLocation} from "react-router-dom";
import {Spin} from "antd";
import {getPublicKeyAndSig} from "../utils/create.jsx";
import {convertToCenterEplis} from "../utils/utils.jsx";

function ConnectRequest(){
    let [btcAddress,setBtcAddress] = useState('')
    let [ethAddress,setEthAddress] = useState('')
    let [btcBalance,setBtcBalance] = useState(0)
    let [ethBalance,setEthBalance] = useState(0)
    let [requestUrl,setRequestUrl] = useState('')
    let [submit, setSubmit] = useState(0)
    let [signatureInfo,setSignatureInfo] = useState({})
    let [code,setCode] = useState('')

    let location = useLocation()
    let params = location.state || {}
    // if(params && params.url){
    //     params.url = params.url.split('/#/')[0]
    // }

    useEffect(() => {
        setRequestUrl(params.url)
        setCode(params.code || '')

        getStorageItem('BTC_ADDR').then(btcAddr=>{
            setBtcAddress(btcAddr)
        })

        getStorageItem('ETH_ADDR').then(ethAddr=>{
            setEthAddress(ethAddr)
        })

        getBitcoinTestnetBalance(resp=>{
            let bl = resp
            setBtcBalance(bl)

            let pattern = `${params.url}*`
            if(params.url && params.url.includes('/#/')){
                let split = params.url.split('/#/')[0]
                pattern = `${split}/*`
            }

            chrome.tabs.query({url: pattern}, function(tabs) {
                console.log('start find',params.url)
                if(tabs && tabs.length > 0){
                    var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
                    console.log('find tab',currentTab)
                    if (currentTab) {
                        console.log('find url tab',requestUrl,currentTab)
                        chrome.tabs.sendMessage(currentTab.id,{
                            type:'tBTC',
                            balance:bl
                        })
                    }
                }
            });
        })

        getZkbtcHoleskyBalance(resp=>{
            setEthBalance(resp)
            let pattern = `${params.url}*`
            if(params.url && params.url.includes('/#/')){
                let split = params.url.split('/#/')[0]
                pattern = `${split}/*`
            }
            chrome.tabs.query({url: pattern}, function(tabs) {
                if(tabs && tabs.length > 0){
                    var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
                    if (currentTab) {
                        chrome.tabs.sendMessage(currentTab.id,{
                            type:'zkBTC',
                            balance:resp
                        })
                    }
                }
            });
        })

        return () => {
            // 在组件卸载前执行的清理操作
            console.log('ConnectRequest will unmount');
        };
    }, []);

    function clickConfirm(){
        setSubmit(1)

        let pattern = `${params.url}*`
        if(params.url && params.url.includes('/#/')){
            let split = params.url.split('/#/')[0]
            pattern = `${split}/*`
        }

        getPublicKeyAndSig(code).then(sig=>{
            setSignatureInfo(sig)
            chrome.tabs.query({url: pattern}, function(tabs) {
                console.log('find tabs',tabs)
                if(tabs && tabs.length > 0){
                    tabs.forEach(tab=>{
                        chrome.tabs.sendMessage(tab.id,{
                            type:'connected',
                            connected_info:{btc_addr:btcAddress,eth_addr:ethAddress,tBTC_balance:btcBalance,zkBTC_balance:ethBalance,signature:sig}
                        },response=>{
                            console.log('xxxxx received',response)
                        })
                    })
                }
            });

            setTimeout(()=>{
                setSubmit(0)
                window.close()
            },1000)
        })
    }

    function clickCancel(){
        window.close()
    }

    return (
        <Spin spinning={submit} size='large'>
            <div className="connect-main">
                <div className="header">
                    <img src={logo} className="icon"/>
                    <span className="name">Lightec Wallet Extension</span>
                </div>
                <div className="connect-con">
                    <div className="title">
                        Connect Request
                    </div>
                    <div className="info-con">
                        <div className="item-con" style={{marginTop:'0px'}}>
                            <span className="tips">request from</span>
                            <div className="divider-line"/>
                            <div className="value-con">
                                <span className="value">{`${requestUrl}`}</span>
                            </div>
                        </div>
                        <div className="item-con">
                            <span className="tips">build connection with</span>
                            <div className="divider-line"/>
                            <div className="value-con">
                                <img src={logo} className="val-icon"/>
                                <span className="value">Testnet Wallet</span>
                            </div>
                        </div>
                        <div className="item-con">
                            <span className="tips">bitcoin address</span>
                            <div className="divider-line"/>
                            <div className="value-con">
                                <span className="value">{convertToCenterEplis(btcAddress,8)}</span>
                            </div>
                            <span className="number">{btcBalance} tBTC</span>
                        </div>
                        <div className="item-con">
                            <span className="tips">ethereum address</span>
                            <div className="divider-line"/>
                            <div className="value-con">
                                <span className="value">{convertToCenterEplis(ethAddress,8)}</span>
                            </div>
                            <span className="number">{ethBalance.toFixed(8)} zkBTC</span>
                        </div>
                    </div>
                    <div className="confirm-btns-con">
                        <div className="cancel hover-brighten" onClick={clickCancel}>Cancel</div>
                        <div className="confirm hover-brighten" onClick={clickConfirm}>
                            Connect
                        </div>
                    </div>
                </div>
            </div>
        </Spin>
    )
}

export default ConnectRequest
