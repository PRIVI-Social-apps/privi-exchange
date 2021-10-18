// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @dev Exchange Contract for ERC721 Token
 */
contract ERC721TokenExchange is IERC721Receiver {
    /**
    * @dev Exchange struct for ERC721 Token
    */
    struct ERC721Exchange {
        string exchangeName;
        address creatorAddress;
        address exchangeTokenAddress;
        address offerTokenAddress;
        uint price;
    }

    /**
    * @dev Offer struct for ERC721 Token
    */
    struct ERC721Offer {
        uint exchangeId;
        uint offerId;
        string offerType;
        address creatorAddress;
        uint tokenId;
        uint price;
    }

    /**
    * @dev Request struct for creating ERC721TokenExchange
    */
    struct CreateERC721TokenExchangeRequest {
        string exchangeName;
        address exchangeTokenAddress;
        address offerTokenAddress;
        uint tokenId;
        uint price;
    }

    /**
    * @dev Request struct for Place ERC721Token Offer
    */
    struct PlaceERC721TokenOfferRequest {
        uint exchangeId;
        uint tokenId;
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
    * @dev count variables for ERC721Token exchange and offer mapping
    */
    uint internal _erc721ExchangeCount;
    uint internal _erc721OfferCount;

    /**
    * @dev variables for storing ERC721Token Exchange and Offer
    */
    mapping(uint => ERC721Exchange) internal _erc721Exchanges;
    mapping(uint => ERC721Offer) internal _erc721Offers;

    // ----- EVENTS ----- //
    event ERC721TokenExchangeCreated(uint exchangeId, uint initialOfferId);
    event ERC721TokenBuyingOfferPlaced(uint offerId);
    event ERC721TokenSellingOfferPlaced(uint offerId);
    event ERC721TokenBuyingOfferCanceled(uint offerId);
    event ERC721TokenSellingOfferCanceled(uint offerId);
    event ERC721TokenFromOfferBought(uint offerId);
    event ERC721TokenFromOfferSold(uint offerId);

    /**
    * @dev Constructor Function
    */
    constructor() {
        _erc721ExchangeCount = 0;
        _erc721OfferCount = 0;
    }

    // ----- VIEWS ----- //
    function getErc721ExchangeCount() external view returns(uint){
        return _erc721ExchangeCount;
    }

    function getErc721OfferCount() external view returns(uint){
        return _erc721OfferCount;
    }

    function getErc721Offers(uint exchangeId) external view returns(ERC721Offer[] memory){
        uint count = 0;
        for(uint i = 1; i <= _erc721OfferCount; i++) {
            if(_erc721Offers[i].exchangeId == exchangeId) {
                count++;
            }
        }

        ERC721Offer[] memory offers = new ERC721Offer[](count);
        uint temp = 0;
        for(uint i = 1; i <= _erc721OfferCount; i++) {
            if(_erc721Offers[i].exchangeId == exchangeId) {
                offers[temp] = _erc721Offers[i];
                temp++;
            }
        }

        return offers;
    }

    // function getErc721ExchangeAll() external view returns(ERC721Exchange[] memory){
    //     ERC721Exchange[] memory exchanges = new ERC721Exchange[](_erc721ExchangeCount);
    //     for(uint i = 1; i <= _erc721ExchangeCount; i++)
    //         exchanges[i-1] = _erc721Exchanges[i];
    //     return exchanges;
    // }

    // function getErc721OfferAll() external view returns(ERC721Offer[] memory){
    //     ERC721Offer[] memory offers = new ERC721Offer[](_erc721OfferCount);
    //     for(uint i = 1; i <= _erc721OfferCount; i++) {
    //         offers[i-1] = _erc721Offers[i];
    //     }
    //     return offers;
    // }

    function getErc721ExchangeById(uint _exchangeId) external view returns(ERC721Exchange memory){
        return _erc721Exchanges[_exchangeId];
    }

    function getErc721OfferById(uint _offerId) external view returns(ERC721Offer memory){
        return _erc721Offers[_offerId];
    }

    // ----- PUBLIC METHODS ----- //
    /**
    * @dev Owner of token can create Exchange of ERC721
    * @dev exchangeTokenAddress address of exchangeToken(ERC721) 
    * @dev offerTokenAddress address of exchangeToken(ERC721) 
    * @dev tokenId ERC721 token id of Exchange
    * @dev price token price of Exchange
    */
    function CreateERC721TokenExchange(CreateERC721TokenExchangeRequest memory input, address caller) external {
        IERC721 token = IERC721(input.exchangeTokenAddress);
        require(token.ownerOf(input.tokenId) == caller, "TokenExchange.CreateERC721TokenExchange: You need to own this token");
        require(input.price > 0, "TokenExchange.CreateERC721TokenExchange: price can't be lower or equal to zero");
        require(
            token.isApprovedForAll(caller, address(this)),
            "TokenExchange.CreateERC721TokenExchange: Owner has not approved"
        );
        
        token.safeTransferFrom(caller, address(this), input.tokenId, "");

        /**
        * @dev store exchange and initial offer
        */
        ERC721Exchange memory exchange;
        exchange.exchangeName = input.exchangeName;
        exchange.creatorAddress = caller;
        exchange.exchangeTokenAddress = input.exchangeTokenAddress;
        exchange.offerTokenAddress = input.offerTokenAddress;
        exchange.price = input.price; 

        _erc721ExchangeCount++;
        _erc721Exchanges[_erc721ExchangeCount] = exchange;

        ERC721Offer memory offer;
        offer.exchangeId = _erc721ExchangeCount;
        offer.offerType = "SELL";
        offer.creatorAddress = caller;
        offer.tokenId = input.tokenId;
        offer.price = exchange.price;

        _erc721OfferCount++;
        offer.offerId = _erc721OfferCount;
        _erc721Offers[_erc721OfferCount] = offer;

        emit ERC721TokenExchangeCreated(_erc721ExchangeCount, _erc721OfferCount);
    }

    /**
    * @dev someone can create buying offer for ERC721 token exchange
    * @dev exchangeTokenId id of exchange 
    * @dev tokenId ERC721 token id of Exchange
    * @dev price token price of Exchange
    */
    function PlaceERC721TokenBuyingOffer(PlaceERC721TokenOfferRequest memory input, address caller) external {
        IERC20 token = IERC20(_erc721Exchanges[input.exchangeId].offerTokenAddress);
        require(token.balanceOf(caller) >= input.price, "TokenExchange.PlaceERC721TokenBuyingOffer: you don't have enough balance");
        require(input.price > 0, "TokenExchange.PlaceERC721TokenBuyingOffer: price can't be lower or equal to zero");

        token.transferFrom(caller, address(this), input.price);

        /**
        * @dev store buying offer
        */
        ERC721Offer memory offer;
        offer.exchangeId = input.exchangeId;
        offer.offerType = "BUY";
        offer.creatorAddress = caller;
        offer.tokenId = input.tokenId;
        offer.price = input.price;

        _erc721OfferCount++;
        offer.offerId = _erc721OfferCount;
        _erc721Offers[_erc721OfferCount] = offer;

        emit ERC721TokenBuyingOfferPlaced(_erc721OfferCount);
    }

    /**
    * @dev owner of token can create selling offer for ERC721 token exchange
    * @dev exchangeTokenId id of exchange 
    * @dev tokenId ERC721 token id of Exchange
    * @dev price token price of Exchange
    */
    function PlaceERC721TokenSellingOffer(PlaceERC721TokenOfferRequest memory input, address caller) external {
        IERC721 token = IERC721(_erc721Exchanges[input.exchangeId].exchangeTokenAddress);
        require(token.ownerOf(input.tokenId) == caller, "TokenExchange.PlaceERC721TokenSellingOffer: You need to own this token");
        require(input.price > 0, "TokenExchange.PlaceERC721TokenSellingOffer: price can't be lower or equal to zero");
        require(
            token.isApprovedForAll(caller, address(this)),
            "TokenExchange.PlaceERC721TokenSellingOffer: Owner has not approved"
        );

        token.safeTransferFrom(caller, address(this), input.tokenId);

        /**
        * @dev store selling offer
        */
        ERC721Offer memory offer;
        offer.exchangeId = input.exchangeId;
        offer.offerType = "SELL";
        offer.creatorAddress = caller;
        offer.tokenId = input.tokenId;
        offer.price = input.price;

        _erc721OfferCount++;
        offer.offerId = _erc721OfferCount;
        _erc721Offers[_erc721OfferCount] = offer;

        emit ERC721TokenSellingOfferPlaced(_erc721OfferCount);
    }

    /**
    * @dev creator of buying offer can cancel his ERC721Token BuyingOffer
    * @dev exchangeTokenId id of exchange 
    * @dev offerId id of offer
    */
    function CancelERC721TokenBuyingOffer(CancelOfferRequest memory input, address caller) external{
        ERC721Offer memory offer = _erc721Offers[input.offerId];
        IERC20 token = IERC20(_erc721Exchanges[input.exchangeId].offerTokenAddress);
        require(offer.creatorAddress == caller, "TokenExchange.CancelERC721TokenBuyingOffer: should be owner");
        require(offer.exchangeId == input.exchangeId, "TokenExchange.CancelERC721TokenBuyingOffer: should be the same exchangeId");
        require(
            keccak256(abi.encodePacked(offer.offerType)) == keccak256(abi.encodePacked("BUY")), 
            "TokenExchange.CancelERC721TokenBuyingOffer: should be the buying offer"
        );

        require(
            token.balanceOf(address(this)) >= offer.price,
            "TokenExchange.CancelERC721TokenBuyingOffer: you don't have enough balance"
        );
        
        token.transfer(caller, offer.price);            
        delete _erc721Offers[input.offerId];

        emit ERC721TokenBuyingOfferCanceled(input.offerId);
    }

    /**
    * @dev creator of selling offer can cancel his ERC721 SellingOffer
    * @dev exchangeTokenId id of exchange 
    * @dev offerId id of offer
    */
    function CancelERC721TokenSellingOffer(CancelOfferRequest memory input, address caller) external{
        ERC721Offer memory offer = _erc721Offers[input.offerId];
        IERC721 token = IERC721(_erc721Exchanges[input.exchangeId].exchangeTokenAddress);
        require(offer.creatorAddress == caller, "TokenExchange.CancelERC721TokenSellingOffer: should be owner");
        require(offer.exchangeId == input.exchangeId, "TokenExchange.CancelERC721TokenSellingOffer: should be the same exchangeId");
        require(
            keccak256(abi.encodePacked(offer.offerType)) == keccak256(abi.encodePacked("SELL")), 
            "TokenExchange.CancelERC721TokenSellingOffer: should be the selling offer"
        );
        require(token.ownerOf(offer.tokenId) == address(this), "TokenExchange.CancelERC721TokenSellingOffer: need to own this token");
        
        token.safeTransferFrom(address(this), caller, offer.tokenId);
        delete _erc721Offers[input.offerId];

        emit ERC721TokenSellingOfferCanceled(input.offerId);
    }

    /**
    * @dev someone can buy token(ERC721) from selling offer
    * @dev exchangeTokenId id of exchange 
    * @dev offerId id of offer
    */
    function BuyERC721TokenFromOffer(OfferRequest memory input, address caller) external{
        ERC721Offer memory offer = _erc721Offers[input.offerId];
        IERC20 erc20token = IERC20(_erc721Exchanges[input.exchangeId].offerTokenAddress);
        IERC721 erc721token = IERC721(_erc721Exchanges[input.exchangeId].exchangeTokenAddress);

        require(offer.exchangeId == input.exchangeId, "TokenExchange.BuyERC721TokenFromOffer: should be the same exchangeId");
        require(
            keccak256(abi.encodePacked(offer.offerType)) == keccak256(abi.encodePacked("SELL")), 
            "TokenExchange.BuyERC721TokenFromOffer: should be the selling offer"
        );
        require(
            erc20token.balanceOf(caller) >= offer.price,
            "TokenExchange.BuyERC721TokenFromOffer: you don't have enough balance"
        );
        require(erc721token.ownerOf(offer.tokenId) == address(this), "TokenExchange.BuyERC721TokenFromOffer: need to own this token");

        erc20token.transferFrom(caller, offer.creatorAddress, offer.price); 
        erc721token.safeTransferFrom(address(this), caller, offer.tokenId);
        delete _erc721Offers[input.offerId];

        emit ERC721TokenFromOfferBought(input.offerId);
    }

    /**
    * @dev owner of token can sell token(ERC721) from buying offer
    * @dev exchangeTokenId id of exchange 
    * @dev offerId id of offer
    */
    function SellERC721TokenFromOffer(OfferRequest memory input, address caller) external{
        ERC721Offer memory offer = _erc721Offers[input.offerId];
        IERC20 erc20token = IERC20(_erc721Exchanges[input.exchangeId].offerTokenAddress);
        IERC721 erc721token = IERC721(_erc721Exchanges[input.exchangeId].exchangeTokenAddress);

        require(offer.exchangeId == input.exchangeId, "TokenExchange.SellERC721TokenFromOffer: should be the same exchangeId");
        require(
            keccak256(abi.encodePacked(offer.offerType)) == keccak256(abi.encodePacked("BUY")), 
            "TokenExchange.SellERC721TokenFromOffer: should be the buying offer"
        );
        require(
            erc20token.balanceOf(address(this)) >= offer.price,
            "TokenExchange.SellERC721TokenFromOffer: you don't have enough balance"
        );
        require(erc721token.ownerOf(offer.tokenId) == caller, "TokenExchange.SellERC721TokenFromOffer: need to own this token");

        erc20token.transfer(caller, offer.price); 
        erc721token.safeTransferFrom(caller, offer.creatorAddress, offer.tokenId);
        delete _erc721Offers[input.offerId];

        emit ERC721TokenFromOfferSold(input.offerId);
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}