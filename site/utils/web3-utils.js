import Web3 from 'web3'
import { contractAbis } from './constant/contract_abi'
import { parse } from 'csv-parse/sync'
import { ethers } from 'ethers'

export async function sendTransaction(web3, opts) {
  await web3.eth.sendTransaction(opts)
}

export async function createTxObj(
  connectorState,
  functionName,
  abi,
  inputs,
  toAddress,
  value = null,
) {
  try {
    const web3 = connectorState.web3

    let encodedData
    abi.map((obj) => {
      if (obj.name == functionName && obj.type == 'function') {
        encodedData = web3.eth.abi.encodeFunctionCall(
          {
            name: obj.name,
            type: 'function',
            inputs: obj.inputs,
          },
          inputs,
        )
      }
    })

    //gasPrice
    const gasPrice = (await getGasPrice(connectorState.web3)) * 2

    let txObj = {
      from: connectorState.connected_account,
      to: toAddress,
      data: encodedData,
      gasPrice: gasPrice,
      value: value ?? 0,
    }

    //gas
    const gas = await getGasAmountEstimate(connectorState, txObj)
    txObj = { ...txObj, gas: gas.toNumber() }

    return txObj
  } catch (e) {
    if (e.message.includes('0x prefix is missing')) {
      throw 'Missing Contract Address'
    } else {
      throw e
    }
  }
}
/********************************* */
/***************ERC20**************/
/********************************* */

/**
 *
 * @param  Obj {index: [checksumAddress, BN]}
 *
 * @returns [recipients: [checkSumAddress1, checkSumAddress2,...], values: [BN1, BN2,...]]
 *
 */
export function convertToERC20ContractParams(Obj) {
  let arr1 = []
  let arr2 = []
  Object.entries(Obj).map((ele) => {
    const address = ele[1][0]
    const value = ele[1][1]
    arr1.push(address)
    arr2.push(value)
  })

  return { recipients: arr1, values: arr2 }
}

/**
 * 1. empty string
 * 2. valid address and integer
 * @param str
 * @returns boolean
 */
export function validateERC20Input(str) {
  if (!str) {
    return false
  }

  try {
    let parsedObj = formatERC20Input(str)
    let contractObj = convertERC20TypeToWeb3(parsedObj)
    return true
  } catch (error) {
    console.log('error in validating ERC20', error)
    return false
  }
}

/**
 *
 * @param str
 * @returns Obj {#: [input1, input2]}
 * @returns exceptions Invalid Record Length expected 2
 */
export function formatERC20Input(str) {
  try {
    const userInputObj = parse(str, {
      ltrim: true,
      column: true,
      delimiter: ['\t', ' ', ', ', ','],
    })
    let formatedObj = {}

    userInputObj.forEach((arr) => {
      const input1 = arr[0]
      const input2 = arr[1]

      const index = Object.keys(formatedObj).length

      formatedObj[index] = [input1, input2]
    })

    return formatedObj
  } catch (e) {
    throw ('error in formating Input', e)
  }
}

/**
 * @notice BN in Wei
 *
 * @param Obj {index: [input1, input2]}
 *
 * @returns Obj {index: [checkSumAddress, BN instance]}
 * @returns exceptions checksum or BN error
 *
 */
export function convertERC20TypeToWeb3(Obj) {
  let obj = {}

  if (Object.keys(Obj).length === 0) {
    throw 'Empty Input'
  }

  Object.entries(Obj).map((ele) => {
    const index = ele[0]
    const address = ele[1][0]
    const value = ele[1][1]

    let newAddress
    if (Web3.utils.checkAddressChecksum(address)) {
      newAddress = Web3.utils.toChecksumAddress(address)
    } else {
      throw `"${address}" is not an valid address`
    }

    let newVal
    if (isNaN(Number(value))) {
      throw `value ${value} is NaN`
    } else if (Number(value) < 1e-18) {
      throw `value ${value} is less than 1e-18`
    } else {
      newVal = ethers.utils.parseEther(value)
    }

    obj[index] = [newAddress, newVal]
  })
  return obj
}
/**
 *
 * @param {*} web3
 *
 * @param {*} address
 *
 * @returns boolean
 */
