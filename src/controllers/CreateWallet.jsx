import "./CreateWallet.scss"
import Header from "./Header.jsx";
import icon1 from "../assets/quanxian.png"
import icon2 from  "../assets/jinggao.png"
import icon3 from  "../assets/zhuyi-2.png"
import {useNavigate} from "react-router-dom";

function CreateWallet(){
    const navigate = useNavigate();

    function clickNext(){
        navigate('/BackupMnemonics')
    }
    return (
        <div className="create-main">
            <Header/>
            <div className="tip-con">
                <span className="title">Please read the following security tips before setting up your wallet.</span>
                <div className="warning-item">
                    <img className="icon" src={icon1}/>
                    <span className="text">Your mnemonics is the key to your wallet—anyone with it can take control. Keep it strictly confidential, away from anyone's reach, even officials.</span>
                </div>
                <div className="warning-item">
                    <img className="icon" src={icon3}/>
                    <span className="text">Record your mnemonic words accurately. Store it safely offline; do not share or keep it online.</span>
                </div>
                <div className="warning-item">
                    <img className="icon" src={icon2}/>
                    <span className="text">Remember that your password is only saved on your phone and cannot be recovered if lost.</span>
                </div>

                <div className="unlock-btn" onClick={clickNext}>Next</div>
            </div>
        </div>
    )
}

export default CreateWallet
