import "./ImportWallet.scss"
import right_arrow from "../assets/you-jiantou.png"
import Header from "./Header.jsx";
import {useNavigate} from "react-router-dom";
import waring_icon from '../assets/zhuyi-2.png'

function ImportWallet(){
    const navigate = useNavigate();
    function clickCreate(){
        navigate('/CreateWallet')
    }

    function clickImportMnemonics(){
        navigate('/ImportByMnemonics')
    }

    function clickImportPrivateKey(){
        navigate('/ImportByPrivateKey')
    }

    return(
        <div className="import-main">
            <Header/>
            <div className="import-wal">
                <div className="import-con">
                    <span className="tips">Create a new wallet</span>
                    <div className="import-item">
                        <div className="inner-con hover-brighten" onClick={clickCreate}>
                            <span className="title">Create my wallet</span>
                            <img src={right_arrow} className="icon"/>
                        </div>
                    </div>
                </div>
                <div className="import-con" style={{marginTop:"30px"}}>
                    <span className="tips">Already have one，import here</span>
                    <p className='waring-con'>
                        <img src={waring_icon} className='icon'/>
                        Warning: the current wallet extension is only used for the zkBTC testnet. For the safety of your assets, please do not import your wallets that store other main network assets.
                    </p>
                    <div className="import-item" onClick={clickImportMnemonics}>
                        <div className="inner-con  hover-brighten">
                            <span className="title">Import by mnemonics</span>
                            <img src={right_arrow} className="icon"/>
                        </div>
                    </div>
                    {/*<div className="import-item hover-brighten" style={{marginTop:"12px"}} onClick={clickImportPrivateKey}>*/}
                    {/*    <div className="inner-con  hover-brighten">*/}
                    {/*        <span className="title">Import by private keys</span>*/}
                    {/*        <img src={right_arrow} className="icon"/>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    )
}

export default ImportWallet