export async function isERC20(web3, address) {
  if (verifyAddress(address) === true) {
    let contract = new web3.eth.Contract(contractAbis.ERC20, address)

    //check for decimals and symbol
    let hasSymbol = await contract.methods.symbol().call()
    let hasDecimals = await contract.methods.decimals().call()
    // console.log('has symbol, decimals', hasDecimals) // , hasDecimals)

    if (!hasSymbol || !hasDecimals) {
      return false
    }
    return true
  }
  return false
}

/**
 *
 * @param {*} web3
 *
 * @param {*} address
 *
 * @returns Obj {name: name, symbol: symbol, decimals: decimals}
 */
export async function getERC20Info(web3, address) {
  try {
    let contract = new web3.eth.Contract(contractAbis.ERC20, address)
    let symbol = await contract.methods.symbol().call()
    let decimals = await contract.methods.decimals().call()
    let name = await contract.methods.name().call()
    return { name: name, symbol: symbol, decimals: decimals }
  } catch (e) {
    console.log('error in getERC20Info', e)
  }
}

export async function getERC20BalanceOf(web3, tokenAddress, userAddress) {
  try {
    let ERC20Contract = new web3.eth.Contract(contractAbis.ERC20, tokenAddress)
    let balance = await ERC20Contract.methods.balanceOf(userAddress).call()
    return ethers.BigNumber.from(balance)
  } catch (e) {
    console.log('error in ERC20 BalanceOf', e)
  }
}

export async function getERC20Allowance(web3, address, owner, spender) {
  try {
    let contract = new web3.eth.Contract(contractAbis.ERC20, address)
    let allowance = await contract.methods.allowance(owner, spender).call()
    return ethers.BigNumber.from(allowance)
  } catch (e) {
    console.log('error in ERC20 allowance', error)
  }
}

/********************************* */
/***************ERC721**************/
/********************************* */

/**
 *
 * @param {*} web3
 * @param {*} address
 * @returns boolean
 */
export async function isERC721(web3, address) {
  if (verifyAddress(address) === true) {
    let contract = new web3.eth.Contract(contractAbis.ERC721, address)
    let isERC721 = await contract.methods.supportsInterface('0x80ac58cd').call()
    return isERC721
  }
  return false
}

/**
 *
 * @param {*} str
 * @returns boolean
 */
export function validateERC721Input(str) {
  try {
    let parsedObj = formatERC20Input(str)
    let contractObj = convertERC721TypeToWeb3(parsedObj)
    return true
  } catch (error) {
    console.log('error in validating ERC20', error)
    return false
  }
}

export function convertERC721TypeToWeb3(Obj) {
  let obj = {}

  if (Object.keys(Obj).length === 0) {
    throw 'Empty Input'
  }

  Object.entries(Obj).map((ele) => {
    const index = ele[0]
    const address = ele[1][0]
    const value = ele[1][1]

    let newAddress
    if (Web3.utils.checkAddressChecksum(address)) {
      newAddress = Web3.utils.toChecksumAddress(address)
    } else {
      throw `"${address}" is not an valid address`
    }

    let newVal
    if (value == '') {
      throw 'No Id Input'
    }

    if (isNaN(Number(value))) {
      throw `value ${value} is NaN`
    } else if (Number(value) < 0) {
      throw `value ${value} is less 0`
    } else {
      newVal = Number(value)
    }

    obj[index] = [newAddress, newVal]
  })
  return obj
}

export function convertToERC721ContractParams(Obj) {
  let arr1 = []
  let arr2 = []
  Object.entries(Obj).map((ele) => {
    const address = ele[1][0]
    const value = ele[1][1]
    arr1.push(address)
    arr2.push(value)
  })

  return { recipients: arr1, ids: arr2 }
}

export async function isERC721ApprovedForAll(web3, address, owner, operator) {
  const contract = new web3.eth.Contract(contractAbis.ERC721, address)
  const isApproved = await contract.methods
    .isApprovedForAll(owner, operator)
    .call()
  return isApproved
}

export async function isERC721OwnerOf(web3, address, owner, id) {
  const contract = new web3.eth.Contract(contractAbis.ERC721, address)
  const actualOwner = await contract.methods.ownerOf(id).call()
  return actualOwner == owner ? true : false
}

export async function getERC721BalancesFor(
  web3,
  contractAddress,
  userAddress,
  ids,
) {
  let contract = new web3.eth.Contract(contractAbis.ERC721, contractAddress)
  let addresses = Array(ids.length).fill(userAddress)
  let balances = []
  for (let i = 0; i < ids.length; i++) {
    if (await isERC721OwnerOf(web3, contractAddress, userAddress, ids[i])) {
      balances.push(1)
    }
  }
  return balances
}

