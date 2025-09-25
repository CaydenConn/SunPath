import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)


def get_user_from_cache(user_id):
    key = f"user:{user_id}"
    user_data = redis_client.get(f"user:{user_id}")
    if user_data:
        return user_data.decode('utf-8')
    return None

def set_user_in_cache(user_id, user_data):
    key = f"user:{user_id}"
    redis_client.set(key, 300, user_data)