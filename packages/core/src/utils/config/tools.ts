const NODE_TYPES = ['number', 'string', 'boolean', 'undefined', 'null']

/**
 * 合并配置
 * @param defData 默认配置
 * @param data 配置
 * @returns 合并后的配置
 */
export const lint = async <T = Record<string, any>> (
  defData: Record<string, any>,
  data: Record<string, any>
): Promise<T> => {
  const list = {} as Record<string, any>
  await Promise.all(Object.keys(defData).map(async (key) => {
    if (Array.isArray(data?.[key])) {
      /** 数组中必须非对象才可以setStr */
      if (data?.[key].every((v: any) => typeof v !== 'object')) {
        list[key] = setStr(data?.[key] || defData[key])
        return
      } else {
        list[key] = data?.[key] || defData[key]
        return
      }
    }

    if (NODE_TYPES.includes(typeof data?.[key])) {
      list[key] = data?.[key] ?? defData[key]
      return
    }

    if (typeof data?.[key] === 'object') {
      list[key] = await lint(defData[key], data?.[key])
    }
  }))

  return list as T
}

/**
 * 合并对象 专属privates、groups
 * @param defData 默认配置
 * @param data 配置
 * @returns 合并后的配置
 */
export const mergeData = (defData: Record<string, any>, data: Record<string, any>) => {
  const list = {} as Record<string, any>
  Object.keys(defData).forEach((key) => {
    if (typeof defData[key] === 'number') {
      list[key] = Number(data[key]) ?? defData[key]
      return
    }

    if (Array.isArray(defData[key])) {
      list[key] = Array.isArray(data[key]) ? data[key] : []
      list[key] = list[key].map((val: string) => String(val))
      return
    }

    throw TypeError(`${key} is not a number or array`)
  })
  return list
}

/**
 * 统一转换为字符串数组
 * @param data 数据
 */
export const setStr = (data: any[]) => {
  try {
    return data.map((v: string) => String(v)) || []
  } catch {
    return []
  }
}

/**
 * 创建缓存对象
 */
export const createCount = () => {
  return {} as Record<string, {
    /** 上一分钟调用次数 */
    start: number,
    /** 当前调用次数 */
    count: number
  }>
}

/**
 * 获取缓存配置
 */
export const getCacheCfg = <T> (
  cache: Record<string, T>,
  count: ReturnType<typeof createCount>,
  keys: string[]
) => {
  /** 优先走缓存 */
  if (cache[keys[0]]) {
    count[keys[0]].count++
    return cache[keys[0]]
  }

  for (const index in keys) {
    if (cache[keys[index]]) {
      if (index === '0') {
        /** 如果是索引0 说明有键有对应的缓存 */
        count[keys[index]] = { start: 0, count: 1 }
      } else {
        /** 如果索引不为0 说明有键没有对应的缓存 此时创建缓存 */
        count[keys['0']] = { start: 0, count: 1 }
        cache[keys['0']] = cache[keys[index]]
      }

      return cache[keys[index]]
    }
  }

  return cache.default
}

/**
 * 定时清理缓存
 */
export const clearCache = <T> (
  count: ReturnType<typeof createCount>,
  cache: Record<string, T>
) => {
  setInterval(() => {
    Object.keys(count).forEach((key) => {
      if (count[key].count - count[key].start < 10) {
        delete count[key]
        delete cache[key]
      } else {
        count[key].start = count[key].count
      }
    })
  }, 60000)
}
