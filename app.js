var StellarSdk = require('stellar-sdk');
//const fetch = require('node-fetch');

//StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

const src = StellarSdk.Keypair.fromSecret('SD7MKCMZB2VJFU5OLK7L36XAS7EL26QN6VRGZEAT6MOQ5UPLA4FRM4R2');
const dst = StellarSdk.Keypair.fromSecret('SDFV4CKPBDTGKQO2CRR7E42KTMZDWBD2NKKLKVMTJUCPXCPC4MCHU2CR');

console.log('Souce public address:          ' + src.publicKey());
console.log('Destination public address:    ' + dst.publicKey());

StellarSdk.Network.useTestNetwork();
(async function main() {
    try {
            const fee = await server.fetchBaseFee();

            server.loadAccount(dst.publicKey())
            .catch(StellarSdk.NotFoundError, function(error){
                throw new Error('Destination account does not exist');
            })
            .then(function(destination){
                destination.balances.forEach(function(balance) {
                    console.log("Destination Account Balance -> ", balance.balance);
                });
            })
            .then(function(){
                return server.loadAccount(src.publicKey());
            })
            .then(function (sourceAccount){

                // Check and display balance
                sourceAccount.balances.forEach(function(balance) {
                    console.log("Source Account Balance -> ", balance.balance);
                });

                // Start building the transaction.
                transaction = new StellarSdk.TransactionBuilder(sourceAccount, {fee})
                    .addOperation(StellarSdk.Operation.payment({
                    destination: dst.publicKey().toString(),
                    asset: StellarSdk.Asset.native(),
                    amount: "10"
                    }))
                    .addMemo(StellarSdk.Memo.text('Test Transaction'))
                    .setTimeout(180)
                    .build();
                // Sign the transaction to prove you are actually the person sending it.
                transaction.sign(src);
                // And finally, send it off to Stellar!
                return server.submitTransaction(transaction);
            })
            .then(function(result) {
                console.log('10 XML Successfully transferred');
                //console.log(result);
            })
            .catch(function(error) {
                throw new Error('Error in fund transfer');
            })
            .then(function(){
                console.log('Balance after transfer');    
                return server.loadAccount(src.publicKey());
            })
            .then(function(source){
                source.balances.forEach(function(balance) {
                    console.log("Source Account Balance -> ", balance.balance);
                });
                return server.loadAccount(dst.publicKey());
            })
            .then(function(destination){
                destination.balances.forEach(function(balance) {
                    console.log("Destination Account Balance -> ", balance.balance);
                });
            })

        } catch (e) {
            console.error("ERROR!", e);
        }
})()