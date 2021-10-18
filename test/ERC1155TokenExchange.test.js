const ERC1155TokenExchange = artifacts.require("ERC1155TokenExchange");

const PRIVIERC1155TestToken = artifacts.require("PRIVIERC1155TestToken");
const PRIVIOfferTestToken = artifacts.require("PRIVIOfferTestToken");

contract("ERC1155TokenExchange", (accounts) => {
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
        tokenexchange_contract = await ERC1155TokenExchange.new(
            { from: accounts[0] }
        );

        exchangetoken_contract = await PRIVIERC1155TestToken.new(
            { from: accounts[0] }
        );

        offertoken_contract = await PRIVIOfferTestToken.new(
            { from: accounts[0] }
        );

        await offertoken_contract.mint(accounts[1], 100000);

        await exchangetoken_contract.safeMint(accounts[0], tokenIds[0], 2);
        await exchangetoken_contract.safeMint(accounts[0], tokenIds[1], 2);
        await exchangetoken_contract.safeMint(accounts[0], tokenIds[2], 2);
        await exchangetoken_contract.safeMint(accounts[1], tokenIds[5], 2);

    });

    describe("CreateERC1155TokenExchange", () => {
        it("not working if your balance is not enough", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CreateERC1155TokenExchange({
                    exchangeName: "erc1155exchange",
                    exchangeTokenAddress: exchangetoken_contract.address,
                    offerTokenAddress: offertoken_contract.address,
                    tokenId: tokenIds[0],
                    amount: 3,
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CreateERC1155TokenExchange: Your balance is not enough");
        })

        it("not working if price is lower or equal to zero", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CreateERC1155TokenExchange({
                    exchangeName: "erc1155exchange",
                    exchangeTokenAddress: exchangetoken_contract.address,
                    offerTokenAddress: offertoken_contract.address,
                    tokenId: tokenIds[0],
                    amount: 2,
                    price: 0
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CreateERC1155TokenExchange: price can't be lower or equal to zero");
        })

        it("not working if owner has not approved", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CreateERC1155TokenExchange({
                    exchangeName: "erc1155exchange",
                    exchangeTokenAddress: exchangetoken_contract.address,
                    offerTokenAddress: offertoken_contract.address,
                    tokenId: tokenIds[0],
                    amount: 2,
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CreateERC1155TokenExchange: Owner has not approved");
        })

        it("Works fine with normal flow", async () => {
            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, true, {from: accounts[0]});
            await tokenexchange_contract.CreateERC1155TokenExchange({
                exchangeName: "erc1155exchange",
                exchangeTokenAddress: exchangetoken_contract.address,
                offerTokenAddress: offertoken_contract.address,
                tokenId: tokenIds[0],
                amount: 2,
                price: 10
            }, accounts[0]);
            assert.equal(await exchangetoken_contract.balanceOf(tokenexchange_contract.address, tokenIds[0]), 2);
        })
     });

    describe("PlaceERC1155TokenBuyingOffer", () => {
        it("not working if balance is not enough", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC1155TokenBuyingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[0],
                    amount: 2,
                    price: 200000
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC1155TokenBuyingOffer: you don't have enough balance");
        })

        it("not working if price is lower or equal to zero", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC1155TokenBuyingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[0],
                    amount: 2,
                    price: 0
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC1155TokenBuyingOffer: price can't be lower or equal to zero");
        })

        it("not working if owner has not approved", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC1155TokenBuyingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[0],
                    amount: 2,
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "ERC20: transfer amount exceeds allowance");
        })

        it("Works fine with normal flow", async () => {

            await offertoken_contract.approve(tokenexchange_contract.address, 20, {from: accounts[0]});
            await tokenexchange_contract.PlaceERC1155TokenBuyingOffer({
                exchangeId: 1,
                tokenId: tokenIds[0],
                amount: 2,
                price: 10
            }, accounts[0]);
            assert.equal(await offertoken_contract.balanceOf(tokenexchange_contract.address),20);
        })
    });

    describe("PlaceERC1155TokenSellingOffer", () => {
        it("not working if balance is not enough", async () => {
            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, false, {from: accounts[0]});
            
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC1155TokenSellingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[1],
                    price: 10,
                    amount: 2
                }, accounts[1]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC1155TokenSellingOffer: Your balance is not enough");
        })

        it("not working if price is lower or equal to zero", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC1155TokenSellingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[1],
                    amount: 2,
                    price: 0
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC1155TokenSellingOffer: price can't be lower or equal to zero");
        })

        it("not working if owner has not approved", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC1155TokenSellingOffer({
                    exchangeId: 1,
                    tokenId: tokenIds[1],
                    amount: 2,
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC1155TokenSellingOffer: Owner has not approved");
        })

        it("Works fine with normal flow", async () => {

            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, true, {from: accounts[0]});

            await tokenexchange_contract.PlaceERC1155TokenSellingOffer({
                exchangeId: 1,
                tokenId: tokenIds[1],
                amount: 2,
                price: 10
            }, accounts[0]);
            assert.equal(await exchangetoken_contract.balanceOf(tokenexchange_contract.address, tokenIds[1]), 2);
        })
    });

    describe("CancelERC1155TokenBuyingOffer", () => {
        it("not working if not owner", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC1155TokenBuyingOffer({
                    exchangeId: 1,
                    offerId: 2,
                }, accounts[1]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC1155TokenBuyingOffer: should be owner");
        })

        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC1155TokenBuyingOffer({
                    exchangeId: 2,
                    offerId: 2,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC1155TokenBuyingOffer: should be the same exchangeId");
        })

        it("not working if not the buying offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC1155TokenBuyingOffer({
                    exchangeId: 1,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC1155TokenBuyingOffer: should be the buying offer");
        })

        it("Works fine with normal flow", async () => {

            await offertoken_contract.approve(tokenexchange_contract.address, 20, {from: accounts[0]});
            await tokenexchange_contract.PlaceERC1155TokenBuyingOffer({
                exchangeId: 1,
                tokenId: tokenIds[2],
                amount: 2,
                price: 10
            }, accounts[0]);

            let initialBalance = await offertoken_contract.balanceOf(tokenexchange_contract.address);
            let offer = await tokenexchange_contract.getErc1155OfferById(4);

            await tokenexchange_contract.CancelERC1155TokenBuyingOffer({
                exchangeId: 1,
                offerId: 4,
            }, accounts[0]);
            assert.equal(
                await offertoken_contract.balanceOf(tokenexchange_contract.address), 
                parseInt(initialBalance) - (offer.price * offer.amount)
            );
        })
    });

    describe("CancelERC1155TokenSellingOffer", () => {
        it("not working if not owner", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC1155TokenSellingOffer({
                    exchangeId: 1,
                    offerId: 1,
                }, accounts[1]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC1155TokenSellingOffer: should be owner");
        })

        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC1155TokenSellingOffer({
                    exchangeId: 2,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC1155TokenSellingOffer: should be the same exchangeId");
        })

        it("not working if not the selling offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC1155TokenSellingOffer({
                    exchangeId: 1,
                    offerId: 2,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC1155TokenSellingOffer: should be the selling offer");
        })

        it("Works fine with normal flow", async () => {
            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, true, {from: accounts[0]});

            await tokenexchange_contract.PlaceERC1155TokenSellingOffer({
                exchangeId: 1,
                tokenId: tokenIds[2],
                amount: 2,
                price: 10
            }, accounts[0]);

            let offer = await tokenexchange_contract.getErc1155OfferById(5);
            let initialBalance = await exchangetoken_contract.balanceOf(offer.creatorAddress, tokenIds[2]);

            await tokenexchange_contract.CancelERC1155TokenSellingOffer({
                exchangeId: 1,
                offerId: 5,
            }, offer.creatorAddress);
            assert.equal(
                await exchangetoken_contract.balanceOf(offer.creatorAddress, tokenIds[2]), 
                parseInt(initialBalance) + 2
            );
        })
    });

    describe("BuyERC1155TokenFromOffer", () => {
        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.BuyERC1155TokenFromOffer({
                    exchangeId: 2,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.BuyERC1155TokenFromOffer: should be the same exchangeId");
        })

        it("not working if should be the selling offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.BuyERC1155TokenFromOffer({
                    exchangeId: 1,
                    offerId: 2,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.BuyERC1155TokenFromOffer: should be the selling offer");
        })

        it("Works fine with normal flow", async () => {
            let offer = await tokenexchange_contract.getErc1155OfferById(1);
            let initBal1 = exchangetoken_contract.balanceOf(accounts[1], offer.tokenId);
            if(isNaN(initBal1)) {
                initBal1 = "0";
            }
            let initBal2 = await offertoken_contract.balanceOf(offer.creatorAddress);
            
            await offertoken_contract.approve(tokenexchange_contract.address, offer.price * offer.amount, {from: accounts[1]})

            await tokenexchange_contract.BuyERC1155TokenFromOffer({
                exchangeId: 1,
                offerId: 1,
            }, accounts[1]);
            assert.equal(await exchangetoken_contract.balanceOf(accounts[1], offer.tokenId), parseInt(initBal1) + parseInt(offer.amount));
            assert.equal(await offertoken_contract.balanceOf(offer.creatorAddress), parseInt(initBal2) + (offer.price * offer.amount));
        })
    });

    describe("SellERC1155TokenFromOffer", () => {
        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.SellERC1155TokenFromOffer({
                    exchangeId: 2,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.SellERC1155TokenFromOffer: should be the same exchangeId");
        })

        it("not working if should be the buying offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.SellERC1155TokenFromOffer({
                    exchangeId: 1,
                    offerId: 3,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.SellERC1155TokenFromOffer: should be the buying offer");
        })

        it("Works fine with normal flow", async () => {
            let offer = await tokenexchange_contract.getErc1155OfferById(2);
            let initBal1 = exchangetoken_contract.balanceOf(accounts[1], offer.tokenId);
            if(isNaN(initBal1)) {
                initBal1 = "0";
            }
            let initBal2 = await offertoken_contract.balanceOf(accounts[1]);

            await exchangetoken_contract.setApprovalForAll(tokenexchange_contract.address, true, {from: accounts[1]});

            await tokenexchange_contract.SellERC1155TokenFromOffer({
                exchangeId: 1,
                offerId: 2,
            }, accounts[1]);
            assert.equal(await exchangetoken_contract.balanceOf(offer.creatorAddress, offer.tokenId), parseInt(initBal1) + parseInt(offer.amount));
            assert.equal(await offertoken_contract.balanceOf(accounts[1]), parseInt(initBal2) + parseInt(offer.price * offer.amount));
        })
    });
})



