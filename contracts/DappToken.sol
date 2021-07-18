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
    event Approval(
        address indexed _owner, 
        address indexed _spender, 
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

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

    // Deletegated Transfer

    //Give the approval for that many _value as per the allowance
    function approve(address _spender, uint256 _value) public returns (bool success){
        //allowance 
        allowance[msg.sender][_spender] = _value;
        
        //approve event
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        // Check if from has enough balance
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        balanceOf[_from]-= _value;
        balanceOf[_to]+=_value;

        // decrease the spender's allowance by value
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
        //
    }
}