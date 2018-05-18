const SHA256 = require('crypto-js/sha256');

//This class keeps note of each transaction that takes place
class Transaction{
	constructor(fromAddress, toAddress, amount){
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}

//Creates one block in the blockchain
class Block{
	constructor(timestamp, transactions, previousHash = ''){
		this.timestamp = timestamp;
		this.transactions = transactions; //The data you want to store in the block
		this.previousHash = previousHash; //Hash of previous block
		this.hash = this.calculateHash(); //Calculates the hash based on the variables of the block
		//This nonce value is just to change the data in the block so that a different hash will be calculated when mining, even though all other pertinent data stays the same
		this.nonce = 0;
	}
	
	//This function calculates the hash of this block based on the properties of the block (i.e., the hash function)
	calculateHash(){
		return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
	}
	
	//Mining is also called proof-of-work
	//This makes a hash with a certain amount of zeros
	mineBlock(difficulty){
		
		/*
		The hash is a string.
		Check the first few characters in the hash (the substring determined by difficulty) to see if they have the corresponding number of zeros as difficulty.
		E.g. If difficulty is 5, then check if the first 5 characters of the hash is equal to '00000'.
		
		While the first few characters of the hash is not the corresponding number of zeros, then increment the nonce and recalculate the hash.
		*/
		while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")){
			this.nonce++;
			this.hash = this.calculateHash();
		}
		
		//Print it out to the console just to make sure that it is working
		console.log('Block mined: ' + this.hash);
	}
}

//Creates one blockchain
class Blockchain{
	//The constructor of the blockchain creates an array with the genesis block as the first element
	constructor(){
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 2;
		this.pendingTransactions = [];//This array holds all the transactions that are waiting to be included in the next block that gets added to the blockchain
		this.miningReward = 100;//The amount the miner gets for a successful mine
	}
	
	//This creates the first block in the chain with some default values
	createGenesisBlock(){
		return new Block("01/01/2018", [new Transaction('x','x',0)], "0");
	}
	
	//Gets the last block in the array
	getLatestBlock(){
		return this.chain[this.chain.length - 1];
	}
	
	minePendingTransactions(miningRewardAddress){
		//Create a new block with the current pending transactions to be mined
		let block = new Block(Date.now(), this.pendingTransactions)
		
		//Mine the block
		block.mineBlock(this.difficulty);
		
		console.log('Block successfully mined');
		
		//Set the 'previousHash' of the new block to the hash of the previous block
		block.previousHash = this.getLatestBlock().hash;
		
		//Add the block to the chain
		this.chain.push(block);
		
		//Add in the reward as a new transaction
		this.pendingTransactions = [
			new Transaction(null, miningRewardAddress, this.miningReward)
		];
	}
	
	//This pushes the incoming transaction into the pendingTransactions array
	createTransaction(transaction){
		this.pendingTransactions.push(transaction);
	}
	/*
	Get the balance of an address (i.e. how much 'coin' does the owner of the address have)
	
	There is no 'wallet', so to get the balance, we will have to loop through all the transactions in all the blocks of the blockchain and sum up the amounts.
	*/
	getBalanceOfAddress(address){
		let balance = 0;
		
		//Loop through the blocks
		for(const block of this.chain){
			//Loop through the transactions
			for(const transaction of block.transactions){
				console.log('------')
				console.log('nonce: ' + block.nonce);
				console.log('address: ' + address);
				console.log('transaction.toAddress: ' + transaction.toAddress);
				console.log('transaction.fromAddress: ' + transaction.fromAddress);
				//If the to address is that of the sender, then the sender receives the money, so we increment the balance
				if(transaction.toAddress === address){
					balance += transaction.amount;
				}
				
				//If the from address is that of the sender, then the sender gave the money, so we decrement the balance
				if(transaction.fromAddress === address){
					balance -= transaction.amount;
				}
			}
		}
		
		//Return the balance
		return balance;
	}
	
