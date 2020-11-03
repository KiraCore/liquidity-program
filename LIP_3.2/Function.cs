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
using AWSWrapper.SM;
using System.Collections.Generic;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.Json.JsonSerializer))]
namespace ETHOracle
{
    public partial class Function
    {
        private SMHelper _SM;
        private ILambdaLogger _logger;
        private ILambdaContext _context;
        private bool _verbose;
        private int _maxParallelism;
        private string _bucket;
        private string _apikey;
        private string[] _networks;
        private string[] _addresses;
        private Stopwatch _sw;
        private ETHOracleStore _store = null;

        public Function()
        {
            _SM = new SMHelper();
        }

#if (TEST)
        static async Task Main(string[] args)
        {
            var port = 5003;
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
            Log($"Started KIRA Address Balance Oracle v0.0.1");

            _context = context;
            _logger = _context.Logger;
            _logger.Log($"{context?.FunctionName} => {nameof(FunctionHandler)} => Started");
            _verbose = Environment.GetEnvironmentVariable("VERBOSE").ToBoolOrDefault(true);
            _maxParallelism = Environment.GetEnvironmentVariable("MAX_PARALLELISM").ToIntOrDefault(1);
            var maxDuration = Environment.GetEnvironmentVariable("MAX_DURATION").ToIntOrDefault(5*60*100); // 5 minutes default
            var configUrl = Environment.GetEnvironmentVariable("CONFIG") ?? "https://raw.githubusercontent.com/KiraCore/cfg/main/EthereumOracle/env-mainnet";
            var maxCache = Environment.GetEnvironmentVariable("MAX_CACHE").ToIntOrDefault(0); // seconds
            _bucket = Environment.GetEnvironmentVariable("BUCKET");
            _networks = Environment.GetEnvironmentVariable("NETWORKS")?.Split(",");
            _addresses = Environment.GetEnvironmentVariable("ADDRESSES")?.Split(",");
            _apikey = Environment.GetEnvironmentVariable("APIKEY");

            if (Environment.GetEnvironmentVariable("TEST_CONNECTION").ToBoolOrDefault(false))
                Log($"Your Internet Connection is {(SilyWebClientEx.CheckInternetAccess(timeout: 5000) ? "" : "NOT")} available.");

            if(!configUrl.IsNullOrEmpty() && (
                _addresses.IsNullOrEmpty() || 
                _networks.IsNullOrEmpty() ||
                _bucket.IsNullOrEmpty() ||
                _apikey.IsNullOrEmpty()))
            {
                var cfg = await HttpHelper.GET<Dictionary<string, string>>(configUrl, System.Net.HttpStatusCode.OK, timeoutSeconds: 10);
                _addresses = _addresses.IsNullOrEmpty() ? cfg.GetValueOrDefault("ADDRESSES", "")?.Split(",") : _addresses;
                _networks = _networks.IsNullOrEmpty() ? cfg.GetValueOrDefault("NETWORKS", "")?.Split(",") : _networks;
                _bucket = _bucket.IsNullOrEmpty() ? cfg.GetValueOrDefault("BUCKET", "") : _bucket;
                _apikey = _apikey.IsNullOrEmpty() ? cfg.GetValueOrDefault("APIKEY", "") : _apikey;

                if(cfg.GetValueOrDefault("STOP", "false").ToBoolOrDefault(false))
                {
                    _logger.Log($"WARNING: Lambda will be halted, a STOP property found in the configuration file.");
                    return;
                }
            }

            while (_sw.ElapsedMilliseconds < maxDuration)
            {
#if (TEST)
                if (_addresses.IsNullOrEmpty()) // test networks
                    _addresses = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2,0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE".Split(","); // test adresses

                if (_networks.IsNullOrEmpty()) // test networks
                    _networks = "mainnet,kovan".Split(",");

                if (_bucket.IsNullOrEmpty())
                    _bucket = "oracle-local.kiracore.com"; // test bucket

                if (_apikey.IsNullOrEmpty())
                    _apikey = "MAVTB6FJWAAMJZIR825QFZ3QSR27Q3349F"; // test key

                _store = _store ?? new ETHOracleStore(_bucket);
                await CacheBalances(_networks, _addresses, _apikey);
#elif (PUBLISH)
            try
            {
                _store = _store ?? new ETHOracleStore(_bucket);
                await CacheBalances(_networks, _addresses, _apikey, maxCache);
            }
            catch (Exception ex)
            {
                _logger.Log($"ERROR: => Message: '{ex.JsonSerializeAsPrettyException(Newtonsoft.Json.Formatting.Indented)}'");
            }
            finally
            {
                _logger.Log($"{context?.FunctionName} => {nameof(FunctionHandler)} => Stopped, Eveluated within: {_sw.ElapsedMilliseconds} [ms]");
            }
#endif
            }
        }
    }
}
