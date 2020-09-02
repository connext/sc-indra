const consensusAppArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/ConsensusApp.json');
const countingAppArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/CountingApp.json');
const erc20AssetHolderArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/TestErc20AssetHolder.json');
const ethAssetHolderArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/TestEthAssetHolder.json');
const nitroAdjudicatorArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/NitroAdjudicator.json');
const singleAssetPaymentsArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/SingleAssetPayments.json');
const testAssetHolderArtifact1 = require('@statechannels/nitro-protocol/lib/build/contracts/TESTAssetHolder.json');
const testAssetHolderArtifact2 = require('@statechannels/nitro-protocol/lib/build/contracts/TESTAssetHolder2.json');
const testForceMoveArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/TESTForceMove.json');
const testNitroAdjudicatorArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/TESTNitroAdjudicator.json');
const tokenArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/Token.json');
const trivialAppArtifact = require('@statechannels/nitro-protocol/lib/build/contracts/TrivialApp.json');

const fs = require('fs');
const eth = require('ethers');

const provider = new eth.providers.JsonRpcProvider("http://localhost:8545");
const wallet = eth.Wallet.fromMnemonic(process.env.MNEMONIC).connect(provider);

const deployer = { 
  deploy: async (artifact, libs, ...args) => {
    try {
      const factory = eth.ContractFactory.fromSolidity(artifact).connect(wallet);
      const deployTx = factory.getDeployTransaction(...args);
      const tx = await wallet.sendTransaction(deployTx);
      console.log(`Sent transaction to deploy ${artifact.contractName}, txHash: ${tx.hash}`);
      const receipt = await tx.wait();
      const address = eth.Contract.getContractAddress(tx);
      console.log(`Transaction mined, succesfully deployed contract to ${address}`);
      return address;
    } catch (e) {
      console.error(e.stack);
      process.exit(1);
    }
  }
};

const deploy = async () => {

  const network = await provider.getNetwork();
  console.log(`Deploying state channel contracts to chain ${JSON.stringify(network)}`);
  const chainId = network.chainId;

  const NITRO_ADJUDICATOR_ADDRESS = await deployer.deploy(nitroAdjudicatorArtifact);

  const COUNTING_APP_ADDRESS = await deployer.deploy(countingAppArtifact);
  const SINGLE_ASSET_PAYMENT_ADDRESS = await deployer.deploy(singleAssetPaymentsArtifact);
  const TEST_NITRO_ADJUDICATOR_ADDRESS = await deployer.deploy(testNitroAdjudicatorArtifact);
  const CONSENSUS_APP_ADDRESS = await deployer.deploy(consensusAppArtifact);
  const TRIVIAL_APP_ADDRESS = await deployer.deploy(trivialAppArtifact);
  const TEST_FORCE_MOVE_ADDRESS = await deployer.deploy(testForceMoveArtifact);
  const TEST_ASSET_HOLDER_ADDRESS = await deployer.deploy(
    testAssetHolderArtifact1,
    {},
    TEST_NITRO_ADJUDICATOR_ADDRESS
  );
  const TEST_ASSET_HOLDER2_ADDRESS = await deployer.deploy(
    testAssetHolderArtifact2,
    {},
    TEST_NITRO_ADJUDICATOR_ADDRESS
  );

  // for test purposes in this package, wire up the assetholders with the testNitroAdjudicator

  const TEST_TOKEN_ADDRESS = await deployer.deploy(tokenArtifact, {}, 0);
  const TEST_ETH_ASSET_HOLDER_ADDRESS = await deployer.deploy(
    ethAssetHolderArtifact,
    {},
    TEST_NITRO_ADJUDICATOR_ADDRESS
  );
  const TEST_TOKEN_ASSET_HOLDER_ADDRESS = await deployer.deploy(
    erc20AssetHolderArtifact,
    {},
    TEST_NITRO_ADJUDICATOR_ADDRESS,
    TEST_TOKEN_ADDRESS
  );
  return { [chainId]: {
    NITRO_ADJUDICATOR_ADDRESS,
    COUNTING_APP_ADDRESS,
    SINGLE_ASSET_PAYMENT_ADDRESS,
    CONSENSUS_APP_ADDRESS,
    TRIVIAL_APP_ADDRESS,
    TEST_FORCE_MOVE_ADDRESS,
    TEST_NITRO_ADJUDICATOR_ADDRESS,
    TEST_TOKEN_ADDRESS,
    TEST_ETH_ASSET_HOLDER_ADDRESS,
    TEST_TOKEN_ASSET_HOLDER_ADDRESS,
    TEST_ASSET_HOLDER_ADDRESS,
    TEST_ASSET_HOLDER2_ADDRESS,
  }};
};

deploy().then(
  res => {
    console.log(`Finished migrating contracts, result: ${JSON.stringify(res)}`);
    fs.writeFileSync('/data/address-book.json', JSON.stringify(res, null, 2));
    process.exit(0);
  }
);
console.log(`Started contract migration..`);
