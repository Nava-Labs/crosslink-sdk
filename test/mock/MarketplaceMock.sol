// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;


contract MarketplaceMock{

    event Buy(address tokenAddress, uint256 tokenId);

    function buy(uint256[] memory _bestRoutes, address tokenAddress, uint256 tokenId) public {
        emit Buy(tokenAddress, tokenId);
    }
}

