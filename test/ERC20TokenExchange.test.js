const ERC20TokenExchange = artifacts.require("ERC20TokenExchange");

const PRIVIERC20TestToken = artifacts.require("PRIVIERC20TestToken");
const PRIVIOfferTestToken = artifacts.require("PRIVIOfferTestToken");

contract("ERC20TokenExchange", (accounts) => {
    var tokenexchange_contract;
    var offertoken_contract;
    var exchangetoken_contract;

    before(async () => {
        tokenexchange_contract = await ERC20TokenExchange.new(
            { from: accounts[0] }
        );

        exchangetoken_contract = await PRIVIERC20TestToken.new(
            { from: accounts[0] }
        );

        offertoken_contract = await PRIVIOfferTestToken.new(
            { from: accounts[0] }
        );

        await offertoken_contract.mint(accounts[1], 100000);

        await exchangetoken_contract.mint(accounts[0], 10);
        await exchangetoken_contract.mint(accounts[1], 10);
    });

    describe("CreateERC20TokenExchange", () => {
        it("not working if balance is not enough", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CreateERC20TokenExchange({
                    exchangeName: "erc20exchange",
                    exchangeTokenAddress: exchangetoken_contract.address,
                    offerTokenAddress: offertoken_contract.address,
                    amount: 15,
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CreateERC20TokenExchange: Your balance is not enough");
        })

        it("not working if price is lower or equal to zero", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CreateERC20TokenExchange({
                    exchangeName: "erc20exchange",
                    exchangeTokenAddress: exchangetoken_contract.address,
                    offerTokenAddress: offertoken_contract.address,
                    amount: 2,
                    price: 0
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CreateERC20TokenExchange: price can't be lower or equal to zero");
        })

        it("not working if owner has not approved", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CreateERC20TokenExchange({
                    exchangeName: "erc20exchange",
                    exchangeTokenAddress: exchangetoken_contract.address,
                    offerTokenAddress: offertoken_contract.address,
                    amount: 2,
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "ERC20: transfer amount exceeds allowance");
        })

        it("Works fine with normal flow", async () => {
            
            await exchangetoken_contract.approve(tokenexchange_contract.address, 2, {from: accounts[0]});
            await tokenexchange_contract.CreateERC20TokenExchange({
                exchangeName: "erc20exchange",
                exchangeTokenAddress: exchangetoken_contract.address,
                offerTokenAddress: offertoken_contract.address,
                amount: 2,
                price: 10,
            }, accounts[0]);
            assert.equal(await exchangetoken_contract.balanceOf(tokenexchange_contract.address),2);
        })
    });

    describe("PlaceERC20TokenBuyingOffer", () => {
        it("not working if balance is not enough", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC20TokenBuyingOffer({
                    exchangeId: 1,
                    amount: 2,
                    price: 200000
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC20TokenBuyingOffer: you don't have enough balance");
        })

        it("not working if price is lower or equal to zero", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC20TokenBuyingOffer({
                    exchangeId: 1,
                    amount: 2,
                    price: 0
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC20TokenBuyingOffer: price can't be lower or equal to zero");
        })

        it("not working if owner has not approved", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC20TokenBuyingOffer({
                    exchangeId: 1,
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
            await tokenexchange_contract.PlaceERC20TokenBuyingOffer({
                exchangeId: 1,
                amount: 2,
                price: 10
            }, accounts[0]);
            assert.equal(await offertoken_contract.balanceOf(tokenexchange_contract.address),20);
        })
    });

    describe("PlaceERC20TokenSellingOffer", () => {
        it("not working if balance is not enough", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC20TokenSellingOffer({
                    exchangeId: 1,
                    amount: 12,
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC20TokenSellingOffer: you don't have enough balance");
        })

        it("not working if price is lower or equal to zero", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC20TokenSellingOffer({
                    exchangeId: 1,
                    amount: 2,
                    price: 0
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.PlaceERC20TokenSellingOffer: price can't be lower or equal to zero");
        })

        it("not working if owner has not approved", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.PlaceERC20TokenSellingOffer({
                    exchangeId: 1,
                    amount: 2,
                    price: 10
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "ERC20: transfer amount exceeds allowance");
        })

        it("Works fine with normal flow", async () => {

            let initialBalance = await exchangetoken_contract.balanceOf(tokenexchange_contract.address);
            await exchangetoken_contract.approve(tokenexchange_contract.address, 2, {from: accounts[0]});

            await tokenexchange_contract.PlaceERC20TokenSellingOffer({
                exchangeId: 1,
                amount: 2,
                price: 10
            }, accounts[0]);

            assert.equal(await exchangetoken_contract.balanceOf(tokenexchange_contract.address), parseInt(initialBalance) + 2);
        })
    });

    describe("CancelERC20TokenBuyingOffer", () => {
        it("not working if not owner", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC20TokenBuyingOffer({
                    exchangeId: 1,
                    offerId: 2,
                }, accounts[1]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC20TokenBuyingOffer: should be owner");
        })

        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC20TokenBuyingOffer({
                    exchangeId: 2,
                    offerId: 2,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC20TokenBuyingOffer: should be the same exchangeId");
        })

        it("not working if not the buying offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC20TokenBuyingOffer({
                    exchangeId: 1,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC20TokenBuyingOffer: should be the buying offer");
        })

        it("Works fine with normal flow", async () => {

            await offertoken_contract.approve(tokenexchange_contract.address, 20, {from: accounts[0]});
            await tokenexchange_contract.PlaceERC20TokenBuyingOffer({
                exchangeId: 1,
                amount: 2,
                price: 10
            }, accounts[0]);

            let initialBalance = await offertoken_contract.balanceOf(tokenexchange_contract.address);
            let offer = await tokenexchange_contract.getErc20OfferById(4);

            await tokenexchange_contract.CancelERC20TokenBuyingOffer({
                exchangeId: 1,
                offerId: 4,
            }, accounts[0]);
            assert.equal(
                await offertoken_contract.balanceOf(tokenexchange_contract.address), 
                parseInt(initialBalance) - (offer.price * offer.amount)
            );
        })
    });

    describe("CancelERC20TokenSellingOffer", () => {
        it("not working if not owner", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC20TokenSellingOffer({
                    exchangeId: 1,
                    offerId: 1,
                }, accounts[1]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC20TokenSellingOffer: should be owner");
        })

        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC20TokenSellingOffer({
                    exchangeId: 2,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC20TokenSellingOffer: should be the same exchangeId");
        })

        it("not working if not the selling offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.CancelERC20TokenSellingOffer({
                    exchangeId: 1,
                    offerId: 2,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.CancelERC20TokenSellingOffer: should be the selling offer");
        })

        it("Works fine with normal flow", async () => {

            await exchangetoken_contract.approve(tokenexchange_contract.address, 2, {from: accounts[0]});

            await tokenexchange_contract.PlaceERC20TokenSellingOffer({
                exchangeId: 1,
                amount: 2,
                price: 10
            }, accounts[0]);

            let initialBalance = await exchangetoken_contract.balanceOf(tokenexchange_contract.address);
            let offer = await tokenexchange_contract.getErc20OfferById(5);

            await tokenexchange_contract.CancelERC20TokenSellingOffer({
                exchangeId: 1,
                offerId: 5,
            }, accounts[0]);
            assert.equal(
                await exchangetoken_contract.balanceOf(tokenexchange_contract.address), 
                parseInt(initialBalance) - (offer.amount)
            );
        })
    });

    describe("BuyERC20TokenFromOffer", () => {
        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.BuyERC20TokenFromOffer({
                    exchangeId: 2,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.BuyERC20TokenFromOffer: should be the same exchangeId");
        })

        it("not working if should be the selling offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.BuyERC20TokenFromOffer({
                    exchangeId: 1,
                    offerId: 2,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.BuyERC20TokenFromOffer: should be the selling offer");
        })

        it("Works fine with normal flow", async () => {
            let offer = await tokenexchange_contract.getErc20OfferById(1);
            let initBal1 = await exchangetoken_contract.balanceOf(accounts[1]);
            let initBal2 = await offertoken_contract.balanceOf(offer.creatorAddress);
            
            await offertoken_contract.approve(tokenexchange_contract.address, offer.price * offer.amount, {from: accounts[1]})

            await tokenexchange_contract.BuyERC20TokenFromOffer({
                exchangeId: 1,
                offerId: 1,
            }, accounts[1]);
            assert.equal(await exchangetoken_contract.balanceOf(accounts[1]), parseInt(initBal1) + parseInt(offer.amount));
            assert.equal(await offertoken_contract.balanceOf(offer.creatorAddress), parseInt(initBal2) + parseInt(offer.price * offer.amount));
        })
    });

    describe("SellERC20TokenFromOffer", () => {
        it("not working if not the same exchangeId", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.SellERC20TokenFromOffer({
                    exchangeId: 2,
                    offerId: 1,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.SellERC20TokenFromOffer: should be the same exchangeId");
        })

        it("not working if should be the buying offer", async () => {
            let thrownError;

            try {
                await tokenexchange_contract.SellERC20TokenFromOffer({
                    exchangeId: 1,
                    offerId: 3,
                }, accounts[0]);
            } catch (error) {
                thrownError = error;
            }
            assert.include(thrownError.message, "TokenExchange.SellERC20TokenFromOffer: should be the buying offer");
        })

        it("Works fine with normal flow", async () => {
            let offer = await tokenexchange_contract.getErc20OfferById(2);
            let initBal1 = await offertoken_contract.balanceOf(offer.creatorAddress);
            let initBal2 = await exchangetoken_contract.balanceOf(accounts[1]);
            
            await exchangetoken_contract.approve(tokenexchange_contract.address, offer.amount, {from: offer.creatorAddress})

            await tokenexchange_contract.SellERC20TokenFromOffer({
                exchangeId: 1,
                offerId: 2,
            }, accounts[1]);
            assert.equal(await exchangetoken_contract.balanceOf(accounts[1]), parseInt(initBal2) + parseInt(offer.amount));
            assert.equal(await offertoken_contract.balanceOf(offer.creatorAddress), parseInt(initBal1) + parseInt(offer.price * offer.amount));
        })
    });
})



