import React, { useState } from 'react';

const SwapCard = () => {


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
              className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-600 focus:outline-none"
            />
            <div className="relative">
              <select
                className="absolute inset-y-0 right-0 px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-r-lg focus:outline-none"
              >
                <option value="USDC">USDC</option>
                <option value="WETH">WETH</option>
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
              className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-600 focus:outline-none"
            />
            <div className="relative">
              <select
                className="absolute inset-y-0 right-0 px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-r-lg focus:outline-none"
              >
                <option value="USDC">USDC</option>
                <option value="WETH">WETH</option>
                {/* Add more tokens */}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <button
        className="text-white w-full py-3 rounded-full bg-gray-700 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 hover:bg-gradient-to-tr font-semibold text-sm"
      >
        Swap
      </button>
    </div>
  );
};

export default SwapCard;
