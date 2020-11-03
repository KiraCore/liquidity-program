using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AsmodatStandard.Extensions;
using AsmodatStandard.Extensions.Collections;
using AsmodatStandard.Extensions.Threading;
using ETHOracle.Models;
using ETHOracle.Models.Etherscan;

namespace ETHOracle
{
    public partial class Function
    {
        public async Task CacheBalances(string[] networks, string[] addresses, string APIKEY_ETHERSCAN, int cacheExpiry)
        {
            foreach (var net in networks)
            {
                var apiNet = $"-{net.Replace("mainnet", "")}";
                apiNet = apiNet == "-" ? "" : apiNet;
                var timestamp = DateTimeEx.UnixTimestampNow();
                var expiry = timestamp - cacheExpiry;

                var block = await HttpHelper.GET<ProxyModule>(
                    $"https://api{apiNet}.etherscan.io/api?module=proxy&action=eth_blockNumber&" +
                    $"apikey={APIKEY_ETHERSCAN}",timeoutSeconds:10);

                var height = block.result.HexToLong();

                var price = await HttpHelper.GET<StatsModule<EthPrice>>(
                    $"https://api{apiNet}.etherscan.io/api?module=stats&action=ethprice&" +
                    $"apikey={APIKEY_ETHERSCAN}", timeoutSeconds: 10);

                if(price?.status != "1")
                {
                    _logger.Log($"ERROR: Failed to fetch current eth prices");
                    continue;
                }

                var btc = price.result.ethbtc.ToDecimalOrDefault(0);
                var usd = price.result.ethusd.ToDecimalOrDefault(0);

                Thread.Sleep(400);

                var batches = addresses.Batch(20).Select(x => x.ToArray()).ToArray();

                foreach (var batch in batches)
                {
                    if (batch.IsNullOrEmpty())
                        continue;

                    var bAddr = batch.StringJoin().Trim(",");
                    var balances = await HttpHelper.GET<AccountModuleBalanceMulti>(
                            $"https://api{apiNet}.etherscan.io/api?module=account&action=balancemulti&" +
                            $"address={bAddr}" +
                            $"&tag=latest&apikey={APIKEY_ETHERSCAN}", timeoutSeconds: 10);

                    if (balances?.status != "1")
                    {
                        _logger.Log($"ERROR: Failed to fetch balance of the account {bAddr}");
                        continue;
                    }

                    Thread.Sleep(200);

                    var frames = new ConcurrentDictionary<string, BalanceCacheFrame>();

                    foreach (var balance in balances.result)
                    {
                        var account = balance.account;
                        var ammount = (decimal)(balance.balance.ToBigIntOrDefault(0) / Math.Pow(10, 12).ToString().ToBigIntOrDefault());

                        if (!account.IsHex(ignorePrefix: true))
                        {
                            _logger.Log($"ERROR: Account {account} is not a HEX");
                            continue;
                        }

                        frames[account] = new BalanceCacheFrame()
                        {
                            amount = ammount / (decimal)Math.Pow(10, 6),
                            block = height
                        };
                    }

                    foreach(var frame in frames)
                    {

                        var account = frame.Key;
                        var cache = await _store.GetBalanceCache(account, net);
                        var newFrame = frame.Value;
                        var oldFrame = cache?.latest ?? new BalanceCacheFrame() { 
                            amount = 0,
                            block = 0,
                        };
                       
                        var updateFrames = false;
                        var updateLatest = false;

                        if (cache == null)
                        {
                            _logger.Log($"WARNING: Cache of {account} in the {net} network was not found in the S3 store");
                            cache = new BalanceCache() {
                                balances = new Dictionary<long, BalanceCacheFrame>() { },
                                usd = 0,
                                btc = 0,
                                timestamp = 0
                            };
                            updateFrames = true;
                        }
                        else if (oldFrame.amount != newFrame.amount && oldFrame.block != newFrame.block)
                            updateFrames = true;

                        if (cache.btc == 0 || (Math.Abs(cache.btc - btc) / cache.btc) > (decimal)0.01)
                            updateLatest = true;
                        else if (cache.usd == 0 || (Math.Abs(cache.usd - usd) / cache.usd) > (decimal)0.01)
                            updateLatest = true;

                        if (updateFrames)
                            cache.balances[timestamp] = newFrame;

                        if(updateLatest || updateFrames)
                        {
                            cache.timestamp = timestamp;
                            cache.latest = newFrame;
                            cache.usd = usd;
                            cache.btc = btc;

                            if(timestamp != expiry) // remove expired frames
                            {
                                var tArr = cache.balances.Select(x => x.Key).ToArray();
                                foreach (var t in tArr)
                                    if (t < expiry)
                                        cache.balances.Remove(t);
                            }

                            await _store.SetBalanceCache(cache, account, net);
                            _logger.Log($"INFO: Cached balance of account {account} ({net}), timestamp: {timestamp}, block: {height}");
                        }
                    }
                }
            }
        }
    }
}
