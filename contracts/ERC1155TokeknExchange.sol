// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

/**
 * @dev Exchange Contract for ERC1155 Token
 */
contract ERC1155TokenExchange is ERC1155Holder {
    /**
    * @dev Exchange struct for ERC1155 Token
    */
    struct ERC1155Exchange {
        string exchangeName;
        address creatorAddress;
        address exchangeTokenAddress;
        address offerTokenAddress;
        uint initialAmount;
        uint price;
    }

    /**
    * @dev Offer struct for ERC1155 Token
    */
    struct ERC1155Offer {
        uint exchangeId;
        uint offerId;
        string offerType;
        address creatorAddress;
        uint tokenId;
        uint amount;
        uint price;
    }

    /**
    * @dev Request struct for creating ERC1155TokenExchange
    */
    struct CreateERC1155TokenExchangeRequest {
        string exchangeName;
        address exchangeTokenAddress;
        address offerTokenAddress;
        uint tokenId;
        uint amount;
        uint price;
    }

    /**
    * @dev Request struct for Place ERC1155Token Offer
    */
    struct PlaceERC1155TokenOfferRequest {
        uint exchangeId;
        uint tokenId;
        uint amount;
        uint price;
    }

    /**
    * @dev Request struct for cancel Exchange
    */
    struct CancelOfferRequest {
        uint exchangeId;
        uint offerId;
    }

    /**
    * @dev Request struct for deal Exchange
    */
    struct OfferRequest {
        uint exchangeId;
        uint offerId;
    }

    /**
    * @dev count variables for ERC1155Token exchange and offer mapping
    */
    uint internal _erc1155ExchangeCount;
    uint internal _erc1155OfferCount;
    
    /**
    * @dev variables for storing ERC1155Token Exchange and Offer
    */
    mapping(uint => ERC1155Exchange) internal _erc1155Exchanges;
    mapping(uint => ERC1155Offer) internal _erc1155Offers;

    // ----- EVENTS ----- //
    event ERC1155TokenExchangeCreated(uint exchangeId, uint initialOfferId);
    event ERC1155TokenBuyingOfferPlaced(uint offerId);
    event ERC1155TokenSellingOfferPlaced(uint offerId);
    event ERC1155TokenBuyingOfferCanceled(uint offerId);
    event ERC1155TokenSellingOfferCanceled(uint offerId);
    event ERC1155TokenFromOfferBought(uint offerId);
    event ERC1155TokenFromOfferSold(uint offerId);

    /**
    * @dev Constructor Function
    */
    constructor() {
        _erc1155ExchangeCount = 0;
        _erc1155OfferCount = 0;
    }

    // ----- VIEWS ----- //
    function getErc1155ExchangeCount() external view returns(uint){
        return _erc1155ExchangeCount;
    }

    function getErc1155OfferCount() external view returns(uint){
        return _erc1155OfferCount;
    }

    function getErc1155Offers(uint exchangeId) external view returns(ERC1155Offer[] memory){
        uint count = 0;
        for(uint i = 1; i <= _erc1155OfferCount; i++) {
            if(_erc1155Offers[i].exchangeId == exchangeId) {
                count++;
            }
        }

        ERC1155Offer[] memory offers = new ERC1155Offer[](count);
        uint temp = 0;
        for(uint i = 1; i <= _erc1155OfferCount; i++) {
            if(_erc1155Offers[i].exchangeId == exchangeId) {
                offers[temp] = _erc1155Offers[i];
                temp++;
            }
        }

        return offers;
    }

    // function getErc1155ExchangeAll() external view returns(ERC1155Exchange[] memory){
    //     ERC1155Exchange[] memory exchanges = new ERC1155Exchange[](_erc1155ExchangeCount);
    //     for(uint i = 1; i <= _erc1155ExchangeCount; i++)
    //         exchanges[i-1] = _erc1155Exchanges[i];
    //     return exchanges;
    // }

    // function getErc1155OfferAll() external view returns(ERC1155Offer[] memory){
    //     ERC1155Offer[] memory offers = new ERC1155Offer[](_erc1155OfferCount);
    //     for(uint i = 1; i <= _erc1155OfferCount; i++)
    //         offers[i-1] = _erc1155Offers[i];
    //     return offers;
    // }

    function getErc1155ExchangeById(uint _exchangeId) external view returns(ERC1155Exchange memory){
        return _erc1155Exchanges[_exchangeId];
    }

    function getErc1155OfferById(uint _offerId) external view returns(ERC1155Offer memory){
        return _erc1155Offers[_offerId];
    }

    // ----- PUBLIC METHODS ----- //
    /**
    * @dev Owner of token can create Exchange of ERC1155
    * @dev exchangeTokenAddress address of exchangeToken(ERC1155) 
    * @dev offerTokenAddress address of exchangeToken(ERC1155) 
    * @dev tokenId ERC1155 token id of Exchange
    * @dev amount amount of exchange
    * @dev price token price of Exchange
    */
    function CreateERC1155TokenExchange(CreateERC1155TokenExchangeRequest memory input, address caller) external {
        IERC1155 token = IERC1155(input.exchangeTokenAddress);
        require(
            token.balanceOf(caller, input.tokenId) >= input.amount, 
            "TokenExchange.CreateERC1155TokenExchange: Your balance is not enough"
        );
        require(input.price > 0, "TokenExchange.CreateERC1155TokenExchange: price can't be lower or equal to zero");
        require(
            token.isApprovedForAll(caller, address(this)),
            "TokenExchange.CreateERC1155TokenExchange: Owner has not approved"
        );
        
        token.safeTransferFrom(caller, address(this), input.tokenId, input.amount, "");

        /**
        * @dev store exchange and initial offer
        */
        ERC1155Exchange memory exchange;
        exchange.exchangeName = input.exchangeName;
        exchange.creatorAddress = caller;
        exchange.exchangeTokenAddress = input.exchangeTokenAddress;
        exchange.offerTokenAddress = input.offerTokenAddress;
        exchange.initialAmount = input.amount;
        exchange.price = input.price; 

        _erc1155ExchangeCount++;
        _erc1155Exchanges[_erc1155ExchangeCount] = exchange;

        ERC1155Offer memory offer;
        offer.exchangeId = _erc1155ExchangeCount;
        offer.offerType = "SELL";
        offer.creatorAddress = caller;
        offer.tokenId = input.tokenId;
        offer.amount = input.amount;
        offer.price = exchange.price;

        _erc1155OfferCount++;
        offer.offerId = _erc1155OfferCount;
        _erc1155Offers[_erc1155OfferCount] = offer;

        emit ERC1155TokenExchangeCreated(_erc1155ExchangeCount, _erc1155OfferCount);
    }

    /**
    * @dev someone can create buying offer for ERC1155 token exchange
    * @dev exchangeTokenId id of exchange 
    * @dev tokenId ERC1155 token id of Exchange
    * @dev amount amount of exchange
    * @dev price token price of Exchange
    */
    function PlaceERC1155TokenBuyingOffer(PlaceERC1155TokenOfferRequest memory input, address caller) external {
        IERC20 token = IERC20(_erc1155Exchanges[input.exchangeId].offerTokenAddress);
        require(
            token.balanceOf(caller) >= (input.price * input.amount), 
            "TokenExchange.PlaceERC1155TokenBuyingOffer: you don't have enough balance"
        );
        require(input.price > 0, "TokenExchange.PlaceERC1155TokenBuyingOffer: price can't be lower or equal to zero");

        token.transferFrom(caller, address(this), input.price * input.amount);

        /**
        * @dev store buying offer
        */
        ERC1155Offer memory offer;
        offer.exchangeId = input.exchangeId;
        offer.offerType = "BUY";
        offer.creatorAddress = caller;
        offer.tokenId = input.tokenId;
        offer.amount = input.amount;
        offer.price = input.price;

        _erc1155OfferCount++;
        offer.offerId = _erc1155OfferCount;
        _erc1155Offers[_erc1155OfferCount] = offer;

        emit ERC1155TokenBuyingOfferPlaced(_erc1155OfferCount);
    }

    /**
    * @dev owner of token can create selling offer for ERC1155 token exchange
    * @dev exchangeTokenId id of exchange 
    * @dev tokenId ERC1155 token id of Exchange
    * @dev amount amount of exchange
    * @dev price token price of Exchange
    */
    function PlaceERC1155TokenSellingOffer(PlaceERC1155TokenOfferRequest memory input, address caller) external {
        IERC1155 token = IERC1155(_erc1155Exchanges[input.exchangeId].exchangeTokenAddress);
        require(
            token.balanceOf(caller, input.tokenId) >= input.amount, 
            "TokenExchange.PlaceERC1155TokenSellingOffer: Your balance is not enough"
        );
        require(input.price > 0, "TokenExchange.PlaceERC1155TokenSellingOffer: price can't be lower or equal to zero");
        require(
            token.isApprovedForAll(caller, address(this)),
            "TokenExchange.PlaceERC1155TokenSellingOffer: Owner has not approved"
        );

        token.safeTransferFrom(caller, address(this), input.tokenId, input.amount, "");

        /**
        * @dev store selling offer
        */
        ERC1155Offer memory offer;
        offer.exchangeId = input.exchangeId;
        offer.offerType = "SELL";
        offer.creatorAddress = caller;
        offer.tokenId = input.tokenId;
        offer.amount = input.amount;
        offer.price = input.price;

        _erc1155OfferCount++;
        offer.offerId = _erc1155OfferCount;
        _erc1155Offers[_erc1155OfferCount] = offer;

        emit ERC1155TokenSellingOfferPlaced(_erc1155OfferCount);
    }

    /**
    * @dev creator of buying offer can cancel his ERC721Token BuyingOffer
    * @dev exchangeTokenId id of exchange 
    * @dev offerId id of offer
    */
    function CancelERC1155TokenBuyingOffer(CancelOfferRequest memory input, address caller) external{
        ERC1155Offer memory offer = _erc1155Offers[input.offerId];
        IERC20 token = IERC20(_erc1155Exchanges[input.exchangeId].offerTokenAddress);
        require(offer.creatorAddress == caller, "TokenExchange.CancelERC1155TokenBuyingOffer: should be owner");
        require(offer.exchangeId == input.exchangeId, "TokenExchange.CancelERC1155TokenBuyingOffer: should be the same exchangeId");
        require(
            keccak256(abi.encodePacked(offer.offerType)) == keccak256(abi.encodePacked("BUY")), 
            "TokenExchange.CancelERC1155TokenBuyingOffer: should be the buying offer"
        );

        require(
            token.balanceOf(address(this)) >= (offer.price * offer.amount),
            "TokenExchange.CancelERC1155TokenBuyingOffer: you don't have enough balance"
        );
        
        token.transfer(caller, offer.price * offer.amount);            
        delete _erc1155Offers[input.offerId];

        emit ERC1155TokenBuyingOfferCanceled(input.offerId);
    }

    /**
    * @dev creator of selling offer can cancel his ERC1155 SellingOffer
    * @dev exchangeTokenId id of exchange 
    * @dev offerId id of offer
    */
    function CancelERC1155TokenSellingOffer(CancelOfferRequest memory input, address caller) external{
        ERC1155Offer memory offer = _erc1155Offers[input.offerId];
        IERC1155 token = IERC1155(_erc1155Exchanges[input.exchangeId].exchangeTokenAddress);
        require(offer.creatorAddress == caller, "TokenExchange.CancelERC1155TokenSellingOffer: should be owner");
        require(offer.exchangeId == input.exchangeId, "TokenExchange.CancelERC1155TokenSellingOffer: should be the same exchangeId");
        require(
            keccak256(abi.encodePacked(offer.offerType)) == keccak256(abi.encodePacked("SELL")), 
            "TokenExchange.CancelERC1155TokenSellingOffer: should be the selling offer"
        );
        require(
            token.balanceOf(address(this), offer.tokenId) >= offer.amount, 
            "TokenExchange.CancelERC1155TokenSellingOffer: need to own this token"
        );
        
        token.safeTransferFrom(address(this), caller, offer.tokenId, offer.amount, "");
        delete _erc1155Offers[input.offerId];

        emit ERC1155TokenSellingOfferCanceled(input.offerId);
    }

    /**
    * @dev someone can buy token(ERC1155) from selling offer
    * @dev exchangeTokenId id of exchange 
    * @dev offerId id of offer
    */
    function BuyERC1155TokenFromOffer(OfferRequest memory input, address caller) external{
        ERC1155Offer memory offer = _erc1155Offers[input.offerId];
        IERC20 erc20token = IERC20(_erc1155Exchanges[input.exchangeId].offerTokenAddress);
        IERC1155 erc1155token = IERC1155(_erc1155Exchanges[input.exchangeId].exchangeTokenAddress);

        require(offer.exchangeId == input.exchangeId, "TokenExchange.BuyERC1155TokenFromOffer: should be the same exchangeId");
        require(
            keccak256(abi.encodePacked(offer.offerType)) == keccak256(abi.encodePacked("SELL")), 
            "TokenExchange.BuyERC1155TokenFromOffer: should be the selling offer"
        );
        require(
            erc20token.balanceOf(caller) >= (offer.price * offer.amount),
            "TokenExchange.BuyERC1155TokenFromOffer: you don't have enough balance"
        );
        require(
            erc1155token.balanceOf(address(this), offer.tokenId) >= offer.amount, 
            "TokenExchange.BuyERC1155TokenFromOffer: Your balance is not enough"
        );

        erc20token.transferFrom(caller, offer.creatorAddress, offer.price * offer.amount); 
        erc1155token.safeTransferFrom(address(this), caller, offer.tokenId, offer.amount, "");
        delete _erc1155Offers[input.offerId];

        emit ERC1155TokenFromOfferBought(input.offerId);
    }

    /**
    * @dev owner of token can sell token(ERC1155) from buying offer
    * @dev exchangeTokenId id of exchange 
    * @dev offerId id of offer
    */
    function SellERC1155TokenFromOffer(OfferRequest memory input, address caller) external{
        ERC1155Offer memory offer = _erc1155Offers[input.offerId];
        IERC20 erc20token = IERC20(_erc1155Exchanges[input.exchangeId].offerTokenAddress);
        IERC1155 erc1155token = IERC1155(_erc1155Exchanges[input.exchangeId].exchangeTokenAddress);

        require(offer.exchangeId == input.exchangeId, "TokenExchange.SellERC1155TokenFromOffer: should be the same exchangeId");
        require(
            keccak256(abi.encodePacked(offer.offerType)) == keccak256(abi.encodePacked("BUY")), 
            "TokenExchange.SellERC1155TokenFromOffer: should be the buying offer"
        );
        require(
            erc20token.balanceOf(address(this)) >= (offer.price * offer.amount),
            "TokenExchange.SellERC1155TokenFromOffer: you don't have enough balance"
        );

        require(
            erc1155token.balanceOf(caller, offer.tokenId) >= offer.amount, 
            "TokenExchange.SellERC1155TokenFromOffe: need to own this token"
        );
        require(
            erc1155token.isApprovedForAll(caller, address(this)),
            "TokenExchange.SellERC1155TokenFromOffe: Owner has not approved2"
        );

        erc20token.transfer(caller, offer.price * offer.amount); 
        erc1155token.safeTransferFrom(caller, offer.creatorAddress, offer.tokenId, offer.amount, "");
        delete _erc1155Offers[input.offerId];

        emit ERC1155TokenFromOfferSold(input.offerId);
    }
}