export async function getERC721MetadataFor(web3, contractAddress, id) {
  let contract = new web3.eth.Contract(contractAbis.ERC721, contractAddress)
  let uri = await contract.methods.tokenURI(id).call()
  let uri_string = uri.toString()

  console.log('uri string for erc721', uri_string)

  // if the uri has {id} fill in the id
  if (uri_string.includes('{id}')) {
    uri_string = await uri_string.replace('{id}', id.toString())
  }
  console.log('uri string for erc721', uri_string)

  try {
    if (uri_string == '') {
      throw 'empty uri'
    }

    const response = await fetch(uri_string) //, {
    // method: 'POST',
    // mode: 'no-cors',
    // headers: {
    //   'Content-Type': 'application/json',
    //   'Access-Control-Allow-Origin': '*',
    // },
    // body: JSON.stringify({}),
    // })

    // return ''
    return response.json()
  } catch (e) {
    console.log('error within erc721 meta', e)
    return ''
  }
}

/********************************* */
/***************ERC1155**************/
/********************************* */

/**
 *
 * @param str
 * @returns boolean
 */
export function validateERC1155Input(str) {
  try {
    let parsedObj = formatERC1155Input(str)
    let contractObj = convertERC1155TypeToWeb3(parsedObj)
    return true
  } catch (error) {
    console.log('error in validating ERC20', error)
    return false
  }
}

/**
 *
 * @param str
 * @returns Obj {#: [input1, input2]}
 * @returns exceptions Invalid Record Length expected 2
 */
export function formatERC1155Input(str) {
  try {
    const userInputObj = parse(str, {
      ltrim: true,
      column: true,
      delimiter: ['\t', ' ', ', ', ','],
    })
    let formatedObj = {}
    userInputObj.forEach((arr) => {
      const input1 = arr[0]
      const input2 = arr[1]
      const input3 = arr[2]

      const index = Object.keys(formatedObj).length

      formatedObj[index] = [input1, input2, input3]
    })

    return formatedObj
  } catch (e) {
    throw ('error in formating Input', e)
  }
}

/**
 *
 * @param Obj {index: [input1, input2]}
 *
 * @returns Obj {index: [checkSumAddress, BN instance]}
 * @returns exceptions checksum or BN error
 *
 */
export function convertERC1155TypeToWeb3(Obj) {
  let obj = {}

  if (Object.keys(Obj).length === 0) {
    throw 'Empty Input'
  }

  Object.entries(Obj).map((ele) => {
    const index = ele[0]
    const address = ele[1][0]
    const id = ele[1][1]
    const value = ele[1][2]

    let newAddress
    if (Web3.utils.checkAddressChecksum(address)) {
      newAddress = Web3.utils.toChecksumAddress(address)
    } else {
      throw `"${address}" is not an valid address`
    }

    let newId
    if (isNaN(Number(value))) {
      throw `value ${value} is NaN`
    } else if (Number(value) < 1) {
      throw `value ${value} should be greater than 1`
    } else {
      newId = id
    }

    let newAmount
    if (isNaN(Number(value))) {
      throw `value ${value} is NaN`
    } else if (Number(value) < 1) {
      throw `value ${value} should be greater than 1`
    } else {
      newAmount = value
    }

    obj[index] = [newAddress, newId, newAmount]
  })
  return obj
}

/**
 *
 * @param  Obj {index: [checksumAddress, BN]}
 *
 * @returns [recipients: [checkSumAddress1, checkSumAddress2,...], values: [BN1, BN2,...]]
 *
 */
export function convertToERC1155ContractParams(Obj) {
  let arr1 = []
  let arr2 = []
  let arr3 = []
  Object.entries(Obj).map((ele) => {
    const address = ele[1][0]
    const id = ele[1][1]
    const value = ele[1][2]
    arr1.push(address)
    arr2.push(id)
    arr3.push(value)
  })

  return { recipients: arr1, ids: arr2, values: arr3 }
}

export async function isERC1155(web3, address) {
  if (verifyAddress(address) === true) {
    //  check if this address supports erc1155
    let contract = new web3.eth.Contract(contractAbis.ERC1155, address)

    let isERC1155 = await contract.methods
      .supportsInterface('0xd9b67a26')
      .call()
    return isERC1155
  }
  return false
}

