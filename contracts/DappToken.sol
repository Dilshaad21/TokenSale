pragma solidity >=0.4.2;

contract DappToken{

    string public name = "Dapp Token";
    string public symbol = "DAPP";
    string public standard = "Dapp Token v1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,  
        address indexed _to, 
        uint256 _value
    );
    
    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) public{
        // First account which deplyed contract
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        // allocate the initial supply 
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success){
        require (balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}