import React, { useState, useEffect, } from "react";
import { ethers } from "ethers";
import tokenArtifact from "./abis/MyToken.json"; // ABI generated from the contract
import LiquidityCard from "./components/LiquidityCard";
import SwapCard from "./components/SwapCard";


const ABI = tokenArtifact.abi;
const BYTECODE = tokenArtifact.bytecode;

export default function DeployToken() {
  const [account, setAccount] = useState(null);
  const [name, setName] = useState('');
  const [tokenInfo, setTokenInfo] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [status, setStatus] = useState("");
  const [networkInfo, setNetworkInfo] = useState(null); // Updated state for current network info
  const [txHash, setTxHash] = useState(null);
  const [gas, setGas] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // console.log(networkInfo);
  // Check if user is already connected (on page reload)
  useEffect(() => {
    const storedAccount = localStorage.getItem("account");
    const storedTokenInfo = localStorage.getItem("tokenInfo");
    // const text = localStorage.setItem("tokenInfo",false);
    if (storedTokenInfo) {
      setTokenInfo(JSON.parse(storedTokenInfo));
    }
    if (storedAccount) {
      setAccount(storedAccount);
      getNetwork();
    }

    // Listen for chain changes to update the network status dynamically
    if (window.ethereum) {
      // Reload network info when the chain is changed in MetaMask
      window.ethereum.on("chainChanged", () => {
        getNetwork();
      });
      // Reload network info when account is changed
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("account", accounts[0]);
        } else {
          setAccount(null);
          localStorage.removeItem("account");
        }
      });
    }

    // Cleanup function for listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", getNetwork);
        window.ethereum.removeListener("accountsChanged", () => { });
      }
    };
  }, []);

  useEffect(() => {
    if (networkInfo) {
      const init = async () => {
        await getEthBalance();
        await estimateGas();
      };
      init();
    }
  }, [networkInfo]);


  const getEthBalance = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      let balance = await provider.getBalance(address);
      balance = ethers.formatEther(balance);
      setEthBalance(parseFloat(balance.substring(0, balance.indexOf(".") + 5)));
    }
  }
  const GAS_LIMIT_ESTIMATE = 300000n;

  const estimateGas = async () => {
    if (!window.ethereum) return null;

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Call raw RPC method to get the current gas price
    const gasPriceHex = await provider.send("eth_gasPrice", []); // e.g. "0x3b9aca00"
    const gasPrice = BigInt(gasPriceHex); // Convert hex string → BigInt in wei

    const estimatedWei = gasPrice * GAS_LIMIT_ESTIMATE;

    // Use formatUnits to convert wei to ETH and keep a readable format with 18 decimals
    const estimatedEth = ethers.formatUnits(estimatedWei, 18);

    // Convert the result to a more readable format with up to 8 decimal places
    setGas(parseFloat(estimatedEth).toFixed(8)); // Limiting to 8 decimals for display
  };


  // Connect MetaMask and set account
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);

      localStorage.setItem("account", accounts[0]); // Store account in localStorage
      getNetwork();
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet");
    }
  }

  // Disconnect MetaMask wallet
  function disconnectWallet() {
    setAccount(null);
    setNetworkInfo(null);
    localStorage.removeItem("account"); // Clear account from localStorage
  }

  // Get current network name and chainId from MetaMask
  async function getNetwork() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        // console.log('network :',network);
        // Use the network name/chain ID to display what the user is connected to
        setNetworkInfo({
          name: network.name,
          chainId: network.chainId.toString(), // Convert BigInt to string for display
        });
        console.log("Connected to network:", network.name, network.chainId.toString());
      } catch (error) {
        console.error("Error fetching network:", error);
        setNetworkInfo({ name: "Unknown/Disconnected", chainId: "---" });
      }
    }
  }

  async function deployAndMint() {
    try {
      if (isDeploying) {
        return;
      }
      if (!window.ethereum) {
        alert("MetaMask not found");
        return;
      }

      if (!name || !symbol || !supply) {
        alert("Please fill in the token name, symbol, and supply");
        return;
      }

      if (!account) {
        alert("Please connect your wallet first.");
        return;
      }
      setIsDeploying(true);
      setStatus(`Preparing transaction on ${networkInfo?.name || "current network"}...`);
      // setTokenInfo({});
      setTxHash('');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Convert the supply into the smallest unit (18 decimals)
      const supplyUnits = ethers.parseUnits(supply, 18); // Supply in whole tokens

      const factory = new ethers.ContractFactory(ABI, BYTECODE, signer);

      setStatus("Sending deploy transaction...");

      // Deploy the contract with name, symbol, and supply passed as constructor parameters
      const contract = await factory.deploy(name, symbol, supplyUnits);
      await contract.waitForDeployment();

      const addr = await contract.getAddress();
      let temp = {
        name: name, symbol: symbol,
        supply: parseInt(supply),
        tokenAddress: addr, amount: parseInt(supply), abi: ABI
      };
      setTokenInfo(()=>{
        localStorage.setItem("tokenInfo", JSON.stringify(temp));
        return temp;
      });
      setName('');
      setSymbol('');
      setSupply('');
      const deployTxResponse = contract.deploymentTransaction();
      const txHash = deployTxResponse.hash;
      setTxHash(txHash);
      setIsDeploying(false);
      setStatus(` Deployed successfully on ${networkInfo.name}`);
      
    } catch (err) {
      setIsDeploying(false);
      console.error("Deployment Error:", err);
      const errorMsg = err?.reason || err?.message || "Unknown error occurred during deployment.";
      setStatus(`❌ Error: ${errorMsg}`);
    }
  }

  return (
    <div className="bg-gradient-to-tr from-gray-500 via-gray-300 to-gray-800 text-white min-h-screen py-10">
      <div className="flex justify-between">
        <div></div>
        <div>
          {/* Wallet Connect/Disconnect Button */}
          {account ? (
            <div className="flex justify-center text-center mb-6 mx-6 gap-4">
              <p className="mt-1">Connected: {account.slice(0, 6)}...{account.slice(-4)} <i class="fa fa-regular fa-copy cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(account);
                alert("Copy succesful");
              }}></i></p>
              <button
                onClick={disconnectWallet}
                className="bg-gray-800 py-1 px-6 rounded-full"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="text-center mb-6 mx-6">
              <button
                onClick={connectWallet}
                className="bg-gray-800 py-2 px-6 rounded-full"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
      <section class="py-10 text-center">
        <div class="max-w-4xl mx-auto px-4">

          <h1 class="text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-white">
            The Future of Decentralized Swaps
          </h1>

          <p class="text-xl sm:text-2xl text-gray-800 mb-10 max-w-2xl mx-auto">
            Experience lightning-fast transactions and unparalleled yields across all major chains. Start earning today.
          </p>

          <div class="inline-flex items-center space-x-2 sm:space-x-4 mb-8 p-3 bg-white/10 backdrop-blur-sm rounded-full border border-gray-600/50 shadow-xl">

            <span class="px-4 py-1 bg-gray-600 text-white font-semibold rounded-full text-xs sm:text-sm shadow-md">
              Mint Token
            </span>

            <svg class="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>

            <span class="px-4 py-1 bg-gray-600 text-white font-semibold rounded-full text-xs sm:text-sm shadow-md">
              Add Liquidity
            </span>

            <svg class="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>

            <span class="px-4 py-1 bg-gray-600 text-white font-semibold rounded-full text-xs sm:text-sm shadow-md">
              Trade
            </span>

          </div>

        </div>
      </section>
      <div className="grid grid-cols-1 gap-8 justify-items-center px-6">
        <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-6">Deploy & Mint ERC20 Token</h2>

          {/* Display Current Network Information */}
          {networkInfo && (
            <div className="bg-gray-700 p-2 rounded-md mb-6 text-center">
              <span>Connected Network:</span> <strong>{networkInfo.name}</strong>
            </div>
          )}

          {/* Token Input Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-lg">Token Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md w-full"
                placeholder="Arbitrum"
              />
            </div>

            <div>
              <label className="block text-lg">Token Symbol</label>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md w-full"
                placeholder="ARB"
              />
            </div>

            <div>
              <label className="block text-lg">Initial Supply</label>
              <input
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md w-full"
                type="number"
                placeholder="1000"
              />
            </div>

            {networkInfo ?
              <>
                {!tokenInfo ? <button
                  onClick={deployAndMint}
                  className="bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr text-white py-3 px-6 rounded-full w-full mt-4"
                  disabled={!account}
                >

                  Deploy & Mint  <span className="text-transparent bg-clip-text bg-gray-900 text-lg font-bold">{name ? name : null}</span> on {networkInfo ? networkInfo.name : 'current network'}
                </button>
                  :
                  <button
                    onClick={() => {setTokenInfo(false);localStorage.setItem('tokenInfo',false)}}
                    className="bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr text-white py-3 px-6 rounded-full w-full mt-4"
                    disabled={!account}
                  >

                    Mint New
                  </button>}
              </>
              :
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr text-white py-3 px-6 rounded-full w-full mt-4"

              >

                Connect Wallet
              </button>
            }
          </div>

          {/* Status Display */}
          {status && (
            <p className="mt-4 text-center text-sm">
              {isDeploying ? <i className="fa fa-solid fa-spinner fa-spin"></i>
                : null}
              <strong>Status:</strong> {status}
            </p>
          )}

          {/* Display Contract Address after Successful Deployment */}
          {tokenInfo.tokenAddress && (
            <p className="mt-4 text-center">
              {tokenInfo.name ? tokenInfo.name:'token'} contract address:<br />
              <code>{tokenInfo.tokenAddress}</code>
            </p>
          )}

          {txHash && (
            <div className="flex gap-2">
              <p className="mt-4 text-center text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                <strong>Tx Hash :</strong> {txHash}
              </p>
              <i class="fa fa-regular fa-copy cursor-pointer mt-4" onClick={() => {
                navigator.clipboard.writeText(txHash);
                alert("Copy succesful");
              }}></i>
            </div>
          )}

        </div>
        {(networkInfo || txHash) && <LiquidityCard
          setTokenInfo={setTokenInfo} networkInfo={networkInfo} connectWallet={connectWallet} gas={gas} ethBalance={ethBalance} tokenInfo={tokenInfo} />}
        {(networkInfo || txHash) && <SwapCard
          setTokenInfo={setTokenInfo} networkInfo={networkInfo} connectWallet={connectWallet} gas={gas} ethBalance={ethBalance} tokenInfo={tokenInfo} />}
      </div>
    </div>
  );
}
