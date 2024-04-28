import "./Header.scss"
import logo from "../assets/logo.png"

function Header(){
    return (
        <div className="header-common">
            <img src={logo} className="favor-icon"/>
            <span className="title-h">Testnet Wallet</span>
            <span className="des">extension</span>
        </div>
    )
}

export default Header
