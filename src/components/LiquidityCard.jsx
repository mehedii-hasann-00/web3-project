import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { addLiquidity, uniswap_v2_router2_contract_address } from '../utils/uniswap_router';

export default function LiquidityCard({ setTokenInfo, tokenInfo, gas, ethBalance, networkInfo, connectWallet }) {
    const [tokenAmount, setTokenAmount] = useState('');
    const [ethAmount, setEthAmount] = useState('');
    const [isApproved, setIsApproved] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLiqAdded, setIsLiqAdded] = useState(false);
    const [liqHash, setLiqHash] = useState(false);


    // console.log(uniswap_v2_router2_contract_address[networkInfo.chainId])
    // console.log(networkInfo.chainId);

    useEffect(() => {
        if (tokenInfo.isApproved) {
            setIsApproved(true);
        }
    }, [])



    const handleAddLiquidity = async () => {
        try {
            if (!isApproved) {
                alert(`Please approve ${tokenInfo.name} first.`);
                return;
            }
            if (!tokenInfo.amount) {
                alert('Mint token to add liquidity');
                return;
            }
            if (tokenAmount === '' || ethAmount === '') {
                alert('Enter amount');
                return;
            }
            if ((gas + ethAmount) >= ethBalance) {
                alert("Enter lower amount to cover gas fee")
                return;
            }
            if (tokenAmount > tokenInfo.amount) {
                alert("Enter lower amount")
                return;
            }
            setIsLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const res = await addLiquidity(tokenInfo.tokenAddress, ethers.parseUnits(String(tokenAmount), 18), ethers.parseEther(String(ethAmount)), signer, uniswap_v2_router2_contract_address[networkInfo.chainId]);
            setLiqHash(res.hash);
            console.log(res);
            setIsLoading(false);
            setTokenInfo(() => {
                if (localStorage.getItem('tokenInfo')) {
                    let token = JSON.parse(localStorage.getItem('tokenInfo'));
                    token = { ...token, amount: tokenInfo.amount - tokenAmount,res:res };
                    localStorage.setItem('tokenInfo', JSON.stringify(token));
                    return token;
                }
            })
            setIsLiqAdded(true);
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            alert("Error in adding liquidity", error);
        }
    };
    async function approveToken() {
        try {
            if (!tokenInfo.tokenAddress) {
                alert("Mint token to approve")
                return;
            }
            setIsApproving(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const token = new ethers.Contract(tokenInfo.tokenAddress, tokenInfo.abi, signer);

            const tokenDecimals = 18;
            const amountInWei = ethers.parseUnits(tokenInfo.amount.toString(), tokenDecimals);

            // Approve the Uniswap router to spend the tokens on behalf of the user
            const tx = await token.approve(
                uniswap_v2_router2_contract_address[networkInfo.chainId],
                amountInWei
            );

            await tx.wait();
            setIsApproving(false);
            setIsApproved(true);
            setTokenInfo(() => {
                let token = JSON.parse(localStorage.getItem('tokenInfo'));
                token = { ...token, isApproved: true };
                localStorage.setItem('tokenInfo', JSON.stringify(token));
                return token;
            })
        } catch (error) {
            setIsApproving(false);
        }

    }

    const handle_eth_amount = (percent) => {
        let temp = ethBalance * (percent / 100);
        if (percent === 100) {
            setEthAmount(temp - gas);
        }
        setEthAmount(temp);
    }

    const handle_token_amount = (percent) => {
        if (!tokenInfo && !tokenInfo.amount) {
            return;
        }
        let temp = tokenInfo.amount * (percent / 100);
        setTokenAmount(temp);
    }

    // console.log(tokenInfo);
    return (
        <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-lg text-white">
            <h2 className="text-3xl font-bold text-center mb-6">
                Create Liquidity Pool
            </h2>

            <div class="mb-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                <p class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Supported Networks:
                </p>

                <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full hover:bg-blue-600 transition duration-150 cursor-default shadow-sm">
                        Sepolia
                    </span>
                    <span class="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full hover:bg-green-600 transition duration-150 cursor-default shadow-sm">
                        Unichain
                    </span>
                    <span class="px-3 py-1 bg-sky-500 text-white text-xs font-medium rounded-full hover:bg-sky-600 transition duration-150 cursor-default shadow-sm">
                        Arbitrum
                    </span>
                    <span class="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full hover:bg-red-600 transition duration-150 cursor-default shadow-sm">
                        Avalanche
                    </span>
                    <span class="px-3 py-1 bg-yellow-500 text-gray-900 text-xs font-medium rounded-full hover:bg-yellow-600 transition duration-150 cursor-default shadow-sm">
                        BNB Chain
                    </span>
                    <span class="px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full hover:bg-indigo-600 transition duration-150 cursor-default shadow-sm">
                        Base
                    </span>
                    <span class="px-3 py-1 bg-pink-500 text-white text-xs font-medium rounded-full hover:bg-pink-600 transition duration-150 cursor-default shadow-sm">
                        Optimism
                    </span>
                    <span class="px-3 py-1 bg-purple-500 text-white text-xs font-medium rounded-full hover:bg-purple-600 transition duration-150 cursor-default shadow-sm">
                        Polygon
                    </span>
                    <span class="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full hover:bg-orange-600 transition duration-150 cursor-default shadow-sm">
                        Blast
                    </span>
                    <span class="px-3 py-1 bg-lime-500 text-gray-900 text-xs font-medium rounded-full hover:bg-lime-600 transition duration-150 cursor-default shadow-sm">
                        Zora
                    </span>
                    <span class="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-full hover:bg-teal-600 transition duration-150 cursor-default shadow-sm">
                        Monad
                    </span>
                </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-md text-sm mb-4">
                <p><strong>Token:</strong> {!tokenInfo.name ? "Not deployed yet" : tokenInfo.name}</p>
                <p><strong>{networkInfo ? networkInfo.name : "Coin"} Balance:</strong> {ethBalance ? ethBalance : ethBalance}</p>
                <p><strong>Deployer {tokenInfo.name ? tokenInfo.name : 'Token'} Balance:</strong> {tokenInfo.amount ? tokenInfo.amount : 'Not Available'}</p>
                <p>estimated gas : {gas ? gas : null} {networkInfo ? networkInfo.name : ""}</p>
            </div>

            {/* Token 1 box */}
            <div className="rounded-2xl bg-gray-900/70 border border-gray-700 p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold p-6">
                            {networkInfo ? networkInfo.name : "Coin"}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{networkInfo ? networkInfo.name : "Coin"}</span>
                            <span className="text-[11px] text-gray-400">{networkInfo ? networkInfo.name : "Not available"}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-semibold">
                            <input value={ethAmount} onChange={(e) => setEthAmount(e.target.value)} type="number" placeholder={`Enter ${networkInfo.name} amount`} className="p-2 bg-gray-900 rounded-md" />
                        </div>
                        <div className="text-[11px] text-gray-400">~0.0 USD</div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 text-[11px]">
                    <button onClick={() => handle_eth_amount(25)} className="px-2 py-1 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                        25%
                    </button>
                    <button onClick={() => handle_eth_amount(50)} className="px-2 py-1 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                        50%
                    </button>
                    <button onClick={() => handle_eth_amount(100)} className="px-3 py-1 rounded-full bg-gray-800 font-semibold hover:bg-gray-700 transition">
                        MAX
                    </button>
                </div>
            </div>

            {/* Token 2 box */}
            <div className="rounded-2xl bg-gray-900/70 border border-gray-700 p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold p-6">
                            {tokenInfo.symbol ? tokenInfo.symbol : "Ticker"}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{tokenInfo.name ? tokenInfo.name : "Token Name"}</span>
                            <span className="text-[11px] text-gray-400">{networkInfo ? networkInfo.name : "Network Name"}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-semibold">
                            <input value={tokenAmount} onChange={e => setTokenAmount(e.target.value)} type="number" placeholder={`Enter ${tokenInfo.name} amount`} className="p-2 bg-gray-900 rounded-md" />
                        </div>
                        <div className="text-[11px] text-gray-400">~0.0 USD</div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 text-[11px]">
                    <button onClick={() => handle_token_amount(25)} className="px-2 py-1 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                        25%
                    </button>
                    <button onClick={() => handle_token_amount(50)} className="px-2 py-1 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                        50%
                    </button>
                    <button onClick={() => handle_token_amount(100)} className="px-3 py-1 rounded-full bg-gray-800 font-semibold hover:bg-gray-700 transition">
                        MAX
                    </button>
                </div>
            </div>

            {/* Totals / slippage */}
            <div className="text-sm mb-4 space-y-2">
                <div className="flex justify-between text-gray-200">
                    <span>Total</span>
                    <span>~$0.0</span>
                </div>
                {/* <div className="flex justify-between items-center text-gray-200">
                    <span>Slippage Tolerance</span>
                    <span className="flex items-center gap-2 text-xs">
                        <span className="bg-gray-900/80 px-2 py-1 rounded-full text-amber-300 flex items-center gap-1">
                            0%
                        </span>
                    </span>
                </div> */}
            </div>

            {/* Enable + Add buttons */}
            <div className="flex flex-col gap-3 mt-4">
                {networkInfo ?
                    (ethBalance <= gas ?
                        <p className="text-center text-white w-full py-3 rounded-full bg-gray-700 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr font-semibold text-md">
                            Not enough ETH available to cover gas fee
                        </p>
                        :
                        <>
                            {!isApproved ? <button disabled={isApproving ? true : false} onClick={approveToken} className="disabled:cursor-not-allowed disabled:opacity-50 text-white w-full py-3 rounded-full bg-gray-700 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr font-semibold text-sm">
                                {isApproving ? <i className="fa fa-solid fa-spinner fa-spin"></i>
                                    : <>Approve {tokenInfo.name ? tokenInfo.name : 'token'}</>}
                            </button>
                                :
                                <button className="text-white w-full py-3 rounded-full bg-gray-700 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr font-semibold text-sm ">
                                    Approved {tokenInfo.name ? tokenInfo.name : null} <i class="fa fa-solid fa-check"></i>
                                </button>
                            }

                            {!isLiqAdded ? <button disabled={isLoading ? true : false} onClick={handleAddLiquidity} className="disabled:cursor-not-allowed disabled:opacity-50 text-white w-full py-3 rounded-full bg-gray-700 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr font-semibold text-sm">
                                {isLoading ? <i className="fa fa-solid fa-spinner fa-spin"></i>
                                    : <>Add Liquidity</>}
                            </button>
                                :
                                <>

                                    <button className="text-white w-full py-3 rounded-full bg-gray-700 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr font-semibold text-sm ">
                                        Liquidity Added <i class="fa fa-solid fa-check"></i>
                                    </button>
                                    {liqHash && (
                                        <div className="flex gap-2">
                                            <p className="mt-4 text-center text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                                <strong>Tx Hash :</strong> {liqHash}
                                            </p>
                                            <i class="fa fa-regular fa-copy cursor-pointer mt-4" onClick={() => {
                                                navigator.clipboard.writeText(liqHash);
                                                alert("Copy succesful");
                                            }}></i>
                                        </div>
                                    )}

                                </>

                            }

                        </>
                    )
                    :
                    <button onClick={connectWallet} className="text-white w-full py-3 rounded-full bg-gray-700 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr font-semibold text-sm">
                        Connect Wallet
                    </button>
                }

            </div>
        </div>
    );
}
