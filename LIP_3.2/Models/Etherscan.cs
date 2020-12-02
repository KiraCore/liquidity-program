using Newtonsoft.Json;

namespace ETHOracle.Models.Etherscan
{
    public class ProxyModule
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string jsonrpc { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string id { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string result { get; set; }
    }

    public class AccountModuleBalance
    {

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string status { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string message { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string result { get; set; }
    }

    public class AccountModuleBalanceMulti
    {

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string status { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string message { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public AccountBalance[] result { get; set; }
    }

    public class AccountBalance
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string account { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string balance { get; set; }
    }

    public class EthPriceStats
    {

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string status { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string message { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public AccountBalance[] result { get; set; }
    }

    public class StatsModule<T>
    {

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string status { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string message { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public T result { get; set; }
    }

    public class EthPrice
    {

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string ethbtc { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string ethbtc_timestamp { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string ethusd { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string ethusd_timestamp { get; set; }
    }
}
