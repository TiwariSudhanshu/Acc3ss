const hre = require("hardhat");

async function main() {
    console.log("Compiling contracts...");
    await hre.run("compile");

    console.log("Fetching contract factory...");
    const Access = await hre.ethers.getContractFactory("Access");

    console.log("Deploying contract...");
    const access = await Access.deploy();

    console.log("Waiting for deployment to finish...");
    await access.waitForDeployment();

    console.log("Getting deployed contract address...");
    console.log("Access contract deployed to:", access.target || access.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });