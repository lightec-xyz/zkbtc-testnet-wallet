import './ImportByPriviteKey.scss'
import Header from "./Header.jsx";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {getPrivateKey} from "../utils/create.jsx";

function importByPrivateKey(){
    let [privateKey,setPrivateKey] = useState('')
    const navigate = useNavigate();

    function clickImport(){
        let params = {
            IMPORT_TYPE:'private_key',
            IMPORT_KEY:privateKey
        }
        navigate(`/SetUnlockPassword`,{state:params})
    }

    const inputPrivateKey = e=>{
        let val = e.target.value
        setPrivateKey(val)
    }
    return (
        <div className="pr-main">
            <Header/>
            <div className="pr-con">
                <span className="tips">Enter private key</span>
                <textarea className='pr-input' onChange={inputPrivateKey}/>
                <div className="pr-btn-enable hover-brighten" onClick={clickImport}>Import</div>
            </div>
        </div>
    )
}

export default importByPrivateKey
