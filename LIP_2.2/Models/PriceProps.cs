using CMCToolset.Global;
using Newtonsoft.Json;

namespace PriceOracleService.Models
{
    public class PriceProps 
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public long timestamp { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public Ticker ticker { get; set; }
    }
}
