// Color utility functions used across components.

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export const rgbToHex = (r, g, b) => {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

export const lightenColor = (hex, amount = 0.7) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = Math.round(rgb.r + (255 - rgb.r) * amount)
  const g = Math.round(rgb.g + (255 - rgb.g) * amount)
  const b = Math.round(rgb.b + (255 - rgb.b) * amount)

  return rgbToHex(r, g, b)
}

export const darkenColor = (hex, amount = 0.3) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = Math.round(rgb.r * (1 - amount))
  const g = Math.round(rgb.g * (1 - amount))
  const b = Math.round(rgb.b * (1 - amount))

  return rgbToHex(r, g, b)
}

