// SPDX-License-Identifier: MIT
// Tells the Solidity compiler to compile only from v0.8.13 to v0.9.0
pragma solidity ^0.8.13;

contract Auth {
    struct User {
        address userAddress;
        string device;
        string ip;
    }

    mapping(address => string[]) public loginAttempts;
    mapping(address => User) public users;
    bool public systemActive = true;
    
    function register(address _address, string memory _device, string memory _ip) public {
        User memory newUser = User(_address, _device, _ip);
        users[_address] = newUser;
    }

    uint256 public lastFailedLoginAttempt;
    uint256 public failedLoginAttempts;
    
    function login(address _address, string memory _ip) public returns (bool) {
        if (!systemActive) {
            return false;
        }
        User memory user = users[_address];
        if (keccak256(abi.encodePacked(user.ip)) != keccak256(abi.encodePacked(_ip))) {
            failedLoginAttempts++;
            loginAttempts[_address].push("Failed login attempt");
            if (failedLoginAttempts >= 2) {
                systemActive = false;
                lastFailedLoginAttempt = block.timestamp + 2 minutes;
            }
            return false;
        }
        failedLoginAttempts = 0;
        loginAttempts[_address].push("Successful login attempt");
        return user.userAddress != address(0);
    }

    function logout(address _address) public {
        delete users[_address];
    }
}
