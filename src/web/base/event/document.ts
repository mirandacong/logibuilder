import {fromEvent, Observable} from 'rxjs'

export function listenTabVisibilityChange(
    document: Document
): Observable<Event> {
    /**
     * 当文档所在的浏览器Tab被激活或切走时会触发 visibilitychange
     * TODO(zengkai): 如果有更好的方法或是后面使用了websocket就删除这个事件监听
     */
    return fromEvent(document, 'visibilitychange')
}
