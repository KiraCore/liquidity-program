using System.Linq;
using System.Threading.Tasks;
using AsmodatStandard.Extensions;
using AsmodatStandard.Extensions.Collections;
using CMCToolset.Global;
using PriceOracleService.Models;

namespace PriceOracleService
{
    public partial class Function
    {
        public async Task<Ticker> CacheTicker(TokenProps prop)
        {
            var timestamp = DateTimeEx.UnixTimestampNow();
            var oracleResponse = await _oracle.GetGlobalTicker(
                    prop.symbol,
                    minPriceUSD: prop.price_min,
                    maxPriceUSD: prop.price_max,
                    coingecko_id: prop.coingecko_id,
                    coinpaprica_id: prop.coinpaprica_id,
                    cryptocompare_id: prop.cryptocompare_id,
                    coinmarketcap_id: prop.coinmarketcap_id,
                    coincodex_id: prop.coincodex_id);

            if (!oracleResponse.errors.IsNullOrEmpty())
                _logger.Log($"[ERROR CACHE] Failed Responses: [{oracleResponse.errors.Select(x => x.JsonSerializeAsPrettyException()).StringJoin(",\n\r").Trim(',', '\n', '\r')}]");

            if (oracleResponse.ticker != null)
            {
                await _store.SetTicker(oracleResponse.ticker);
                return oracleResponse.ticker;
            }
            else
                return null;
        }
    }
}
