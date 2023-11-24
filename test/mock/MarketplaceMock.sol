// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;


contract MarketplaceMock{
    enum SaleType {
        Native,
        CrossChain
    }
    event Buy(address tokenAddress, uint256 tokenId);

    function buy(uint256[] memory _bestRoutes, SaleType saleType,  address tokenAddress, uint256 tokenId) public {
        emit Buy(tokenAddress, tokenId);
    }
}

