import {generateAvatarImgUrl, getAvatarText} from './avatar_generate'

// tslint:disable: no-magic-numbers
describe('avatar generator test', (): void => {
    it('get avatar text', (): void => {
        expect(getAvatarText('abc')).toBe('A')
        expect(getAvatarText(' Tom')).toBe('T')
        expect(getAvatarText(' 张三')).toBe('三')
        expect(getAvatarText('李四')).toBe('四')
        expect(getAvatarText('')).toBe('')
    })

    it('generate avatar image url', () => {
        const imgUrl = generateAvatarImgUrl('abc')
        const img = document.createElement('img')
        img.src = imgUrl
        document.body.append(img)
        const imgUrl2 = generateAvatarImgUrl('张袁')
        const img2 = document.createElement('img')
        img2.src = imgUrl2
        document.body.append(img2)
        expect(imgUrl.length).toBeGreaterThan(0)
    })
})
