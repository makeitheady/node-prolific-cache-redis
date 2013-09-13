var Cache = require('prolific-cache'),
    RedisCache = require('../lib/RedisCache');

Cache.TestSuite('Redis cache', new RedisCache());