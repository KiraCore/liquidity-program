using System;
using System.Threading.Tasks;
using AsmodatStandard.Extensions;
using AsmodatStandard.Extensions.Collections;
using System.Collections.Generic;
using AsmodatStandard.Extensions.Threading;
using AsmodatStandard.Cryptography;
using System.Threading;
using AWSWrapper.S3;
using System.Collections.Concurrent;
using System.Linq;
using ETHOracle.Models;

namespace ETHOracle
{
    public partial class ETHOracleStore
    {
        private S3Helper _S3;
        private string _bucket;

        public ETHOracleStore(string bucket)
        {
            _S3 = new S3Helper();
            _bucket = bucket;
        }

        public async Task<string> WriteText(string text, string path = null)
        {
            if (text.IsNullOrEmpty() || path.IsNullOrEmpty())
                return null;

            if(path.IsValidMD5Hex())
                path = $"MD5/{path}";

            if (path == null)
                path = $"MD5/{text.MD5().ToHexString()}";

            path = path.ToVisibleAscii().ReplaceMany(
                ("&",""), ("@", ""), (":", ""),
                (",", ""), ("$", ""), ("=", ""),
                ("$", ""), ("=", ""), ("+", ""),
                ("?", ""), (";", ""), ("\\", ""),
                ("^", ""), ("`", ""), (">", ""),
                ("<", ""), ("{", ""), ("}", ""),
                ("[", ""), ("]", ""), ("~", ""),
                ("%", ""), ("\"", ""), ("'", ""),
                ("|", "")).Trim('/', ' ');

            await _S3.UploadTextAsync(bucketName: _bucket, key: path, text: text);
            return path;
        }

        public async Task<string> TryReadText(string path, bool throwIfNotFound = false)
        {
            if (path.IsNullOrEmpty())
                return null;

            if (path.IsValidMD5Hex())
                path = $"MD5/{path}";

            path = path.ToVisibleAscii().ReplaceMany(
                ("&", ""), ("@", ""), (":", ""),
                (",", ""), ("$", ""), ("=", ""),
                ("$", ""), ("=", ""), ("+", ""),
                ("?", ""), (";", ""), ("\\", ""),
                ("^", ""), ("`", ""), (">", ""),
                ("<", ""), ("{", ""), ("}", ""),
                ("[", ""), ("]", ""), ("~", ""),
                ("%", ""), ("\"", ""), ("'", ""),
                ("|", "")).Trim('/', ' ');

            var text = await _S3.DownloadTextAsync(bucketName: _bucket, key: path, throwIfNotFound: throwIfNotFound);
            return text;
        }

        public async Task<string> WriteJson<T>(T obj, string path = null)
        {
            var msg = obj?.JsonSerialize(Newtonsoft.Json.Formatting.None);
            return (await WriteText(msg, path: path))?.TrimStartSingle("MD5/");
        }


        public async Task<BalanceCache> GetBalanceCache(string address, string network)
        {
            network = network?.Trim(" ", ".", "-", "/", "\\");
            if (network.IsNullOrEmpty())
                network = "mainnet";
            network = network.ToLower();
            address = address.ToLower();

            var path = $"balances/eth/{network}/{address}/cache.json";

            if (!await _S3.ObjectExistsAsync(bucketName: _bucket, key: path))
                return null;

            var text = await TryReadText(path: path, throwIfNotFound: true);

            if (text.IsNullOrWhitespace())
                throw new Exception($"Failed to fetch balance cache info from S3 storage ({path})");

            return text.JsonDeserialize<BalanceCache>();
        }

        public async Task<string> SetBalanceCache(BalanceCache bc, string address, string network)
        {
            network = network?.Trim(" ", ".", "-", "/", "\\");
            if (network.IsNullOrEmpty())
                network = "mainnet";
            network = network.ToLower();
            address = address.ToLower();

            var path = $"balances/eth/{network}/{address}/cache.json";

            return await WriteJson(bc, path: path);
        }
    }
}
