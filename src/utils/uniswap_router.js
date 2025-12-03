import { ethers } from "ethers";
import abi from '../abis/MyToken.json'
// Uniswap V2 Router Address on Sepolia testnet
const ROUTER_ADDRESS = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

export const uniswap_v2_router2_contract_address = {
  '11155111': "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3",
  '130':'0x284f11109359a7e1306c3e447ef14d38400063ff',
  '42161':'0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  '43114':'0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  '56':'0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
  '8453':'0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  '10':'0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2',
  '137':'0xedf6066a2b290C185783862C7F4776A2C8077AD1',
  '81457':'0xBB66Eb1c5e875933D44DAe661dbD80e5D9B03035',
  '7777777':'0xa00F34A632630EFd15223B1968358bA4845bEEC7',
  '143':'0x4b2ab38dbf28d31d467aa8993f6c2585981d6804'
}

// Token and Uniswap Router ABI retrieval function
export async function getRouterContract(signer,router_adrs) {
  const response = await fetch(
    "https://unpkg.com/@uniswap/v2-periphery@latest/build/IUniswapV2Router02.json"
  );
  const json = await response.json();

  // Create a contract instance with the signer
  const router = new ethers.Contract(router_adrs, json.abi, signer);

  return router;
}


// Add liquidity function
export async function addLiquidity(tokenAddress, tokenAmount, ethAmount, signer,router_adrs) {
  try {
    // Instantiate the token contract (assuming the token ABI is available)
    // const tokenContract = new ethers.Contract(tokenAddress, abi.abi, signer);

    // const approveTx = await tokenContract.approve(router_adrs, tokenAmount);
    // await approveTx.wait(); 
    // Fetch Uniswap Router contract
    const router = await getRouterContract(signer,router_adrs);

    // Add liquidity to the pool
    const tx = await router.addLiquidityETH(
      tokenAddress,           // Token address
      tokenAmount,            // Amount of the token to add
      0,                      // Minimum amount of token to add (slippage tolerance)
      0,                      // Minimum amount of ETH to add (slippage tolerance)
      await signer.getAddress(), // Address that will receive the liquidity
      Math.floor(Date.now() / 1000) + 60 * 5, // Deadline (20 minutes from now)
      {
        value: ethAmount,     // The amount of ETH to be added to the pool
      }
    );

    // Wait for the transaction to be mined
    const new_tx = await tx.wait();
    console.log("Liquidity added successfully!",new_tx);
    return new_tx;

  } catch (error) {
    console.error("Error adding liquidity:", error);
  }
}
