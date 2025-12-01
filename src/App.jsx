import React, { useState, useEffect, } from "react";
import { ethers } from "ethers";
import tokenArtifact from "./abis/MyToken.json"; // ABI generated from the contract
import LiquidityCard from "./components/LiquidityCard";
import { getRouterContract,addLiquidity } from "./utils/uniswap_router";

const ABI = tokenArtifact.abi;
const BYTECODE = tokenArtifact.bytecode;

export default function DeployToken() {
  const [account, setAccount] = useState(null);
  const [name, setName] = useState("");
  const [tokenName, setTokenName] = useState(true);
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [status, setStatus] = useState("");
  const [tokenAddress, setTokenAddress] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null); // Updated state for current network info
  const [txHash, setTxHash] = useState(null);
  const [usdtAddress, setUsdtAddress] = useState(null);
  const [tokenAmount, settokenAmount] = useState(null);
  const [ethAmount, setEthAmount] = useState(null);

  // Check if user is already connected (on page reload)
  useEffect(() => {
    const storedAccount = localStorage.getItem("account");
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

        // Use the network name/chain ID to display what the user is connected to
        setNetworkInfo({
          name: network.name,
          chainId: network.chainId.toString(), // Convert BigInt to string for display
        });
        console.log("Connected to network:", network.name, network.chainId);
      } catch (error) {
        console.error("Error fetching network:", error);
        setNetworkInfo({ name: "Unknown/Disconnected", chainId: "---" });
      }
    }
  }

  async function deployAndMint() {
    try {
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

      setStatus(`Preparing transaction on ${networkInfo?.name || "current network"}...`);

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
      setTokenName(name);
      setName('');
      setSymbol('');
      setSupply('');
      setTokenAddress(addr);
      const deployTxResponse = contract.deploymentTransaction();
      const txHash = deployTxResponse.hash;
      setTxHash(txHash);
      console.log("Transaction Hash:", txHash);
      setStatus(` Deployed successfully on ${networkInfo.name} at ${addr}`);

      console.log("Token deployed at:", addr);
    } catch (err) {
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
                placeholder="My Custom Token"
              />
            </div>

            <div>
              <label className="block text-lg">Token Symbol</label>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md w-full"
                placeholder="MCT"
              />
            </div>

            <div>
              <label className="block text-lg">Initial Supply (whole tokens)</label>
              <input
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-md w-full"
                type="number"
                placeholder="1000"
              />
            </div>

            {networkInfo ? 
            <button
              onClick={deployAndMint}
              className="bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr text-white py-3 px-6 rounded-full w-full mt-4"
              disabled={!account}
            >
              
              Deploy & Mint  <span className="text-transparent bg-clip-text bg-gray-900 text-lg font-bold">{name ? name : null}</span> on {networkInfo ? networkInfo.name : 'current network'}
            </button>
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
              <strong>Status:</strong> {status}
            </p>
          )}

          {/* Display Contract Address after Successful Deployment */}
          {tokenAddress && (
            <p className="mt-4 text-center">
              Your token contract address:<br />
              <code>{tokenAddress}</code>
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
        {tokenName && <LiquidityCard tokenAddress={tokenAddress}
    usdtAddress={usdtAddress} name={tokenName} symbol={symbol}
     networkInfo={networkInfo} tokenAmount={tokenAmount}
     ethAmount={ethAmount}
     />}
      </div>
    </div>
  );
}
