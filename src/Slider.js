import React, { useRef, useCallback, useState } from 'react'
import { useGesture } from 'react-use-gesture'
import { useSprings, a, useSpring } from 'react-spring'

const styles = {
  navigation: {
    position: 'absolute',
    width: '100%',
    display: 'flex',
    bottom: '10px',
    justifyContent: 'space-around'
  },
  container: {
    position: 'relative',
    height: '100%',
    width: '100%',
    overflow: 'hidden'
  },
  item: { position: 'absolute', height: '100%', willChange: 'transform' },
  dotcontainer: {
    padding: '0.7rem 1rem',
    margin: '1rem',
    color: '#fff',
    display: 'flex',
    alignItems: 'center'
  },
  dot: {
    borderRadius: '99px',
    background: '#fff',
    width: '5px',
    height: '5px',
    margin: '.3rem',
    color: '#000'
  }
}

/**
 * Calculates a spring-physics driven infinite carousel
 *
 * @param {Array} items - display items
 * @param {Function} children - render child
 * @param {number} width - fixed item with
 * @param {number} visible - number of items that must be visible on screen
 */
export default function Carousel({ items, itemWidth = 'full', visible = 4, style, children, sensitivity = 1 }) {
  const windowWidth = itemWidth === 'full' ? window.innerWidth : itemWidth
  let width = itemWidth === 'full' ? windowWidth : itemWidth
  const idx = useCallback((x, l = items.length) => (x < 0 ? x + l : x) % l, [items])
  const getPos = useCallback((i, firstVis, firstVisIdx) => idx(i - firstVis + firstVisIdx), [idx])
  // Important only if specifyng item width separately, centers the element in the carousel
  const offset = itemWidth === 'full' ? 0 : (windowWidth - itemWidth) / 2
  const [springs, set] = useSprings(items.length, i => ({ x: (i < items.length - 1 ? i : -1) * width + offset }))
  const prev = useRef([0, 1])
  const index = useRef(0)
  const [active, setActive] = useState(1)
  const runSprings = useCallback(
    (y, vy, down, xDir, cancel, distance, xMove) => {
      // This decides if we move over to the next slide or back to the initial
      if (down && (distance > width / 2 || Math.abs(vy) > sensitivity)) {
        cancel((index.current = index.current + (xDir > 0 ? -1 : 1)))
      }
      if (index.current + 1 > items.length) {
        setActive((index.current % items.length) + 1)
      } else if (index.current < 0) {
        setActive(items.length + ((index.current + 1) % items.length))
      } else {
        setActive(index.current + 1)
      }

      // The actual scrolling value
      const finalY = index.current * width
      // Defines currently visible slides
      const firstVis = idx(Math.floor(finalY / width) % items.length)
      const firstVisIdx = vy < 0 ? items.length - visible - 1 : 1
      set(i => {
        const position = getPos(i, firstVis, firstVisIdx)
        const prevPosition = getPos(i, prev.current[0], prev.current[1])
        let rank = firstVis - (finalY < 0 ? items.length : 0) + position - firstVisIdx + (finalY < 0 && firstVis === 0 ? items.length : 0)
        return {
          // x is the position of each of our slides
          x: (-finalY % (width * items.length)) + width * rank + (down ? xMove : 0) + offset,
          // this defines if the movement is immediate
          // So when an item is moved from one end to the other we don't
          // see it moving
          immediate: vy < 0 ? prevPosition > position : prevPosition < position
        }
      })
      prev.current = [firstVis, firstVisIdx]
    },
    [idx, getPos, width, visible, set, items.length]
  )

  const bind = useGesture({
    onDrag: ({ offset: [x], vxvy: [vx], down, direction: [xDir], cancel, distance, movement: [xMove] }) => {
      vx && runSprings(-x, -vx, down, xDir, cancel, distance, xMove)
    }
  })

  return (
    <div {...bind()} style={{ ...style, ...styles.container, width }}>
      {springs.map(({ x, vel }, i) => (
        <a.div key={i} style={{ ...styles.item, width, x }} children={children(items[i], i)} />
      ))}
      <InstaCounter currentIndex={active} data={items} />
    </div>
  )
}

function InstaCounter({ currentIndex, data }) {
  const dots = []

  for (const [index] of data.entries()) {
    dots.push(<Dot key={index} active={currentIndex - 1 === index} />)
  }
  return (
    <div style={{ ...styles.navigation }}>
      <div style={{ ...styles.dotcontainer }}>{dots}</div>
    </div>
  )
}

function Dot({ active }) {
  const { transform, opacity } = useSpring({
    opacity: active ? 1 : 0.8,
    transform: active ? `scale(1.5)` : `scale(1)`,
    config: { mass: 5, tension: 500, friction: 80 }
  })
  return <a.div style={{ opacity: opacity.interpolate(o => o), transform, ...styles.dot }} />
}
