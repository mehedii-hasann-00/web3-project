// LiquidityCard.jsx
import React from "react";

export default function LiquidityCard({ tokenAddress, usdtAddress, name, symbol, networkInfo, tokenAmount, ethAmount }) {

    const handleAddLiquidity = async () => {
        try {
            // Ensure the wallet is connected and signer is available
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                // Call the add liquidity function
                await addLiquidity(tokenAddress, ethers.utils.parseUnits(tokenAmount, 18), ethers.utils.parseEther(ethAmount), signer);
            } else {
                alert("Please install MetaMask to use this functionality.");
            }
        } catch (error) {
            console.error("Error in adding liquidity", error);
        }
    };

    return (
        <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-lg text-white">
            <h2 className="text-3xl font-bold text-center mb-6">
                Create Liquidity Pool
            </h2>

            <div className="bg-gray-700 p-3 rounded-md text-sm mb-4">
                <p><strong>Your Token:</strong> {name ? name : "Not deployed yet"}</p>
            </div>

            {/* Token 1 box */}
            <div className="rounded-2xl bg-gray-900/70 border border-gray-700 p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold p-6">
                            ETH
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">ETH</span>
                            <span className="text-[11px] text-gray-400">{networkInfo ? networkInfo.name : "Not available"}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-semibold">
                            <input type="number" />
                        </div>
                        <div className="text-[11px] text-gray-400">~0.0 USD</div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 text-[11px]">
                    <button className="px-2 py-1 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                        25%
                    </button>
                    <button className="px-2 py-1 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                        50%
                    </button>
                    <button className="px-3 py-1 rounded-full bg-gray-800 font-semibold hover:bg-gray-700 transition">
                        MAX
                    </button>
                </div>
            </div>

            {/* Token 2 box */}
            <div className="rounded-2xl bg-gray-900/70 border border-indigo-500 p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold p-6">
                            {symbol ? symbol : "Ticker"}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{name ? name : "Token Name"}</span>
                            <span className="text-[11px] text-gray-400">{networkInfo ? networkInfo.name : "Network Name"}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-semibold">0</div>
                        <div className="text-[11px] text-gray-400">~0.00 USD</div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 text-[11px]">
                    <button className="px-2 py-1 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                        25%
                    </button>
                    <button className="px-2 py-1 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                        50%
                    </button>
                    <button className="px-3 py-1 rounded-full bg-gray-800 font-semibold hover:bg-gray-700 transition">
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
                <div className="flex justify-between items-center text-gray-200">
                    <span>Slippage Tolerance</span>
                    <span className="flex items-center gap-2 text-xs">
                        <span className="bg-gray-900/80 px-2 py-1 rounded-full text-amber-300 flex items-center gap-1">
                            0%
                        </span>
                    </span>
                </div>
            </div>

            {/* Enable + Add buttons */}
            <div className="flex flex-col gap-3 mt-4">
                <button className="text-white w-full py-3 rounded-full text-black font-semibold text-sm bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr transition cursor-not-allowed">
                    Enable USDT
                </button>
                <button className="text-white w-full py-3 rounded-full  text-black font-semibold text-sm bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr transition cursor-not-allowed">
                    Enable WoD
                </button>
                <button className="text-white w-full py-3 rounded-full bg-gray-700 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr font-semibold text-sm cursor-not-allowed">
                    Add Liquidity
                </button>
            </div>
        </div>
    );
}