export async function isERC1155ApprovedForAll(web3, address, owner, operator) {
  const contract = new web3.eth.Contract(contractAbis.ERC1155, address)
  const isApproved = await contract.methods
    .isApprovedForAll(owner, operator)
    .call()
  return isApproved
}

export async function getERC1155BalanceOfBatch(web3, address, accounts, ids) {
  const contract = new web3.eth.Contract(contractAbis.ERC1155, address)
  const balanceOfBatch = await contract.methods
    .balanceOfBatch(accounts, ids)
    .call()
  return balanceOfBatch
}

export async function getERC1155BalancesFor(
  web3,
  contractAddress,
  userAddress,
  ids,
) {
  let contract = new web3.eth.Contract(contractAbis.ERC1155, contractAddress)
  let addresses = Array(ids.length).fill(userAddress)
  let balances = await contract.methods.balanceOfBatch(addresses, ids).call()
  return balances
}

export async function getERC1155MetadataFor(web3, contractAddress, id) {
  let contract = new web3.eth.Contract(contractAbis.ERC1155, contractAddress)
  let uri = await contract.methods.uri(id).call()
  let data = {}
  let uri_string = uri.toString()

  // console.log('the uri within utils', uri_string)
  if (uri_string.includes('{id}')) {
    uri_string = await uri_string.replace('{id}', id.toString())
  }

  // console.log('after replace', uri_string)

  // if the uri has {id} fill in the id
  try {
    if (uri_string == '') {
      throw 'empty uri'
    }

    const response = await fetch(uri_string) //, {
    // method: 'GET',
    // mode: 'no-cors',
    // headers: {
    //   'Content-Type': 'application/json',
    //   'Access-Control-Allow-Origin': '*',
    // },
    // })

    console.log('response', response)

    // , {
    //   method: 'GET', // *GET, POST, PUT, DELETE, etc.

    //   // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //   // credentials: 'same-origin', // include, *same-origin, omit
    // headers: {
    //   'Content-Type': 'application/json',

    //   // 'Content-Type': 'application/x-www-form-urlencoded',
    // }
    //   redirect: 'follow', // manual, *follow, error
    //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //   // body: JSON.stringify(data), // body data type must match "Content-Type" header
    // })
    return await response.json()
  } catch (e) {
    console.log(e)
    return ''
  }
}

/**
 *
 * @param web3 Web3 Object
 * @returns BN Instance
 */
export async function getGasPrice(web3) {
  let gas_price = await web3.eth.getGasPrice()
  return await ethers.BigNumber.from(gas_price)
}

/****** Helpers */

/**
 *
 * @param {*} web3
 * @param {*} wallet
 * @returns
 */
export async function getUserCoinBalance(web3, wallet) {
  const balance = await web3.eth.getBalance(wallet)
  return await ethers.BigNumber.from(balance)
}

export function verifyAddress(address) {
  return ethers.utils.isAddress(address)
}

/**
 *
 * @param {*} values array of BN
 * @returns BN instance
 */
export function calcSumOfBN(values) {
  let sum = ethers.BigNumber.from(0)
  for (let i = 0; i < values.length; i++) {
    // console.log('value in calcSumOfBN', values[i].toString())
    sum = sum.add(values[i])
  }

  return sum
}

/**
 *
 * @param values array of numbers
 * @returns number
 */
export function calcSum(values) {
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    // console.log('value', values[i].toString())
    sum = Number(sum) + Number(values[i])
  }
  console.log('sum', sum)

  return sum
}

/**
 *
 * @param {*} connectorState
 * @param {*} selected : int
 * @param params Obj {index: [address, value]}
 * @returns gasAmount: BN instance
 */
export async function getGasAmountEstimate(connectorState, txObj) {
  // try {
  const gasAmount = await connectorState.web3.eth.estimateGas(txObj)
  return ethers.BigNumber.from(gasAmount)
  // } catch (e) {
  //   console.log('error in estimate Gas method', e)
  //   return ethers.BigNumber.from(0)
  // }
}

/**
 *
 * @param str
 * @returns str
 */
export function truncateWeb3Address(str) {
  if (str) return str.slice(0, 6) + '...' + str.slice(-4)
  else return ''
}

export function getAddress(address) {
  return ethers.utils.getAddress(address)
}
