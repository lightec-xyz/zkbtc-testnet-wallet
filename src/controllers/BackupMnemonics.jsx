import "./BackupMnemonics.scss"
import Header from "./Header.jsx";
import copy from "../assets/fuzhi-3.png"
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {generateMnemonics} from "../utils/create.jsx";
import {message} from "antd";

function BackupMnemonics(){
    const navigate = useNavigate();
    let [mnemonics,setMnemonics] = useState('')

    useEffect(() => {
        let mne = generateMnemonics()
        setMnemonics(mne)
        // 在组件渲染后执行的操作
        return () => {
            // 在组件卸载前执行的清理操作
            console.log('Component will unmount');
        };
    }, []);

    function clickNext(){
        let params = {
            IMPORT_TYPE:'create_wallet',
            CREATE_MNEMONICS:mnemonics
        }
        navigate(`/SetUnlockPassword`,{state:params})
    }

    function clickCopy(){
        const textArea = document.createElement("textarea");
        textArea.value = mnemonics;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        message.success('mnemonics copied')
    }

    return (
        <div className="backup-main">
            <Header/>
            <div className="backup-con">
            <span className="title">Please back up your mnemonic phrase
and keep it safe</span>
                <div className="mnemonics-con">
                    <span className="mnemonics-text">{mnemonics}</span>
                </div>
                <div className="copy-con" onClick={clickCopy}>
                    <span className="tips">Copy mnemonics</span>
                    <img className="icon" src={copy}/>
                </div>
                <div className="btn-con">
                    <span className="tips">I have backup the mnemonic phrase above</span>
                    <div className="unlock-btn" onClick={clickNext}>Next</div>
                </div>
            </div>
        </div>
    )
}

export default BackupMnemonics
