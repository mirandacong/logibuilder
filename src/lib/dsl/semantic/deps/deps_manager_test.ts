import {DepsManager} from './deps_manager'

describe('deps manager test', (): void => {
    it('set deps', (): void => {
        const manager = new DepsManager()
        const data: [string, string | undefined, string[]][] = [
            ['fb1', undefined, ['fb2']],
            ['fb1', 'slice1', ['fb3', 'fb4']],
            ['fb1', 'slice2', ['fb3', 'fb5']],
            ['fb2', 'slice1', ['fb3']],
        ]
        data.forEach((d): void => {
            // tslint:disable-next-line: no-magic-numbers
            manager.setDeps(d[2], d[0], d[1])
        })
        expect(manager.getDeps('fb1')).toEqual(['fb3', 'fb4', 'fb5'])
        expect(manager.getRdeps('fb3')).toEqual(['fb1', 'fb2'])
        expect(manager.getRdeps('fb4')).toEqual(['fb1'])

        /**
         * Update slice deps.
         */
        manager.setDeps(['fb5'], 'fb1', 'slice1')
        expect(manager.getDeps('fb1')).toEqual(['fb5', 'fb3'])
        expect(manager.getRdeps('fb3')).toEqual(['fb1', 'fb2'])
        expect(manager.getRdeps('fb4')).toEqual([])

        /**
         * Set fb deps and remove slice deps.
         */
        manager.setDeps(['fb4'], 'fb1')
        expect(manager.getDeps('fb1')).toEqual(['fb4'])
        expect(manager.getRdeps('fb3')).toEqual(['fb2'])
        expect(manager.getRdeps('fb4')).toEqual(['fb1'])
    })
})
