import "./Unlock.scss"
import Header from "./Header.jsx";
import {useNavigate} from "react-router-dom";
import {generateMnemonics, createBitcoinWallet, createEthreumWallet, signTest} from "../utils/create";
import {useEffect, useState} from "react";
import {message} from "antd";
import {
    AESDecrypt,
    AESEncrypt,
    checkUserInputPasswordValid, checkWalletCreated,
    getStorageItem,
    isUnlockExpired,
    saveUnlockState
} from "../utils/utils.jsx";

function Unlock(){
    const navigate = useNavigate();
    let [enable,setEnable] = useState(0)
    let [password,setPassword] = useState('')
    let [type,setType] = useState('')
    let [externalParams,setExternalParams] = useState('')

    useEffect(  () => {
        // 获取当前页面 URL 的查询参数
        const searchParams = new URLSearchParams(window.location.search);

        // 获取特定参数的值
        let typeParam = searchParams.get('type')
        let extParam = searchParams.get('params')
        setType(typeParam)
        setExternalParams(extParam)

        checkWalletCreated().then(async exist => {
            if(exist){
                if(await isUnlockExpired() == false){
                    let params = JSON.parse(extParam)
                    if(params != null){
                        params['close_window'] = 1
                    } // close window
                    if(typeParam == 'deposit'){
                        navigate('/DepositSign',{state:params})
                        return
                    }else if(typeParam == 'redeem'){
                        navigate('/RedeemSign',{state:params})
                        return
                    }else if(typeParam == 'connect'){
                        navigate('/ConnectRequest',{state:params})
                        return
                    }
                    navigate('/Deposit')
                }
            }else{
                navigate('/ImportWallet')
            }
        })

        return () => {
            // 在组件卸载前执行的清理操作
            console.log('Unlock will unmount');
        };
    }, []);

    function jumpPage(){
        checkUserInputPasswordValid(password).then(_=>{
            saveUnlockState()
            let params = JSON.parse(externalParams)
            if(params != null){
                params['close_window'] = 1
            }

            if(type == 'deposit'){
                navigate('/DepositSign',{state:params})
                return
            }else if(type == 'redeem'){
                navigate('/RedeemSign',{state:params})
                return
            }else if(type == 'connect'){
                navigate('/ConnectRequest',{state:params})
                return
            }
            navigate('/Deposit')
        }).catch(error=>{
            message.open({
                type:'error',
                content:error.message
            })
        })
    }

    const inputPassword = e=>{
        let val = e.target.value
        setPassword(val)
        if(val.length >= 6){
            setEnable(1)
        }else{
            setEnable(0)
        }
    }

    return (<div className="unlock-main">

        <Header/>
        <div className="password-con">
            <span className="tips">Unlock by password</span>
            <input className="input-tx" type='password' onChange={inputPassword}/>
            {
                enable == 0 ? <div className="unlock-btn-disable" >Unlock</div> :
                    <div className="unlock-btn hover-brighten" onClick={jumpPage}>Unlock</div>
            }
        </div>
    </div> )
}

export default Unlock
