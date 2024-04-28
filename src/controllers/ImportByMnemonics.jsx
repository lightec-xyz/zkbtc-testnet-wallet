import './ImportByMnemonics.scss'
import Header from "./Header.jsx";
import clear_icon from '../assets/clear.png'
import {useNavigate} from "react-router-dom";
import {message} from "antd";
import {useState} from "react";
import {validateMnemonic} from "bip39";

function ImportByMnemonics(){
    const navigate = useNavigate();
    let [words,setWords] = useState(Array.from({length:12}))
    let [enable,setEnable] = useState(0)

    function clickImport(){
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

        let params = {
            IMPORT_TYPE:'import_mnemonics',
            IMPORT_MNEMONICS:mnemonics
        }

        navigate(`/SetUnlockPassword`,{state:params})
    }

    function checkWordsFull(){
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
                <div className="gird-con">
                    <div className="grid-item">
                        <span className="index-num">1</span>
                        <input className="word-text" value={words[0]} id={1} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">2</span>
                        <input className="word-text" id={2} value={words[1]} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">3</span>
                        <input className="word-text" id={3} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">4</span>
                        <input className="word-text" id={4} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">5</span>
                        <input className="word-text" id={5} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">6</span>
                        <input className="word-text" id={6} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">7</span>
                        <input className="word-text" id={7} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">8</span>
                        <input className="word-text" id={8} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">9</span>
                        <input className="word-text" id={9} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">10</span>
                        <input className="word-text" id={10} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">11</span>
                        <input className="word-text" id={11} onChange={inputPhrase}/>
                    </div>
                    <div className="grid-item">
                        <span className="index-num">12</span>
                        <input className="word-text" id={12} onChange={inputPhrase}/>
                    </div>
                </div>
                {
                    enable == 0 ? <div className="btn-disable">Import</div> :
                        <div className="btn-enable hover-brighten" onClick={clickImport}>Import</div>
                }

            </div>
        </div>
    )
}

export default ImportByMnemonics
