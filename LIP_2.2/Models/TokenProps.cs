using Newtonsoft.Json;

namespace PriceOracleService.Models
{
    public class TokenProps 
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string symbol { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string cryptocompare_id { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string coinpaprica_id { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string coingecko_id { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string coinmarketcap_id { get; set; }
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string coincodex_id { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public decimal price_min { get; set; } = 0;

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public decimal price_max { get; set; } = decimal.MaxValue;
    }
}
