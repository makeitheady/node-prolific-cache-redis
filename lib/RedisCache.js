var redis = require('redis');

var RedisCache = function () {
    this._client = redis.createClient();    
};

RedisCache.prototype.write = function (bucket, key, value, callback) {
    var type = typeof value;
    
    var context = {
        type: type,
        value: type === 'object'? JSON.stringify(value): value
    };
    
    this._client.HMSET(createKeyWithBucket(bucket, key), context);
    
    callback && process.nextTick(function () {
        callback(null);
    });
    
    return this;
};

RedisCache.prototype.read = function (bucket, key, callback) {
    this._client.hgetall(createKeyWithBucket(bucket, key), function (err, context) {
        if (err) {
            callback(err, null);
            return;
        } else if (context === null) {
            callback(null, null);
            return;
        }
        
        try {
            switch (context.type) {
                case 'object':
                    callback(null, JSON.parse(context.value));
                    break;
                    
                case 'number':
                    callback(null, +context.value);
                    break;
                    
                case 'boolean':
                    callback(null, context.value === 'true');
                    break;
                    
                default:
                    callback(null, context.value);
            }
        } catch (err) {
            callback(err, null);
        }
    });
    
    return this;
};

RedisCache.prototype.invalidate = function (bucket, key, callback) {
    this._client.del(createKeyWithBucket(bucket, key), callback);
    return this;
};

RedisCache.prototype.setExpiration = function (bucket, key, ms, callback) {
    this._client.pexpire(createKeyWithBucket(bucket, key), ms, callback);
    return this;
};

function createKeyWithBucket (bucket, key) {
    return bucket + ':' + key;
}

module.exports = RedisCache;