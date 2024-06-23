import './ImportByMnemonics.scss'
import Header from "./Header.jsx";
import clear_icon from '../assets/clear.png'
import {useNavigate} from "react-router-dom";
import {message} from "antd";
import {useEffect, useState} from "react";
import {validateMnemonic} from "bip39";
import {checkWalletExistsByMnemonics} from "../utils/create"

function ImportByMnemonics(){
    const navigate = useNavigate();
    let [words,setWords] = useState(Array.from({length:12}))
    let [enable,setEnable] = useState(0)
    let [mnemonics,setMnemonics] = useState('')

    useEffect(() => {
        const handlePaste = (e) => {
            const pastedData = e.clipboardData.getData('text');
            let seps = pastedData.split(' ')
            if(seps.length == 0){
                seps = pastedData.split(',')
            }
            if(seps.length > 2 && seps.length != 12){
                message.open({
                    type:'error',
                    content:'Pasted format invalid'
                })
                return
            }

            if(seps.length == 12){
                e.preventDefault();
                setWords(seps)
                setMnemonics(pastedData)
                setEnable(1)
            }
        };

        window.addEventListener('paste', handlePaste);

        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [mnemonics]);

    async function clickImport(){
        if(checkWordsFull() == false){
            message.open({
                type:'error',
                content:'words invalid'
            })
            return
        }

        let mnemonics = words.join(' ')
        if(validateMnemonic(mnemonics) == false){
            message.open({
                type:'error',
                content:'mnemonics invalid'
            })
            return
        }

        let exist = await checkWalletExistsByMnemonics(mnemonics)
        if(exist != false){
            message.open({
                type:'error',
                content:'The same wallet has been imported.'
            })
            return
        }

        let params = {
            IMPORT_TYPE:'import_mnemonics',
            IMPORT_MNEMONICS:mnemonics
        }

        navigate(`/SetUnlockPassword`,{state:params})
    }

    function checkWordsFull(){
        console.log('words =>',words)
        for(let i=0;i<12;i++){
            if(words[i] == undefined || words[i].length < 2){
                setEnable(0)
                return false
            }
        }
        setEnable(1)
        return true
    }

    const inputPhrase = e=>{
        let id = e.target.id
        let val = e.target.value
        words[id-1] = val
        checkWordsFull()
    }

    function clickClear(){
        let newWords = Array.from({length:12})
        setWords(newWords)
        checkWordsFull()
    }

    const handleKeyDown = e=>{
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            clickImport()
        }
    }

    return (
        <div className="mn-main">
            <Header/>
            <div className="mn-con">
                <div className="tips-con">
                    <span className="tips">Enter mnemonics</span>
                    {/*<div className="clear-con hover-brighten" onClick={clickClear}>*/}
                    {/*    <img src={clear_icon} className="icon"/>*/}
                    {/*    <span className="title">clear</span>*/}
                    {/*</div>*/}
                </div>
                <form className="gird-con" onKeyDown={handleKeyDown}>
                    {
                        words.map((word,index)=>(
                            // eslint-disable-next-line react/jsx-key
                            <div className="grid-item">
                                <span className="index-num">{index+1}</span>
                                <input className="word-text" value={word} id={index+1} onChange={inputPhrase}/>
                            </div>
                        ))
                    }
                </form>
                {
                    enable == 0 ? <div className="btn-disable">Import</div> :
                        <div className="btn-enable hover-brighten" onClick={clickImport}>Import</div>
                }

            </div>
        </div>
    )
}

export default ImportByMnemonics
