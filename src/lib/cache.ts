import { USER_CACHE_PREFIX, USER_CACHE_TTL } from "./constants.js";
import redisClient from "./redis.js";


export const cacheUser = async (userId: number, user: any): Promise<void> => {
    const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
    await redisClient.setEx(cacheKey, USER_CACHE_TTL, JSON.stringify(user));
};

export const getCachedUser = async (userId: number): Promise<any | null> => {
    const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
    const cached = await redisClient.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
};

export const invalidateUserCache = async (userId: number): Promise<void> => {
    const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
    await redisClient.del(cacheKey);
};

export const invalidateAllUserCache = async (): Promise<void> => {
    const keys = await redisClient.keys(`${USER_CACHE_PREFIX}*`);
    if (keys.length > 0) {
        await redisClient.del(keys);
    }
};
