# ETHOracle

Handler: `ETHOracle::ETHOracle.Function::FunctionHandler`
Minimum Ram: `256 MB`
Concurrency: `1`
Output: `<bucket>/balances/eth/<network>/<address>/cache.json`

## Example Output

```
{
    "timestamp": <long>, //current unix timestamp (UTC)
    "btc": <decimal>, //current price of ETH in BTC
    "usd": <decimal>, //current price of ETH in USD
    "latest": { // current frame
        "block": <long>, // block height
        "amount": <decimal> // ammount of eth
    }
    "balances": { // list of balance changes
        "<unix-timestamp>": { // time when balance changed
            "block": <long>, // block height at which balance changed
            "amount": <decimal> // ammount of eth deposited in the account
		},
        "<unix-timestamp>": { ... }, ... 
	}
}

```

## Configurable Varaibales

* `MAX_DURATION` - how many seconds will the lambda run `[1]`
* `CONFIG` - url to the remote configurationfile `[1]`
* `MAX_CACHE` - seconds, how long is data persisted `[1]`
* `NETWORKS` - supported networks e.g. (mainnet, kovan etc.) `[1,2]`
* `ADDRESSES` - comma delimited list of ethereum addresses `[1,2]`
* `APIKEY` - etherscan API key `[1,2]`
* `STOP` - halts the lambda `[2]`

`[1]` - env variable config
`[2]` - remote config