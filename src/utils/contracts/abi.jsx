export const zkBTCAbi = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name_",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "symbol_",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_new",
                "type": "address"
            }
        ],
        "name": "addOperator",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_new",
                "type": "address"
            }
        ],
        "name": "removeOperator",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
export const zkBTCBridgeAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_feeAccount",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "_changeLockScript",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "_multiSigScript",
                "type": "bytes"
            },
            {
                "internalType": "contract UTXOManagerInterface",
                "name": "_utxoAddress",
                "type": "address"
            },
            {
                "internalType": "contract LITInterface",
                "name": "_litAddress",
                "type": "address"
            },
            {
                "internalType": "contract zkBTCInterface",
                "name": "_zkBTCAddress",
                "type": "address"
            },
            {
                "internalType": "contract EconomicVariationInterface",
                "name": "_variationAddress",
                "type": "address"
            },
            {
                "internalType": "contract IBtcTxVerifier",
                "name": "_txVerifier",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "DepositAccountIsBridge",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "balance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
            }
        ],
        "name": "InsufficientBalance",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "proofData",
                "type": "bytes"
            }
        ],
        "name": "InvalidChangeProof",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "depositAmount",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "minDepositAmount",
                "type": "uint64"
            }
        ],
        "name": "InvalidDepositAmount",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "lockScriptLength",
                "type": "uint256"
            }
        ],
        "name": "InvalidLockScriptLength",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "lockScript",
                "type": "bytes"
            }
        ],
        "name": "LockScriptIsChange",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "rawTx",
                "type": "bytes"
            },
            {
                "indexed": false,
                "internalType": "bytes32[]",
                "name": "sigHashs",
                "type": "bytes32[]"
            }
        ],
        "name": "CreateRedeemUnsignedTx",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_new",
                "type": "address"
            }
        ],
        "name": "addOperator",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "changeLockScript",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "economicVariation",
        "outputs": [
            {
                "internalType": "contract EconomicVariationInterface",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feeAccount",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "addr",
                "type": "address"
            }
        ],
        "name": "isOperator",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "litToken",
        "outputs": [
            {
                "internalType": "contract LITInterface",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "minDepositAmount",
        "outputs": [
            {
                "internalType": "uint64",
                "name": "",
                "type": "uint64"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "multiSigScript",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_new",
                "type": "address"
            }
        ],
        "name": "removeOperator",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalDepositAmount",
        "outputs": [
            {
                "internalType": "uint64",
                "name": "",
                "type": "uint64"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "txVerifier",
        "outputs": [
            {
                "internalType": "contract IBtcTxVerifier",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "utxoManager",
        "outputs": [
            {
                "internalType": "contract UTXOManagerInterface",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "zkBTCToken",
        "outputs": [
            {
                "internalType": "contract zkBTCInterface",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract EconomicVariationInterface",
                "name": "_newAddress",
                "type": "address"
            }
        ],
        "name": "updateEconomicAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IBtcTxVerifier",
                "name": "_newVerifier",
                "type": "address"
            }
        ],
        "name": "updateTxVerifier",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract UTXOManagerInterface",
                "name": "_utxoAddress",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "_changeLockScript",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "_multiSigScript",
                "type": "bytes"
            }
        ],
        "name": "updateUtxoAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "rawTx",
                "type": "bytes"
            }
        ],
        "name": "removeWitness",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "rawBtcTx",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "proofData",
                "type": "bytes"
            }
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "targetAmount",
                "type": "uint64"
            }
        ],
        "name": "estimateTxWeight",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "redeemAmount",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "btcMinerFee",
                "type": "uint64"
            },
            {
                "internalType": "bytes",
                "name": "receiveLockScript",
                "type": "bytes"
            }
        ],
        "name": "redeem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "userAmount",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "changeAmount",
                "type": "uint64"
            },
            {
                "internalType": "bytes",
                "name": "receiveLockScript",
                "type": "bytes"
            }
        ],
        "name": "getTxOuts",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "value",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bytes",
                        "name": "pkScript",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct BtcTxLib.TxOut[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "proofData",
                "type": "bytes"
            }
        ],
        "name": "updateChange",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "getBridgeDepositToll",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "userAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "feeAmount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "getBridgeRedeemToll",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "userAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "feeAmount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "feeAmount",
                "type": "uint256"
            }
        ],
        "name": "getDepositLITMintAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "feeAmount",
                "type": "uint256"
            }
        ],
        "name": "getRedeemLITMintAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

