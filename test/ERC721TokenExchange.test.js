const ERC721TokenExchange = artifacts.require("ERC721TokenExchange");

const PRIVIERC721TestToken = artifacts.require("PRIVIERC721TestToken");
const PRIVIOfferTestToken = artifacts.require("PRIVIOfferTestToken");

contract("ERC721TokenExchange", (accounts) => {
    var tokenexchange_contract;
    var offertoken_contract;
    var exchangetoken_contract;

    const tokenIds = [
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174610",
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174611",
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174612",
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174613",
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174614",
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174615",
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174616",
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174617",
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174618",
        "0x222222229bd51a8f1fd5a5f74e4a256513210caf2ade63cd25c7e4c654174619"
    ];

    before(async () => {
        tokenexchange_contract = await ERC721TokenExchange.new(
            { from: accounts[0] }
        );

        exchangetoken_contract = await PRIVIERC721TestToken.new(
            { from: accounts[0] }
        );

        offertoken_contract = await PRIVIOfferTestToken.new(
            { from: accounts[0] }
        );

        await offertoken_contract.mint(accounts[1], 100000);

        await exchangetoken_contract.safeMint(accounts[0], tokenIds[0]);
        await exchangetoken_contract.safeMint(accounts[0], tokenIds[1]);
        await exchangetoken_contract.safeMint(accounts[0], tokenIds[2]);
        await exchangetoken_contract.safeMint(accounts[1], tokenIds[5]);

    });

    describe("CreateERC721TokenExchange", () => {
        it("not working if you need to own this token", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CreateERC721TokenExchange({
                    exchangeName: "erc721exchange",
                    exchangeTokenAddress: exchangetoken_contract.address,
                    offerTokenAddress: offertoken_contract.address,
                    tokenId: tokenIds[0],
                    price: 10
                }, accounts[1]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CreateERC721TokenExchange: You need to own this token");
        })

        it("not working if price is lower or equal to zero", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CreateERC721TokenExchange({
                    exchangeName: "erc721exchange",
                    exchangeTokenAddress: exchangetoken_contract.address,
                    offerTokenAddress: offertoken_contract.address,
                    tokenId: tokenIds[0],
                    price: 0
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CreateERC721TokenExchange: price can't be lower or equal to zero");
        })

        it("not working if owner has not approved", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CreateERC721TokenExchange({
                    exchangeName: "erc721exchange",
                    exchangeTokenAddress: exchangetoken_contract.address,
                    offerTokenAddress: offertoken_contract.address,
                    tokenId: tokenIds[0],
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CreateERC721TokenExchange: Owner has not approved");
        })

        it("Works fine with normal flow", async () => {
            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, true, {from: accounts[0]});
            await tokenexchange_contract.CreateERC721TokenExchange({
                exchangeName: "erc721exchange",
                exchangeTokenAddress: exchangetoken_contract.address,
                offerTokenAddress: offertoken_contract.address,
                tokenId: tokenIds[0],
                price: 10
            }, accounts[0]);
            assert.equal(await exchangetoken_contract.ownerOf(tokenIds[0]),tokenexchange_contract.address);
        })
    });

    describe("PlaceERC721TokenBuyingOffer", () => {
        it("not working if balance is not enough", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC721TokenBuyingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[0],
                    price: 200000
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC721TokenBuyingOffer: you don't have enough balance");
        })

        it("not working if price is lower or equal to zero", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC721TokenBuyingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[0],
                    price: 0
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC721TokenBuyingOffer: price can't be lower or equal to zero");
        })

        it("not working if owner has not approved", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC721TokenBuyingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[0],
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "ERC20: transfer amount exceeds allowance");
        })

        it("Works fine with normal flow", async () => {

            await offertoken_contract.approve(tokenexchange_contract.address, 10, {from: accounts[0]});
            await tokenexchange_contract.PlaceERC721TokenBuyingOffer({
                exchangeId: 1,
                tokenId: tokenIds[0],
                price: 10
            }, accounts[0]);
            assert.equal(await offertoken_contract.balanceOf(tokenexchange_contract.address),10);
        })
    });

    describe("PlaceERC721TokenSellingOffer", () => {
        it("not working if balance is not enough", async () => {
            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, false, {from: accounts[0]});
            
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC721TokenSellingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[1],
                    price: 10
                }, accounts[1]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC721TokenSellingOffer: You need to own this token");
        })

        it("not working if price is lower or equal to zero", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC721TokenSellingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[1],
                    price: 0
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC721TokenSellingOffer: price can't be lower or equal to zero");
        })

        it("not working if owner has not approved", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC721TokenSellingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[1],
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC721TokenSellingOffer: Owner has not approved");
        })

        it("Works fine with normal flow", async () => {

            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, true, {from: accounts[0]});

            await tokenexchange_contract.PlaceERC721TokenSellingOffer({
                exchangeId: 1,
                tokenId: tokenIds[1],
                price: 10
            }, accounts[0]);
            assert.equal(await exchangetoken_contract.ownerOf(tokenIds[1]), tokenexchange_contract.address);
        })
    });

    describe("CancelERC721TokenBuyingOffer", () => {
        it("not working if not owner", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC721TokenBuyingOffer({
                    exchangeId: 1,
                    offerId: 2,
                }, accounts[1]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC721TokenBuyingOffer: should be owner");
        })

        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC721TokenBuyingOffer({
                    exchangeId: 2,
                    offerId: 2,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC721TokenBuyingOffer: should be the same exchangeId");
        })

        it("not working if not the buying offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC721TokenBuyingOffer({
                    exchangeId: 1,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC721TokenBuyingOffer: should be the buying offer");
        })

        it("Works fine with normal flow", async () => {

            await offertoken_contract.approve(tokenexchange_contract.address, 10, {from: accounts[0]});
            await tokenexchange_contract.PlaceERC721TokenBuyingOffer({
                exchangeId: 1,
                tokenId: tokenIds[2],
                price: 10
            }, accounts[0]);

            let initialBalance = await offertoken_contract.balanceOf(tokenexchange_contract.address);
            let offer = await tokenexchange_contract.getErc721OfferById(4);

            await tokenexchange_contract.CancelERC721TokenBuyingOffer({
                exchangeId: 1,
                offerId: 4,
            }, accounts[0]);
            assert.equal(
                await offertoken_contract.balanceOf(tokenexchange_contract.address), 
                parseInt(initialBalance) - offer.price
            );
        })
    });

    describe("CancelERC721TokenSellingOffer", () => {
        it("not working if not owner", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC721TokenSellingOffer({
                    exchangeId: 1,
                    offerId: 1,
                }, accounts[1]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC721TokenSellingOffer: should be owner");
        })

        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC721TokenSellingOffer({
                    exchangeId: 2,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC721TokenSellingOffer: should be the same exchangeId");
        })

        it("not working if not the selling offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC721TokenSellingOffer({
                    exchangeId: 1,
                    offerId: 2,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC721TokenSellingOffer: should be the selling offer");
        })

        it("Works fine with normal flow", async () => {

            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, true, {from: accounts[0]});

            await tokenexchange_contract.PlaceERC721TokenSellingOffer({
                exchangeId: 1,
                tokenId: tokenIds[2],
                price: 10
            }, accounts[0]);

            let initialBalance = await exchangetoken_contract.balanceOf(tokenexchange_contract.address);
            let offer = await tokenexchange_contract.getErc721OfferById(5);

            await tokenexchange_contract.CancelERC721TokenSellingOffer({
                exchangeId: 1,
                offerId: 5,
            }, accounts[0]);
            assert.equal(
                await exchangetoken_contract.ownerOf(tokenIds[2]), 
                offer.creatorAddress
            );
        })
    });

    describe("BuyERC721TokenFromOffer", () => {
        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.BuyERC721TokenFromOffer({
                    exchangeId: 2,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.BuyERC721TokenFromOffer: should be the same exchangeId");
        })

        it("not working if should be the selling offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.BuyERC721TokenFromOffer({
                    exchangeId: 1,
                    offerId: 2,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.BuyERC721TokenFromOffer: should be the selling offer");
        })

        it("Works fine with normal flow", async () => {
            let offer = await tokenexchange_contract.getErc721OfferById(1);
            let initBal = await offertoken_contract.balanceOf(offer.creatorAddress);
            
            await offertoken_contract.approve(tokenexchange_contract.address, offer.price, {from: accounts[1]})

            await tokenexchange_contract.BuyERC721TokenFromOffer({
                exchangeId: 1,
                offerId: 1,
            }, accounts[1]);
            assert.equal(await exchangetoken_contract.ownerOf(offer.tokenId), accounts[1]);
            assert.equal(await offertoken_contract.balanceOf(offer.creatorAddress), parseInt(initBal) + parseInt(offer.price));
        })
    });

    describe("SellERC721TokenFromOffer", () => {
        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.SellERC721TokenFromOffer({
                    exchangeId: 2,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.SellERC721TokenFromOffer: should be the same exchangeId");
        })

        it("not working if should be the buying offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.SellERC721TokenFromOffer({
                    exchangeId: 1,
                    offerId: 3,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.SellERC721TokenFromOffer: should be the buying offer");
        })

        it("Works fine with normal flow", async () => {
            let offer = await tokenexchange_contract.getErc721OfferById(2);
            let initBal = await offertoken_contract.balanceOf(accounts[1]);

            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, true, {from: accounts[1]});

            await tokenexchange_contract.SellERC721TokenFromOffer({
                exchangeId: 1,
                offerId: 2,
            }, accounts[1]);
            assert.equal(await exchangetoken_contract.ownerOf(offer.tokenId), offer.creatorAddress);
            assert.equal(await offertoken_contract.balanceOf(accounts[1]), parseInt(initBal) + parseInt(offer.price));
        })
    });
})



