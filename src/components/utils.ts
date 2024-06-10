export type Dataset = {
  title: string
  rows: Row[]
}
export type Row = {
  label: string
  entries: Record<string, number>
}

const exampleDataset: Dataset = {
  title: 'Project Investments',
  rows: [{
    label: '2020',
    entries: {
      'Engineering': 0.3,
      'Marketing': 0.2,
      'Sales': 0.1,
      'Other': 0.4
    },
  }, {
    label: '2021',
    entries: {
      'Engineering': 0.8,
      'Marketing': 0.1,
      'Sales': 0.1,
      'Other': 0.4
    },
  }, {
    label: '2022',
    entries: {
      'Engineering': 0.2,
      'Marketing': 0.3,
      'Sales': 0.2,
      'Other': 0.7
    },
  }]
}



const stringToHash = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  // hash will be in range 0..4294967295
  return hash
}
const hashToNormalized01 = (hash: number) => {
  // >>> 0 ensures the result is an unsigned integer
  return (hash >>> 0) / 4294967295
}
const hueToColor = (hue: number) => {
  const h = hue
  const s = 0.5
  const l = 0.5
  return `hsla(${h * 360}, ${s * 100}%, ${l * 100}%, 0.5)`
}
const keyToColor = (key: string) => {
  const hash = stringToHash(key)
  const hue = hashToNormalized01(hash)
  return hueToColor(hue)
}

export {
	exampleDataset,
	stringToHash,
	hashToNormalized01,
	hueToColor,
	keyToColor
}