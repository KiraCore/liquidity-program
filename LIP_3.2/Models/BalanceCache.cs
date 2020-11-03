using Newtonsoft.Json;
using System.Collections.Generic;
using System.Numerics;

namespace ETHOracle.Models
{
    public class BalanceCache
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public long timestamp { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public decimal btc { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public decimal usd { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public BalanceCacheFrame latest { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public Dictionary<long, BalanceCacheFrame> balances { get; set; }
    }

    public class BalanceCacheFrame
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public long block { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public decimal amount { get; set; }

        public bool Equals(BalanceCacheFrame bc)
        {
            if (bc == null)
                return false;

            if (block != bc.block)
                return false;

            if (amount != bc.amount)
                return false;

            return true;
        }
    }
}
