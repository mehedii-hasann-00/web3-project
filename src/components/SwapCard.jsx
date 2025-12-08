import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { getRouterContract, uniswap_v2_router2_contract_address, wrapped_adrs } from '../utils/uniswap_router';

const SwapCard = ({ setTokenInfo, tokenInfo, gas, ethBalance, networkInfo, connectWallet }) => {

  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellToken, setSellToken] = useState(tokenInfo.name || 'Token');
  const [buyToken, setBuyToken] = useState('ETH');
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const slippageTolerance = 0.005; // 0.5% standard slippage

  useEffect(() => {
    // Only fetch quote if we have a sell amount and are connected
    if (sellAmount && sellAmount > 0 && networkInfo && networkInfo.chainId) {
      const fetchQuote = async () => {
        try {
          // For simplicity, we assume the user is selling your custom token for ETH
          if (sellToken !== tokenInfo.name || buyToken !== 'ETH') return;
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          const estimatedOutput = await getEstimatedAmountOut(
            tokenInfo.tokenAddress,
            sellAmount,
            networkInfo,
            signer,
            uniswap_v2_router2_contract_address[networkInfo.chainId]
          );

          // Update the "You Receive" field
          setBuyAmount(estimatedOutput);

        } catch (error) {
          console.error("Error fetching quote:", error);
          setBuyAmount('0');
        }
      };

      // ⚠️ OPTIONAL: You might want to debounce this call for better performance
      fetchQuote();
    } else {
      setBuyAmount('');
    }
  }, [sellAmount, tokenInfo.tokenAddress, sellToken, buyToken, networkInfo, uniswap_v2_router2_contract_address[networkInfo.chainId]]);



  async function getEstimatedAmountOut(tokenAddress, amountIn, networkInfo, signer, routerAddress) {
    const routerContract = await getRouterContract(signer, routerAddress);
    const path = [tokenAddress, wrapped_adrs[networkInfo.chainId]];
    const amountInWei = ethers.parseUnits(String(amountIn), 18);
    try {
      const amounts = await routerContract.getAmountsOut(amountInWei, path);

      const amountOutWei = amounts[1];

      const amountOut = ethers.formatEther(amountOutWei);

      return amountOut;
    } catch (error) {
      console.error("Error fetching quote (getAmountsOut):", error);
      return '0';
    }
  }

  async function swapTokensForETH(tokenAddress, amountIn, amountOutMin, networkInfo, routerAddress) {
    if (amountIn === '' || amountIn <= 0 || amountOutMin === '') {
      alert('enter amount');
      return;
    }
    setIsSwapped(false);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const routerContract = await getRouterContract(signer, routerAddress);
    const path = [tokenAddress, wrapped_adrs[networkInfo.chainId]];
    const amountInWei = ethers.parseUnits(String(amountIn), 18);
    const amountOutMinWei = ethers.parseEther(String(amountOutMin));

    const to = await signer.getAddress();
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    console.log(`Executing swap: Selling ${amountIn} for at least ${amountOutMin} ETH.`);
    setIsLoading(true);
    try {
      const tx = await routerContract.swapExactTokensForETH(
        amountInWei,
        amountOutMinWei,
        path,
        to,
        deadline
      );
      const receipt = await tx.wait();
      if (receipt && receipt.status === 1) {
        setIsSwapped({status:true,gone_amount:sellAmount,received_amount:buyAmount});
        setSellAmount('');
        setBuyAmount('');
      }

    } catch (error) {
      // This block catches:
      // a) Wallet rejection (user clicked cancel).
      // b) Failed transaction (Ethers throws a 'CALL_EXCEPTION' or similar when wait() reverts).
      console.error("Swap transaction failed:", error);
      alert("Swap failed.");
      // FAILURE LOGIC HERE
    }
    setIsLoading(false);
  }

  return (
    <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-lg text-white">
      <h2 className="text-3xl font-bold text-center mb-6">
        SWAP
      </h2>

      <div className="space-y-1 mb-6 relative">
        <div className='rounded-2xl bg-gray-900/70 border border-gray-700 p-6'>
          <div className='flex justify-between mb-4'>
            <div>
              <label className="block text-sm mb-2">Sell</label>
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

          <div className="flex items-between space-x-2">
            <input
              type="number"
              placeholder="0"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-600 focus:outline-none"
            />
            <div className="relative">
              <select
                value={sellToken}
                className="absolute inset-y-0 right-0 px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-r-lg focus:outline-none"
                onChange={(e) => setSellToken(e.target.value)}
              >
                <option value={tokenInfo && tokenInfo.name ? tokenInfo.name : ''}>{tokenInfo && tokenInfo.name ? tokenInfo.name : ''}</option>
                <option value="ETH">ETH</option>
                {/* Add more tokens */}
              </select>
            </div>
          </div>
        </div>

        {/* Arrow Divider */}
        <div className="absolute flex justify-center top-[45%] right-[50%] bg-gray-800 rounded-xl">
          <span className="text-3xl text-gray-200 border-4 border-black px-2 rounded-xl">↓</span>
        </div>

        {/* Buy Token Section */}
        <div className='rounded-2xl bg-gray-900/70 border border-gray-700 p-6'>
          <label className="block text-sm mb-2">Buy</label>
          <div className="flex items-between space-x-2">
            <input
              type="number"
              placeholder="0"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-600 focus:outline-none"
            />
            <div className="relative">
              <select
                value={buyToken}
                onChange={(e) => setBuyToken(e.target.value)}
                className="absolute inset-y-0 right-0 px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-r-lg focus:outline-none"
              >
                <option value={tokenInfo && tokenInfo.name ? tokenInfo.name : ''}>{tokenInfo && tokenInfo.name ? tokenInfo.name : ''}</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </div>
        </div>
      </div>


      {sellAmount && buyAmount && parseFloat(sellAmount) > 0 && parseFloat(buyAmount) > 0 && (
        <div className="text-sm mb-4 space-y-2 p-3 bg-gray-700 rounded-lg">
          <div className="flex justify-between text-gray-200">
            <span>Price</span>
            <span>1 {sellToken} ≈ {(parseFloat(buyAmount) / parseFloat(sellAmount)).toFixed(6)} {buyToken}</span>
          </div>
          <div className="flex justify-between text-gray-200">
            <span>Minimum Received</span>
            <span className="text-sm text-green-400">{(parseFloat(buyAmount) * (1 - slippageTolerance)).toFixed(6)} {buyToken}</span>
          </div>
          <div className="flex justify-between text-gray-200">
            <span>Slippage Tolerance</span>
            <span>{slippageTolerance * 100}%</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button disabled={isLoading ? true : false}
        onClick={() => swapTokensForETH(tokenInfo.tokenAddress, sellAmount, buyAmount, networkInfo, uniswap_v2_router2_contract_address[networkInfo.chainId])}
        className="text-white w-full py-3 rounded-full bg-gray-700 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr font-semibold text-sm"
      >
        {isLoading ? <i className="fa fa-solid fa-spinner fa-spin"> </i> : 'Swap'}
      </button>

      {isSwapped && (
        <div className="text-sm mb-4 space-y-2 p-3 bg-gray-700 rounded-lg my-4">
          <div className="text-center text-gray-200">
            <span>Successfully swapped <span className='text-red-400'>{isSwapped.gone_amount ? isSwapped.gone_amount:'0'}</span> {tokenInfo.name ? tokenInfo.name:'token'} for <span className='text-green-400'>{isSwapped.received_amount ? isSwapped.received_amount:'0'}</span> {buyToken}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapCard;