export const UTXOAbi = [
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            }
        ],
        "name": "ChangeIsNotExisted",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            }
        ],
        "name": "ChangeIsUpdated",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "totalAmount",
                "type": "uint64"
            },
            {
                "internalType": "uint64",
                "name": "amount",
                "type": "uint64"
            }
        ],
        "name": "InsufficientTotalAmount",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "amount",
                "type": "uint64"
            }
        ],
        "name": "InvalidAmount",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            }
        ],
        "name": "UTXOIsExisted",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "limit",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "utxoCount",
                "type": "uint8"
            }
        ],
        "name": "UtxoExceedLimit",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "uint32",
                "name": "index",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "uint64",
                "name": "amount",
                "type": "uint64"
            }
        ],
        "name": "UTXOAdd",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "UTXOAddBatchSucess",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "uint32",
                "name": "index",
                "type": "uint32"
            },
            {
                "indexed": false,
                "internalType": "uint64",
                "name": "amount",
                "type": "uint64"
            }
        ],
        "name": "UTXOUpdate",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_new",
                "type": "address"
            }
        ],
        "name": "addOperator",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "addr",
                "type": "address"
            }
        ],
        "name": "isOperator",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_new",
                "type": "address"
            }
        ],
        "name": "removeOperator",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalAvailableAmount",
        "outputs": [
            {
                "internalType": "uint64",
                "name": "",
                "type": "uint64"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "utxos",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            },
            {
                "internalType": "uint32",
                "name": "index",
                "type": "uint32"
            },
            {
                "internalType": "uint64",
                "name": "amount",
                "type": "uint64"
            },
            {
                "internalType": "bool",
                "name": "isChangeConfirmed",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            }
        ],
        "name": "utxoOf",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "txid",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "index",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint64",
                        "name": "amount",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bool",
                        "name": "isChangeConfirmed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct UTXOManager.UTXO",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getUtxosAvailableKeys",
        "outputs": [
            {
                "internalType": "bytes32[]",
                "name": "",
                "type": "bytes32[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            },
            {
                "internalType": "uint32",
                "name": "index",
                "type": "uint32"
            },
            {
                "internalType": "uint64",
                "name": "amount",
                "type": "uint64"
            }
        ],
        "name": "addUTXO",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            },
            {
                "internalType": "uint32",
                "name": "index",
                "type": "uint32"
            },
            {
                "internalType": "uint64",
                "name": "amount",
                "type": "uint64"
            }
        ],
        "name": "addChange",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "txid",
                "type": "bytes32"
            }
        ],
        "name": "updateChange",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "targetAmount",
                "type": "uint64"
            }
        ],
        "name": "spentUTXOs",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "txid",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "index",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint64",
                        "name": "amount",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bool",
                        "name": "isChangeConfirmed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct UTXOManager.UTXO[]",
                "name": "foundUTXOs",
                "type": "tuple[]"
            },
            {
                "internalType": "uint64",
                "name": "totalAmount",
                "type": "uint64"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "targetAmount",
                "type": "uint64"
            }
        ],
        "name": "findUTXOs",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "txid",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "index",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint64",
                        "name": "amount",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bool",
                        "name": "isChangeConfirmed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct UTXOManager.UTXO[]",
                "name": "findedUTXOs",
                "type": "tuple[]"
            },
            {
                "internalType": "uint64",
                "name": "totalAmount",
                "type": "uint64"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "txid",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "index",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint64",
                        "name": "amount",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bool",
                        "name": "isChangeConfirmed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct UTXOManager.UTXO[]",
                "name": "inputs",
                "type": "tuple[]"
            },
            {
                "components": [
                    {
                        "internalType": "uint64",
                        "name": "value",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bytes",
                        "name": "pkScript",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct BtcTxLib.TxOut[]",
                "name": "outputs",
                "type": "tuple[]"
            }
        ],
        "name": "createUnsignedTx",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bytes4",
                        "name": "version",
                        "type": "bytes4"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "hash",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint32",
                                "name": "index",
                                "type": "uint32"
                            },
                            {
                                "internalType": "bytes",
                                "name": "script",
                                "type": "bytes"
                            },
                            {
                                "internalType": "bytes[]",
                                "name": "witness",
                                "type": "bytes[]"
                            },
                            {
                                "internalType": "bytes4",
                                "name": "sequence",
                                "type": "bytes4"
                            }
                        ],
                        "internalType": "struct BtcTxLib.TxIn[]",
                        "name": "txIns",
                        "type": "tuple[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint64",
                                "name": "value",
                                "type": "uint64"
                            },
                            {
                                "internalType": "bytes",
                                "name": "pkScript",
                                "type": "bytes"
                            }
                        ],
                        "internalType": "struct BtcTxLib.TxOut[]",
                        "name": "txOuts",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "bytes4",
                        "name": "lockTime",
                        "type": "bytes4"
                    }
                ],
                "internalType": "struct BtcTxLib.MsgTx",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "bytes4",
                        "name": "version",
                        "type": "bytes4"
                    },
                    {
                        "components": [
                            {
                                "internalType": "bytes32",
                                "name": "hash",
                                "type": "bytes32"
                            },
                            {
                                "internalType": "uint32",
                                "name": "index",
                                "type": "uint32"
                            },
                            {
                                "internalType": "bytes",
                                "name": "script",
                                "type": "bytes"
                            },
                            {
                                "internalType": "bytes[]",
                                "name": "witness",
                                "type": "bytes[]"
                            },
                            {
                                "internalType": "bytes4",
                                "name": "sequence",
                                "type": "bytes4"
                            }
                        ],
                        "internalType": "struct BtcTxLib.TxIn[]",
                        "name": "txIns",
                        "type": "tuple[]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint64",
                                "name": "value",
                                "type": "uint64"
                            },
                            {
                                "internalType": "bytes",
                                "name": "pkScript",
                                "type": "bytes"
                            }
                        ],
                        "internalType": "struct BtcTxLib.TxOut[]",
                        "name": "txOuts",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "bytes4",
                        "name": "lockTime",
                        "type": "bytes4"
                    }
                ],
                "internalType": "struct BtcTxLib.MsgTx",
                "name": "msgTx",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "multiSigScript",
                "type": "bytes"
            },
            {
                "components": [
                    {
                        "internalType": "bytes32",
                        "name": "txid",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "index",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint64",
                        "name": "amount",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bool",
                        "name": "isChangeConfirmed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct UTXOManager.UTXO[]",
                "name": "inputs",
                "type": "tuple[]"
            }
        ],
        "name": "calcSigHashs",
        "outputs": [
            {
                "internalType": "bytes32[]",
                "name": "",
                "type": "bytes32[]"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    }
]
export const ZKBTC_ADDRESS = '0xbf3041e37be70a58920a6fd776662b50323021c9'
export const ZKBTC_BRIDGE_ADDRESS = '0x8e4f5a8f3e24a279d8ed39e868f698130777fded'
export const UTXO_ADDRESS = '0x9d2aaEa60DEe441981Edf44300c26F1946411548'
export const SYS_BITCOIN_ADDRESS = 'tb1qtysxx7zkmm5nwy0hv2mjxfrermsry2vjsygg0eqawwwp6gy4hl4s2tudtw'
export const HOLESKY_NODE = 'https://testnet.zkbtc.money/holesky/'

export const PROOF_HOST = 'https://testnet.zkbtc.money/api'

export const NODE_USERNAME = 'lightec'

export const NODE_PASSWORD = 'Abcd1234'

export const NODE_RPC = 'http://18.116.118.39:18332'
