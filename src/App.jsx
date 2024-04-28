import { useState } from 'react'
import {HashRouter, Routes, Route} from "react-router-dom";
import './App.css'
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Unlock from "./controllers/Unlock.jsx";
import Deposit from "./controllers/Deposit.jsx";
import ImportWallet from "./controllers/ImportWallet.jsx";
import CreateWallet from "./controllers/CreateWallet.jsx";
import BackupMnemonics from "./controllers/BackupMnemonics.jsx";
import SetUnlockPassword from "./controllers/SetUnlockPassword.jsx";
import ImportByMnemonics from "./controllers/ImportByMnemonics.jsx";
import ImportByPrivateKey from "./controllers/ImportByPrivateKey.jsx";
import DepositSign from "./controllers/DepositSign.jsx";
import RedeemSign from "./controllers/RedeemSign.jsx";
import ConnectRequest from "./controllers/ConnectRequest.jsx";
import DepositHistory from "./controllers/DepositHistory.jsx";
import SubmitProof from "./controllers/SubmitProof.jsx";

const AnimatedPageSwitcher = ({ children }) => {
    return (
        <TransitionGroup className="page-transition-group">
            <CSSTransition
                key={window.location.pathname}
                timeout={300}
                classNames="page-transition"
            >
                {children}
            </CSSTransition>
        </TransitionGroup>
    );
};
function App() {
  return (
          <HashRouter>
              <AnimatedPageSwitcher >
                  <Routes>
                      <Route path='/' element={<Unlock />}/>
                      <Route path='/Unlock' element={<Unlock />}/>
                      <Route path='/Deposit' element={<Deposit/>}/>
                      <Route path='/ImportWallet' element={<ImportWallet/>}/>
                      <Route path='/CreateWallet' element={<CreateWallet/>}/>
                      <Route path='/BackupMnemonics' element={<BackupMnemonics/>}/>
                      <Route path='/SetUnlockPassword' element={<SetUnlockPassword/>}/>
                      <Route path='/ImportByMnemonics' element={<ImportByMnemonics/>}/>
                      <Route path='/ImportByPrivateKey' element={<ImportByPrivateKey/>}/>
                      <Route path='/DepositSign' element={<DepositSign/>}/>
                      <Route path='/RedeemSign' element={<RedeemSign/>}/>
                      <Route path='/ConnectRequest' element={<ConnectRequest/>}/>
                      <Route path='/DepositHistory' element={<DepositHistory/>}/>
                      <Route path='/SubmitProof' element={<SubmitProof/>}/>
                  </Routes>
              </AnimatedPageSwitcher>
          </HashRouter>
  )
}

export default App
