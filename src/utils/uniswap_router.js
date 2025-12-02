import { ethers } from "ethers";
import abi from '../abis/MyToken.json'
// Uniswap V2 Router Address on Sepolia testnet
const ROUTER_ADDRESS = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

// Token and Uniswap Router ABI retrieval function
export async function getRouterContract(signer) {
  const response = await fetch(
    "https://unpkg.com/@uniswap/v2-periphery@latest/build/IUniswapV2Router02.json"
  );
  const json = await response.json();

  // Create a contract instance with the signer
  const router = new ethers.Contract(ROUTER_ADDRESS, json.abi, signer);

  return router;
}


// Add liquidity function
export async function addLiquidity(tokenAddress, tokenAmount, ethAmount, signer) {
  try {
    // Instantiate the token contract (assuming the token ABI is available)
    const tokenContract = new ethers.Contract(tokenAddress, abi.abi, signer);

    // Approve the Uniswap router to spend the tokens on behalf of the user
    const approveTx = await tokenContract.approve(ROUTER_ADDRESS, tokenAmount);
    await approveTx.wait(); // Wait for the approval to be mined

    console.log("Token approved for transfer to Uniswap Router");

    // Fetch Uniswap Router contract
    const router = await getRouterContract(signer);

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
