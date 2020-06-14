import { writable } from 'svelte/store'
import ZingTouch from 'zingtouch/src/ZingTouch.js'

const initialIsTouch = localStorage.isTouch === 'true'

export const isTouch = writable(initialIsTouch)

const whenTouch = new Promise(resolve => {
  if (initialIsTouch) {
    resolve()
    return
  }

  const handleTouch = () => {
    removeEventListener('touchstart', handleTouch)
    localStorage.isTouch = true
    isTouch.set(true)
    resolve()
  }

  addEventListener('touchstart', handleTouch)
})

export const swipeMenu = (el, cb) => {
  const tolerance = 45
  let region

  whenTouch.then(() => {
    region = ZingTouch.Region(el, false, false)
    region.bind(el, 'swipe', e => {
      const {
        detail: {
          data: [{ currentDirection: dir } = {}],
        },
      } = e
      if (dir >= 360 - tolerance || dir <= tolerance) {
        cb(true)
      } else if (dir >= 180 - tolerance && dir <= 180 + tolerance) {
        cb(false)
      }
    })
  })

  return {
    destroy: () => {
      if (!region) return
      region.unbind(el, 'swipe')
    },
  }
}
