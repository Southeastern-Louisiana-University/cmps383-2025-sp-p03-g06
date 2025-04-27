using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;

namespace Selu383.SP25.P03.Api.Services
{
    public interface ICacheService
    {
        Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null);
        void Remove(string key);
    }

    public class CacheService : ICacheService
    {
        private readonly IMemoryCache _cache;
        private readonly MemoryCacheEntryOptions _defaultOptions;

        public CacheService(IMemoryCache cache)
        {
            _cache = cache;
            _defaultOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(10))
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
        {
            if (_cache.TryGetValue(key, out T cachedValue))
            {
                return cachedValue;
            }

            var value = await factory();
            var options = expiration.HasValue 
                ? new MemoryCacheEntryOptions().SetSlidingExpiration(expiration.Value)
                : _defaultOptions;

            _cache.Set(key, value, options);
            return value;
        }

        public void Remove(string key)
        {
            _cache.Remove(key);
        }
    }
} 