	/* Old mining method from part 1 and part 2 without the transactions
	
	//To add a block to the chain, you will have to mine the incoming block first
	addBlock(newBlock){
		//Get the hash of the previous block and insert it into the new block
		newBlock.previousHash = this.getLatestBlock().hash;//The two blocks are now linked
		//Mine in the new block, because with the nonce value that keeps changing, the hash changes too. The hash is calculated within the new block during mining, so 
		newBlock.mineBlock(this.difficulty);
		//Push it onto the chain
		this.chain.push(newBlock);
	}
	
	*/
	
	//Checks if the chain is valid by making sure that all the blocks link with each other
	isChainValid(){
		
		//Loop over entire chain to see if it is valid
		for(let i = 1; i < this.chain.length; i++){
			
			//Load in the blocks for easy handling
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i-1];
			
			//First check if the hash is actually the calculated hash
			if(currentBlock.hash !== currentBlock.calculateHash()){
				return false;
			}
			
			//Then check if the stored hash of the previous block in this block corresponds to the actual hash of previous block. If they don't match, then the chain is not valid
			if(currentBlock.previousHash !== previousBlock.hash){
				return false;
			}
		}//End of for loop
		
		//If the entire chain is valid, then return true
		return true;
	}
}

/* This part doesn't work anymore after creation of part 3

//This is from Part 1 of the tutorial
console.log('----------------------------');
console.log('Part 1:');

//Create a new blockchain
let p1Coin = new Blockchain();

//Add in a block
p1Coin.addBlock(new Block(1, "02/02/2018",{amount: 4}));
p1Coin.addBlock(new Block(2, "03/03/2018",{amount: 7}));
p1Coin.addBlock(new Block(3, "04/04/2018",{amount: 8}));

//Print out the blockchain to the console to see what it looks like
console.log(JSON.parse(JSON.stringify(p1Coin)));

//Check if the chain is valid without tampering
console.log('Is blockchain valid? ' + p1Coin.isChainValid());

//Tamper with the chain by changing the data
p1Coin.chain[2].data = {amount: 500};

//Reset the hash of the block and see if it states that is is valid
p1Coin.chain[2].hash = p1Coin.chain[2].calculateHash();

//Check if the tampered chain is valid;
console.log('Is blockchain valid? ' + p1Coin.isChainValid());

//*/

/* This part doesn't work anymore after creation of part 3

//This is from Part 2 of the tutorial
console.log('----------------------------');
console.log('Part 2:');

//Create a new blockchain
let p2Coin = new Blockchain();

//Mine the blocks
console.log('Mining block 1...');
p2Coin.addBlock(new Block(1, "02/02/2018",{amount: 4}));
console.log('Mining block 2...');
p2Coin.addBlock(new Block(2, "03/03/2018",{amount: 7}));
console.log('Mining block 3...');
p2Coin.addBlock(new Block(3, "04/04/2018",{amount: 8}));

//*/

//This is from Part 3 of the tutorial
console.log('----------------------------');
console.log('Part 3:');

//Create a new blockchain
let p3Coin = new Blockchain();

//Create transactions that are added to the blockchain's pendingTransactions array
p3Coin.createTransaction(new Transaction('address1', 'address2', 80));
p3Coin.createTransaction(new Transaction('address2', 'address1', 50));

console.log(p3Coin);

//Mine the pendingTransactions array to add a block to the blockchain with the transactions
console.log('\nStarting the miner...')
p3Coin.minePendingTransactions('myAddress');

console.log(p3Coin);

//This one below will still be zero because the reward is a new transaction that is in the new pendingTransaction array that will be added in only after the next block
console.log('\nMy balance is ' + p3Coin.getBalanceOfAddress('myAddress'));


console.log('\nStarting the miner...')
p3Coin.minePendingTransactions('myAddress');

console.log(p3Coin);

//This will only show the first reward as the current reward is added to the pendingTransactions array for the next mine
console.log('\nMy balance is ' + p3Coin.getBalanceOfAddress('myAddress'));
console.log('\nBalance of address1 is ' + p3Coin.getBalanceOfAddress('address1'));
console.log('\nBalance of address2 is ' + p3Coin.getBalanceOfAddress('address2'));

console.log(p3Coin);