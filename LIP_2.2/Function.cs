/*/ DEBUG ONLY
#define TEST
using EMG.Lambda.LocalRunner;
/*/
#define PUBLISH
//*/

using System;
using System.Diagnostics;
using System.Threading.Tasks;
using AsmodatStandard.Extensions;
using AsmodatStandard.Extensions.Collections;
using Amazon.Lambda.Core;
using AsmodatStandard.Networking;
using AsmodatStandard.Extensions.Threading;
using AWSWrapper.SM;
using PriceOracleService.Models;
using CMCToolset;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]
namespace PriceOracleService
{
    public partial class Function
    {
        private ILambdaLogger _logger;
        private ILambdaContext _context;
        private bool _verbose;
        private int _maxParallelism;
        private double _maxMessageAge;
        private string _bucket;
        private int _delay;
        private long _tickerExpiry;
        private Stopwatch _sw;
        private int _maxRetry;
        private TokenProps[] _props;
        private PriceOracle _oracle;
        private PriceOracleStore _store;

#if (TEST)
        static async Task Main()
        {
            var port = 5004;
            await LambdaRunner.Create()
                                .UsePort(port)
                                .Receives<string>()
                                .UsesAsyncFunctionWithNoResult<Function>((function, args, context) => function.FunctionHandler(context))
                                .Build()
                                .RunAsync();
        }
#endif

        private void Log(string msg)
        {
            if (msg.IsNullOrEmpty() || !_verbose)
                return;

            _logger.Log(msg);
        }

        public async Task FunctionHandler(ILambdaContext context)
        {
            _sw = Stopwatch.StartNew();
            Log($"Started Price Oracle v0.0.2");

            _context = context;
            _logger = _context.Logger;
            _logger.Log($"{context?.FunctionName} => {nameof(FunctionHandler)} => Started");
            _verbose = Environment.GetEnvironmentVariable("verbose").ToBoolOrDefault(true);
            _maxParallelism = Environment.GetEnvironmentVariable("MAX_PARALLELISM").ToIntOrDefault(0);
            _maxMessageAge = Environment.GetEnvironmentVariable("MAX_MESSAGE_AGE").ToDoubleOrDefault(24 * 3600);
            _bucket = Environment.GetEnvironmentVariable("BUCKET_NAME");
            _maxRetry = Environment.GetEnvironmentVariable("MAX_RETRY").ToIntOrDefault(2);
            _delay = Environment.GetEnvironmentVariable("DELAY").ToIntOrDefault(5 * 60 * 1000);
            _tickerExpiry = Environment.GetEnvironmentVariable("TICKER_EXPIRY").ToIntOrDefault(5 * 60);
            var APIKEY_CryptoCompare = Environment.GetEnvironmentVariable("APIKEY_CRYPTOCOMPARE");
            var APIKEY_CoinMarketCap = Environment.GetEnvironmentVariable("APIKEY_COINMARKETCAP");
            var oracleRegistryLocation = Environment.GetEnvironmentVariable("ORACLE_REGISTRY");

            if (Environment.GetEnvironmentVariable("TEST_CONNECTION").ToBoolOrDefault(false))
                Log($"Your Internet Connection is {(SilyWebClientEx.CheckInternetAccess(timeout: 5000) ? "" : "NOT")} available.");

#if (TEST)
            _bucket = "oracle-kira-network";
            oracleRegistryLocation = "https://raw.githubusercontent.com/KiraCore/cfg/main/PriceOracle/cfg-testnet.json";
            APIKEY_CryptoCompare = "18bebe2f6e63cc19bd284da8551f85c61c647e3ff8c5fd227ac7009d64a3da67";
            APIKEY_CoinMarketCap = "92993e10-2321-4e70-8567-9e82d1427c36";
#endif
            _oracle = new PriceOracle(
                apiKey_CryptoCompare: APIKEY_CryptoCompare,
                apiKey_CoinMarketCap: APIKEY_CoinMarketCap,
                apiUrl_CoinCodex: Environment.GetEnvironmentVariable("APIURI_COINCODEX"),
                apiUrl_CoinMarketCap: Environment.GetEnvironmentVariable("APIURI_COINMARKETAP"),
                apiUrl_CoinGecko: Environment.GetEnvironmentVariable("APIURI_COINGECKO"),
                apiUrl_CoinPaprika: Environment.GetEnvironmentVariable("APIURI_COINPAPRIKA"),
                apiUrl_CryptoCompare: Environment.GetEnvironmentVariable("APIURI_CRYPTOCOMPARE"),
                maxRepeat: 1);
            _store = new PriceOracleStore(_bucket);

            var oracleConfigJson = Environment.GetEnvironmentVariable("ORACLE_CONFIG_OVERRIDE");

            if (oracleConfigJson.IsNullOrEmpty())
                oracleConfigJson = await HttpHelper.GET(requestUri: oracleRegistryLocation);

            _props = oracleConfigJson?.JsonDeserialize<TokenProps[]>();

            try
            {
                Log($"Processing...");
                var timestamp = DateTimeEx.UnixTimestampNow();

                await ParallelEx.ForEachAsync(_props, async prop =>
                {
#if (TEST)
                    await CacheTicker(prop);
#elif (PUBLISH)
                    try
                    {
                        await CacheTicker(prop);
                    }
                    catch (Exception ex)
                    {
                        _logger.Log($"[CACHE ERROR] => Filed to cache '{prop?.symbol ?? "undefined"}': '{ex.JsonSerializeAsPrettyException(Newtonsoft.Json.Formatting.Indented)}'");
                    }
#endif
                }, maxDegreeOfParallelism: _maxParallelism);
            }
#if (TEST)
            catch (Exception ex)
            {
                _logger.Log($"[EXECUTION ERROR] => Message: '{ex.JsonSerializeAsPrettyException(Newtonsoft.Json.Formatting.Indented)}'");
            }
#endif
            finally
            {
                _logger.Log($"{context?.FunctionName} => {nameof(FunctionHandler)} => Stopped, Eveluated within: {_sw.ElapsedMilliseconds} [ms]");
            }
        }

    }
}
