import "./SubmitProof.scss"
import down_arrow from "../assets/xia-jiantou.png"
import facut from "../assets/shebeiliang_shuilongtou.png"
import edit from "../assets/xiugai.png"
import logo from "../assets/logo.png"
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {convertToCenterEplis, formatNumber, getStorageItem} from "../utils/utils.jsx";
import {
    getHoleskyEthBalance,
    getSingleProofData,
    submitDepositProof
} from "../utils/blockcypher.jsx";
import {message, Spin} from "antd";

function SubmitProof(){
    let navigate = useNavigate()

    let [submitAccount,setSubmitAccount] = useState('')
    let [receiveAccount,setReceiveAccount] = useState('')
    let [depositAmount,setDepositAmount] = useState(0)
    let [transactionId,setTransactionId] = useState('')
    let [submitBalance,setSubmitBalance] = useState(0)
    let [proofData,setProofData] = useState('')
    let [submit,setSubmit] = useState(0)

    let location = useLocation()
    let params = location.state || {}

    useEffect(() => {
        // 在组件渲染后执行的操作
        getStorageItem('ETH_ADDR').then(ethAddr=>{
            setSubmitAccount(ethAddr)
            getHoleskyEthBalance(bal=>{
                setSubmitBalance(bal)
            })
        })
        setTransactionId('0x'+params.txHash)
        setDepositAmount(params.amount/(10**8))
        setReceiveAccount('0x'+params.receive_address)
        getSingleProofData(params.txHash,proof=>{
            setProofData(proof)
        })
        return () => {
            // 在组件卸载前执行的清理操作
            console.log('Component will unmount');
        };
    }, []);
    function submitProof(){
        setSubmit(1)
        submitDepositProof(transactionId,proofData,flag=>{
            setSubmit(0)
            navigate('/Deposit')
            setTimeout(()=>{
                message.success('zkBTC minted')
            },3000)
        },e=>{
            setSubmit(0)
            message.open({
                type:'error',
                content:'submit proof failed'
            })
        })
    }

    function clickCancel(){
        navigate('/DepositHistory')
    }

    const proofInputChanged = (e)=>{
        let val = e.target.value
        setProofData(val)
    }

    const transactionInputChanged = (e)=>{
        let val = e.target.value
        setTransactionId(val)
    }

    return (
        <Spin size='large' spinning={submit}>
            <div className="submit-main">
                <img className="favor-icon" src={logo}/>
                <div className="submit-con">
                    <span className="title">Submit Proof</span>
                    <div className="submit-account-con">
                        <div className="row-item">
                            <span className="tips">Submit Account</span>
                            <div className="right-con">
                                <span className="value">{convertToCenterEplis(submitAccount,10)}</span>
                                <img src={down_arrow} className="down-arrow"/>
                            </div>
                        </div>
                        <div className="line"/>
                        <div className="row-item">
                            <span className="tips">tETH Balance</span>
                            <div className="right-con">
                                <span className="value">{formatNumber(submitBalance,6)}</span>
                                <img src={facut} className="facut hover-brighten-large"/>
                            </div>
                        </div>
                    </div>
                    <div className="proof-con">
                        <span className="title">Bitcoin Transaction Id</span>
                        <div className="info-con">
                            <textarea className="txt-val" value={transactionId} onChange={transactionInputChanged} style={{height:'40px'}}></textarea>
                            <img className="edit" src={edit}/>
                        </div>
                        <span className="title" style={{marginTop:"8px"}}>Proof Data</span>
                        <div className="info-con">
                            <textarea className="txt-val" value={proofData} onChange={proofInputChanged}></textarea>
                            <img className="edit hover-brighten-large" src={edit}/>
                        </div>

                        <div className="parse-con">
                            <div className="item">
                                <span className="tips">Deposit Amount: </span>
                                <span className="value">{convertToCenterEplis(depositAmount,8)}</span>
                                <span className="tips">tBTC</span>
                            </div>
                            <div className="item-vertical">
                                <span className="tips">Ethereum Receive Address: </span>
                                <span className="value">{receiveAccount}</span>
                            </div>
                        </div>
                    </div>
                    <div className="btn-con">
                        <div className="cancel hover-brighten" onClick={()=>{clickCancel()}}>Cancel</div>
                        <div className="confirm hover-brighten" onClick={submitProof}>Confirm</div>
                    </div>
                </div>
            </div>
        </Spin>
        )
}

export default SubmitProof
