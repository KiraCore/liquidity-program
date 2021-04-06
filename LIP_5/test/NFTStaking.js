const { expect } = require('chai');
const { time } = require('@openzeppelin/test-helpers');
const moment = require('moment');

require('@openzeppelin/test-helpers/configure')({
  provider: 'http://127.0.0.1:7545',
});

describe('nftStaking', async function () {
  let mockKex;
  let mockNFT;
  let nftStaking;
  let distributor;
  let kiraAccessControl;
  let owner, user;

  const TOKEN_GOLD = 0;

  before(async function () {
    // Get the ContractFactory and Signers here.
    [owner, user, ...addrs] = await ethers.getSigners();

    const MockKex = await ethers.getContractFactory('MockKex');
    mockKex = await MockKex.deploy('MockKex', 'MKEX', ethers.utils.parseEther('1000000'));
    await mockKex.deployed();
    console.log('MockKex address: ', mockKex.address);

    const MockNFT1155 = await ethers.getContractFactory('MockNFT1155');
    mockNFT = await MockNFT1155.deploy();
    await mockNFT.deployed();
    console.log('MockNFT1155 address: ', mockNFT.address);

    const KiraAccessControl = await ethers.getContractFactory('KiraAccessControl');
    kiraAccessControl = await KiraAccessControl.deploy();
    await kiraAccessControl.deployed();
    await kiraAccessControl.addManagerRole(owner.address);
    console.log('AccessControl address: ', kiraAccessControl.address);

    const RewardDistributor = await ethers.getContractFactory('RewardDistributor');
    distributor = await RewardDistributor.deploy(mockKex.address, kiraAccessControl.address);
    await distributor.deployed();
    console.log('RewardDistributor address: ', distributor.address);

    const NFTStaking = await ethers.getContractFactory('NFTStaking');
    nftStaking = await NFTStaking.deploy(
      kiraAccessControl.address,
      distributor.address,
      mockNFT.address,
      TOKEN_GOLD,
      50,
      moment().unix(),
      40 * 3600 * 24,
      ethers.utils.parseEther('50'),
      30 * 3600 * 24,
      60 * 3600 * 24,
    );
    await nftStaking.deployed();

    await nftStaking.updatePoolPeriod(100 * 3600 * 24);
    await nftStaking.addToWhitelist(user.address);

    console.log('NFTStaking address: ', nftStaking.address);

    await kiraAccessControl.addManagerRole(nftStaking.address);

    await mockNFT.connect(owner).setApprovalForAll(nftStaking.address, true);
    await mockNFT.connect(owner).setApprovalForAll(user.address, true);
    await mockNFT.connect(user).setApprovalForAll(nftStaking.address, true);
    await mockNFT.safeTransferFrom(owner.address, user.address, TOKEN_GOLD, 100, 0x0);
    await mockKex.connect(owner).approve(distributor.address, ethers.constants.MaxUint256);
    await distributor.depositeReward(ethers.utils.parseEther('10000'));
  });

  it('Should be able to stake', async function () {
    await nftStaking.connect(user).stake(5);
    await nftStaking.connect(user).stake(5);

    expect(await nftStaking.totalStakeOf(user.address)).to.equal(10);
    expect(await nftStaking.getTotalStakes()).to.equal(10);
    expect(await mockNFT.balanceOf(user.address, TOKEN_GOLD)).to.equal(90);
  });

  it('Should be able to claim reward', async function () {
    await time.increase(time.duration.days(59));

    const reward = +parseFloat(ethers.utils.formatEther(await nftStaking.rewardOf(user.address))).toFixed(2);

    expect(reward).to.equal(+((500 * 29) / 30).toFixed(2));

    await nftStaking.connect(user).claimReward();

    expect(await nftStaking.totalStakeOf(user.address)).to.equal(10);
    expect(await nftStaking.getTotalStakes()).to.equal(10);
    expect(+parseFloat(ethers.utils.formatEther(await mockKex.balanceOf(user.address))).toFixed(2)).to.equal(reward);
  });

  it('Should be able to unstake', async function () {
    await time.increase(time.duration.days(11));
    const balance = +parseFloat(ethers.utils.formatEther(await mockKex.balanceOf(user.address))).toFixed(4);
    const reward = +parseFloat(ethers.utils.formatEther(await nftStaking.rewardOf(user.address))).toFixed(4);

    await nftStaking.connect(user).unstake();

    expect(await nftStaking.totalStakeOf(user.address)).to.equal(0);
    expect(await nftStaking.getTotalStakes()).to.equal(0);
    expect(+parseFloat(ethers.utils.formatEther(await mockKex.balanceOf(user.address))).toFixed(4)).to.equal(
      +(reward + balance).toFixed(4),
    );
  });
});
