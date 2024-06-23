import "./SetUnlockPassword.scss"
import Header from "./Header.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {message, Spin} from "antd";
import {createBitcoinWallet, createEthreumWallet, importPrivateKey} from "../utils/create.jsx";
import {
    getUnlockPassword,
    saveUnlockPassword, saveUnlockState,
    saveVerifyData
} from "../utils/utils.jsx";
import {importAddressToNode} from "../utils/blockcypher.jsx";

function SetUnlockPassword(){
    const navigate = useNavigate();
    let [enable,setEnable] = useState(0)
    let [password,setPassword] = useState('')
    let [confirmPassword,setConfirmPassword] = useState('')
    let [submit,setSubmit] = useState(0)

    let location = useLocation()
    let myParams = location.state || {}

    useEffect(()=>{
        // chrome.storage.local.get(['TEMP_PAS'],(password)=>{
        //     console.log('获取TEMP_PAS',password)
        //     if(password && password.length > 0){
        //         savePassword(password)
        //     }
        // })
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                clickDone()
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        getUnlockPassword().then(password=>{
            if(password && password.length > 0){
                savePassword(password)
            }
        })
        return ()=>{
            window.removeEventListener('keydown', handleKeyDown);
            console.log('SetUnlockPassword will unamounted')
        }
    },[password,confirmPassword])
    const clickDone = ()=>{
        if(password.length < 6){
            message.open({
                type:'error',
                content:'password length lower than 6'
            })
            return
        }
        if(password != confirmPassword){
            message.open({
                type:'error',
                content:'the two inputs are different'
            })
            return
        }

        savePassword(password)
    }

    const savePassword = (password)=>{
        setSubmit(1)
        saveUnlockPassword(password,  async ()=>{
            saveUnlockState()
            saveVerifyData(password)
            let params = myParams
            let importType = params.IMPORT_TYPE

            console.log('导入方式',importType)
            if (importType == 'create_wallet') {
                let mnemonics = params.CREATE_MNEMONICS
                console.log('获取保存的mnemonics',mnemonics)
                let bitcoinAddress = await createBitcoinWallet(password, mnemonics)
                createEthreumWallet(password, mnemonics)
                importAddressToNode(bitcoinAddress,false,res=>{
                    if(res.success == false){
                        console.log("import descriptors failed")
                    }
                })
            } else if (importType == 'import_mnemonics') {
                let mnemonics = params.IMPORT_MNEMONICS
                let bitcoinAddress = await createBitcoinWallet(password, mnemonics)
                console.log('import_mnemonics => ',bitcoinAddress)
                createEthreumWallet(password, mnemonics)
                importAddressToNode(bitcoinAddress,true,res=>{
                    if(res.success == false){
                        console.log("import descriptors failed")
                    }
                })
            } else if (importType == 'private_key') {
                let privateKey = params.IMPORT_KEY
                let bitcoinAddress = importPrivateKey(privateKey)
                importAddressToNode(bitcoinAddress,true,res=>{
                    if(res.success == false){
                        console.log("import descriptors failed")
                    }
                })
            }

            setTimeout(()=>{
                navigate('/Deposit')
                setSubmit(0)
            },1000)
        })
    }

    const inputPassword = e=>{
        let val = e.target.value
        setPassword(val)
        checkIsValidPassword(val,confirmPassword)
    }

    const checkIsValidPassword = (ps,cps)=>{
        if(ps == cps && ps.length >= 6){
            setEnable(1)
        }else{
            setEnable(0)
        }
    }

    const inputConfirmPassword = e=>{
        let val = e.target.value
        setConfirmPassword(val)
        checkIsValidPassword(password,val)
    }

    // const handleKeyDown = e=>{
    //     if (e.key === 'Enter') {
    //         clickDone()
    //     }
    // }

    return (
        <Spin spinning={submit} size='large'>
            <div className="set-main">
                <Header/>
                <div className="password-con">
                    <span className="tips">Set unlock password</span>
                    <input className="input-tx" type="password" onChange={inputPassword}/>

                    <span className="tips" style={{marginTop:"12px"}}>Repeat</span>
                    <input className="input-tx" type="password" onChange={inputConfirmPassword}/>
                    {
                        enable == 0 ? <div className="unlock-btn-disable" onClick={clickDone}>Set</div> :
                            <div className="unlock-btn hover-brighten" onClick={clickDone}>Set</div>
                    }
                </div>
            </div>
        </Spin>
        )
}

export default SetUnlockPassword
