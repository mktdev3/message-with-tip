// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./IERC20.sol";
import "hardhat/console.sol";

contract LeavingATip is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    mapping(address => bool) private supportedTokenAddress;
    modifier supportsToken(address _tokenAddress) {
        require(supportedTokenAddress[_tokenAddress] == true, "This token is not supported.");
        _;
    }

    struct Tip {
        address tokenAddress;
        uint256 tip;
        bool isCompleted;
    }
    mapping(string => Tip) tips;

    event Leave(address, address, string , uint256);
    event Take(address, string, address);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address[] memory _tokenAddresses) initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();

        for(uint i = 0; i < _tokenAddresses.length; i++) {
            addSupportedTokenAddress(_tokenAddresses[i]);
        }
    }

    function addSupportedTokenAddress(address tokenAddress) public onlyOwner {
        supportedTokenAddress[tokenAddress] = true;       
    }

    function isSupportedTokenAddress(address tokenAddress) view public returns(bool) {
        return supportedTokenAddress[tokenAddress];
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function leave(address tokenAddress, address from, string calldata _id, uint256 _tip) public supportsToken(tokenAddress) {
        IERC20 token = IERC20(tokenAddress);
        require(_tip > 0, "Tip shoud be greater than 0.");

        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= _tip, "we're not allowed to transfer the specified tip amount.");
        uint256 balance = token.balanceOf(msg.sender);
        require(balance >= _tip, "There is insufficient amount of tip that you send.");

        Tip memory tip = Tip(tokenAddress, _tip, false);
        tips[_id] = tip;

        token.transferFrom(from, address(this), _tip);
        emit Leave(tokenAddress, from, _id, _tip);
    }

    function take(address tokenAddress, string calldata id, address to) public supportsToken(tokenAddress) {
        IERC20 token = IERC20(tokenAddress);

        Tip storage tip = tips[id];
        assert(tip.tip != 0);
        require(tip.isCompleted == false, "have already taken tip.");

        uint256 balance = token.balanceOf(address(this));
        require(balance >= tip.tip, "There is insufficient amount of tip that you send.");
        token.transfer(to, tip.tip);

        tip.isCompleted = true;
        emit Take(tokenAddress, id, to);
    }

    function getAmountOfTip(address tokenAddress, string calldata id) view public supportsToken(tokenAddress) returns(uint256 _tip) {
        _tip = tips[id].tip;
    }

    function isCompleted(address tokenAddress, string calldata id) view public supportsToken(tokenAddress) returns(bool _isCompleted) {
        _isCompleted = tips[id].isCompleted;
    }
}