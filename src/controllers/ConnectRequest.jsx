import './ConnectRequest.scss'
import logo from '../assets/logo.png'
import {useEffect, useState} from "react";
import {getBitcoinTestnetBalance, getZkbtcHoleskyBalance} from "../utils/blockcypher.jsx";
import {getStorageItem} from "../utils/utils.jsx";
import {useLocation} from "react-router-dom";
import {message, Spin} from "antd";

function ConnectRequest(){
    let [btcAddress,setBtcAddress] = useState('')
    let [ethAddress,setEthAddress] = useState('')
    let [btcBalance,setBtcBalance] = useState(0)
    let [ethBalance,setEthBalance] = useState(0)
    let [requestUrl,setRequestUrl] = useState('')
    let [submit, setSubmit] = useState(0)

    let location = useLocation()
    let params = location.state || {}

    useEffect(() => {
        setRequestUrl(params.url)

        getStorageItem('BTC_ADDR').then(btcAddr=>{
            setBtcAddress(btcAddr)
        })

        getStorageItem('ETH_ADDR').then(ethAddr=>{
            setEthAddress(ethAddr)
        })

        getBitcoinTestnetBalance(resp=>{
            let bl = resp
            setBtcBalance(bl)
            chrome.tabs.query({url: `${requestUrl}/*`}, function(tabs) {
                if(tabs && tabs.length > 0){
                    var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
                    if (currentTab) {
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
            chrome.tabs.query({url: `${requestUrl}/*`}, function(tabs) {
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
        chrome.tabs.query({url: `${requestUrl}/*`}, function(tabs) {
            if(tabs && tabs.length > 0){
                var currentTab = tabs[0]; // 在这里，tabs数组将只包含当前激活的标签页
                if (currentTab) {
                    console.log('convert message to content',currentTab)
                    chrome.tabs.sendMessage(currentTab.id,{
                        type:'connected',
                        connected_info:{btc_addr:btcAddress,eth_addr:ethAddress,tBTC_balance:btcBalance,zkBTC_balance:ethBalance}
                    },response=>{
                        console.log('xxxxx received',response)
                    })
                }
            }
        });

        setTimeout(()=>{
            setSubmit(0)
            window.close()
        },1000)
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
                                <span className="value">{btcAddress}</span>
                            </div>
                            <span className="number">{btcBalance/(10**8)} tBTC</span>
                        </div>
                        <div className="item-con">
                            <span className="tips">ethereum address</span>
                            <div className="divider-line"/>
                            <div className="value-con">
                                <span className="value">{ethAddress}</span>
                            </div>
                            <span className="number">{ethBalance.toFixed(6)} zkBTC</span>
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
