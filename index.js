const Web3 = require("web3")
const {
  ZWeb3,
  Contracts,
  ProxyAdminProject,
} = require("@openzeppelin/upgrades")
const { setupLoader } = require("@openzeppelin/contract-loader")

async function main() {
  const web3 = new Web3("http://localhost:7545")
  ZWeb3.initialize(web3.currentProvider)
  const loader = setupLoader({ provider: web3 }).web3

  const from = await ZWeb3.defaultAccount()

  const project = new ProxyAdminProject("MyProject", null, null, {
    from,
    gas: 1e6,
    gasPrice: 1e9,
  })

  const TodoList1 = Contracts.getFromLocal("TodoList1")
  const instance = await project.createProxy(TodoList1)
  const address = instance.options.address
  console.log("Proxy Contract Address 1: ", address)

  await instance.methods
    .addItem("go to class")
    .send({ from, gas: 1e5, gasPrice: 1e6 })

  var item = await instance.methods.getListItem(0).call()
  console.log("TodoList: List Item 0: ", item)

  const TodoList2 = Contracts.getFromLocal("TodoList2")
  const updatedInstance = await project.upgradeProxy(address, TodoList2)
  console.log("Proxy Contract Address 2: ", updatedInstance.options.address)

  var length = await updatedInstance.methods.getListSize().call()
  console.log(length)
}

main()
