import {ActivatedRouteSnapshot} from '@angular/router'

/**
 * 使用这个方法的前提是：在一条完整的angular路由路径内，一个param key有且只使用一次
 * @param activeRoute ActivatedRouteSnapshot
 * @param paramKey string
 * @returns string | undefined
 */
export function getParamFromRoot(
    activeRoute: ActivatedRouteSnapshot,
    paramKey: string,
): string | undefined {
    let param: string | undefined
    activeRoute.pathFromRoot.forEach(r =>{
        const result = r.paramMap.get(paramKey)
        if(result === null)
            return
        param = result
    })
    return param
}

export function getPathFromRoot(activeRoute: ActivatedRouteSnapshot): string{
    const path = activeRoute.pathFromRoot
        .map(r => r.url.map(u=>u.path).join('/'))
        .filter(r=>r.length!== 0)
        .join('/')
    return `/${path}`
}