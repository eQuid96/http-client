/**
 * A fast string hashing function for Javascript.
 * The particular algorithm is similar to djb2,
 * by Dan Bernstein http://www.cse.yorku.ca/~oz/hash.html.
 * @param str
 * @return an unsigned 32-Bit integer hash.
 */
export function hashCode(str: string) {
    let hash = 5381;
    let i = str.length;
    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    return hash >>> 0;
}
